import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../executions/types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";

// Create a proper type-safe registry with type assertions
const executorRegistry = new Map<NodeType, NodeExecutor>([
  [NodeType.INITIAL, manualTriggerExecutor as NodeExecutor],
  [NodeType.MANUAL_TRIGGER, manualTriggerExecutor as NodeExecutor],
  [NodeType.HTTP_REQUEST, httpRequestExecutor as NodeExecutor],
]);

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry.get(type);
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }

  return executor;
};
