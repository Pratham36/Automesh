"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { type NodeStatus, NodeStatusIndicator } from "@/components/react-flow/NodeStatusIndicator";

interface BaseTriggerNodeProps extends NodeProps {
    icon: string | LucideIcon;
    name: string;
    description?: string;
    children?: ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
};

export const BaseTriggerNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        children,
        status = "initial",
        onSettings,
        onDoubleClick
    }: BaseTriggerNodeProps) => {
        const { setNodes, setEdges } = useReactFlow();

        const handleDelete = () => {
            setNodes((currentNodes) => {
                const updateNodes = currentNodes.filter(
                    (node) => node.id !== id
                )
                return updateNodes;
            });
            setEdges((currentEdges) => {
                const updateEdges = currentEdges.filter(
                    (edge) => edge.source !== id && edge.target !== id
                )
                return updateEdges;
            });
        };


        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={handleDelete}
                onSettings={onSettings}
            >
                <NodeStatusIndicator
                    status={status}
                    variant="border"
                    className="rounded-l-2xl"
                >
                    <BaseNode status={status} onDoubleClick={onDoubleClick}
                        className="rounded-l-2xl relative group">
                        <BaseNodeContent>
                            {typeof Icon === 'string' ? (
                                <Image
                                    src={Icon}
                                    alt={name}
                                    width={16}
                                    height={16}
                                    className="group-hover:scale-110 transition-transform duration-200" />
                            ) : (
                                <Icon />
                            )}
                            {children}
                            <BaseHandle
                                id="source-1"
                                type="source"
                                position={Position.Right}
                            />
                        </BaseNodeContent>
                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>
        );
    });

BaseTriggerNode.displayName = "BaseTriggerNode";
