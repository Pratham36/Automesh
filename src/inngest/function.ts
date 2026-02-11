import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/lib/executor-registry";
import { httpRequestChannel } from "./channels/https-request";
import { manualTriggerChannel } from "./channels/maual.trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNode = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connection: true,
        },
      });
      return topologicalSort(workflow.nodes, workflow.connection);
    });
    //Initialize the context
    let context = event.data.initialContext || {};

    for (const node of sortedNode) {
      try {
        const executor = getExecutor(node.type as NodeType);
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          publish,
        });
      } catch (error) {
        throw new NonRetriableError(
          `Failed to execute node ${node.id} (${node.type}): ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return {
      workflowId,
      result: context,
    };
  },
);
