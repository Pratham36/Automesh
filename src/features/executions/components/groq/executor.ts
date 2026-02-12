import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { AVAILABLE_GROQ } from "../avaliableModel";
import { groqChannel } from "@/inngest/channels/qroq";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});
type GroqModel = (typeof AVAILABLE_GROQ)[number];

type GroqData = {
  variablesName?: string;
  credentialId?: string;
  model?: GroqModel;
  systemPrompt?: string;
  userPrompt?: string;
};

export const GroqExecutor: NodeExecutor<GroqData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    groqChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variablesName) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Groq node: Variables name is missing");
  }

  if (!data.credentialId) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Groq node: Variables name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Groq node: User Prompt is missing");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // Fetch credentials that user selected
  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
  });
  if (!credential) {
    throw new NonRetriableError("Groq node: Credential not found");
  }

  const groq = createGroq({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("groq-generate-text", generateText, {
      model: groq(data.model || AVAILABLE_GROQ[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      groqChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return {
      ...context,
      [data.variablesName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      groqChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
