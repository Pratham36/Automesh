"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GroqDialog, GroqFormValues } from "./dialog";
import { fetchGroqRealtimeToken } from "./action";
import { AVAILABLE_GROQ } from "../avaliableModel";
import { GROQ_CHANNEL_NAME } from "@/inngest/channels/qroq";

type groqModel = (typeof AVAILABLE_GROQ)[number];

type groqNodeData = {
  variablesName?: string;
  credentialId?: string;
  model?: groqModel;
  systemPrompt?: string;
  userPrompt?: string;
};

type GroqNodeType = Node<groqNodeData>;

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GROQ_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGroqRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (value: GroqFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...value,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_GROQ[0]} ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

  return (
    <>
      <GroqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/groq.svg"
        name="Groq"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GroqNode.displayName = "GroqNode";
