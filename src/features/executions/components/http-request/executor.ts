import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as kyOptions } from "ky";

// Local Handlebars instance to avoid global registration
const createHandlebarsInstance = () => {
  const hb = Handlebars.create();
  hb.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new hb.SafeString(jsonString);
    return safeString;
  });
  return hb;
};

const handlebars = createHandlebarsInstance();

type HttpRequestData = {
  variablesName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError("Http Request node is not configured");
  }
  if (!data.variablesName) {
    throw new NonRetriableError("Variable Name is not configured");
  }
  if (!data.method) {
    throw new NonRetriableError("Method is not configured");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endpoint)(context);
    const method = data.method;

    const options: kyOptions = {
      method,
      timeout: 30000, // 30 second timeout
      retry: {
        limit: 2,
        statusCodes: [408, 429, 500, 502, 503, 504],
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body || "{}")(context);
      let parsedBody;
      try {
        parsedBody = JSON.parse(resolved);
      } catch (error) {
        throw new NonRetriableError(
          `Invalid JSON in request body: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
      options.body = JSON.stringify(parsedBody);
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    try {
      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
      return {
        ...context,
        [data.variablesName]: responsePayload,
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as {
          response: {
            status: number;
            statusText: string;
            text?: () => Promise<string>;
          };
        };
        const errorData = httpError.response.text
          ? await httpError.response.text().catch(() => "Unknown error")
          : "Unknown error";
        throw new NonRetriableError(
          `HTTP ${httpError.response.status}: ${httpError.response.statusText} - ${errorData}`,
        );
      }
      throw new NonRetriableError(
        `HTTP request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  });

  return result;
};

// {
//   "title": "foo",
//   "body": "bar",
//   "userId": 1
// }
// {
//   "title": "userid-{{todo.httpResponse.data.userId}}",
//   "body": "bar",
//   "userId": 1
// }
