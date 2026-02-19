import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { telegramChannel } from "@/inngest/channels/telegram";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type TelegramData = {
  variablesName?: string;
  botToken?: string;
  chatId?: string;
  content?: string;
};

export const telegramExecutor: NodeExecutor<TelegramData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    telegramChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.content) {
    await publish(
      telegramChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Message content is missing");
  }
  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("telegram-webhook", async () => {
      if (!data.botToken) {
        await publish(
          telegramChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Telegram node: Bot token is missing");
      }
      if (!data.chatId) {
        await publish(
          telegramChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Telegram node: Chat ID is missing");
      }

      const telegramUrl = `https://api.telegram.org/bot${data.botToken}/sendMessage`;
      
      await ky.post(telegramUrl, {
        json: {
          chat_id: data.chatId,
          text: content.slice(0, 4096),
          parse_mode: "HTML",
        },
      });

      if (!data.variablesName) {
        await publish(
          telegramChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Telegram node: Variables name is missing");
      }
      return {
        ...context,
        [data.variablesName]: {
          messageContent: content.slice(0, 4096),
        },
      };
    });
    await publish(
      telegramChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      telegramChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
