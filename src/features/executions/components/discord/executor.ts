import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type DiscordData = {
  variablesName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: Message content is missing");
  }
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: webhook URL is missing");
      }
      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      if (!data.variablesName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: Variables name is missing");
      }
      return {
        ...context,
        [data.variablesName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });
    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
