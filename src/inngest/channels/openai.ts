import { channel, topic } from "@inngest/realtime";

export const OpenAi_CHANNEL_NAME = "openai-execution";

export const openAiChannel = channel(OpenAi_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
