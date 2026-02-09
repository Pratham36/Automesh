import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";

export const ManualTriggerNode = memo((props: NodeProps) => {
    return (
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name="When Clicking 'Execute workflow"
            // description="Trigger workflow manually"
            // status={nodestatus}
            onSettings={() => {
                // TODO: Implement settings dialog
            }}
            onDoubleClick={() => {
                // TODO: Implement test execution dialog
            }}

        />
    );
});

ManualTriggerNode.displayName = "ManualTriggerNode";