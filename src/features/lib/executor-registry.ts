import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../executions/types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { googleFormTriggerExecutor } from "../triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "../triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../executions/components/gemini/executor";
import { openAiExecutor } from "../executions/components/openai/executor";
import { AnthropicExecutor } from "../executions/components/anthropic/executor";
import { GroqExecutor } from "../executions/components/groq/executor";
import { discordExecutor } from "../executions/components/discord/executor";
import { slackExecutor } from "../executions/components/slack/executor";

// Create a proper type-safe registry with type assertions
export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: AnthropicExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.GROQ]: GroqExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }

  return executor;
};
