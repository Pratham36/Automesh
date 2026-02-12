"use server";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { groqChannel } from "@/inngest/channels/qroq";

export type AnthropicToken = Realtime.Token<typeof groqChannel, ["status"]>;

export async function fetchGroqRealtimeToken(): Promise<AnthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: groqChannel(),
    topics: ["status"],
  });
  return token;
}
