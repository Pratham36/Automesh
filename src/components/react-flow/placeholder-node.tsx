"use client";

import React, { forwardRef, type ReactNode } from "react";
import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import { BaseNode } from "./base-node";

export type PlaceholderNodeProps = Partial<NodeProps> & {
  children?: ReactNode;
  onclick?: () => void;
};

export const PlaceholderNode = forwardRef<HTMLDivElement,
  PlaceholderNodeProps>(
    ({ children, onclick }, ref) => {
      return (
        <BaseNode
          ref={ref}
          className="w-auto h-auto border-dashed border-gray-400 bg-card p-4text-center text-gray-400 shadow-none cursor-pointer hover:border-gray-500 hover:bg-gray-50"
          onClick={onclick}
        >
          {children}
          <Handle
            type="target"
            style={{ visibility: "hidden" }}
            position={Position.Top}
            isConnectable={false}
          />
          <Handle
            type="source"
            style={{ visibility: "hidden" }}
            position={Position.Bottom}
            isConnectable={false}
          />
        </BaseNode>
      );
    });

PlaceholderNode.displayName = "PlaceholderNode";

