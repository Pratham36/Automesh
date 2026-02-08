import { InitialNode } from "@/components/initial.node";
import { NodeType } from "@/types/node";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
