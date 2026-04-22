import { FetchResponse } from "@/types";
import zod from "zod";

export function resOk<T>(data: T, status: number = 200): FetchResponse<T> {
  return {
    ok: true,
    data,
    error: null,
    status,
  };
}

export function resFail<T = null>({
    message,
    fields,
    status = 500,
}: {
    message: string,
    fields?: Record<string, string>,
    status?: number,
}): FetchResponse<T> {
  return {
    ok: false,
    data: null,
    error: { message, fields },
    status,
  };
}

export function withErrorHandling<Targs extends any[], TReturn>(
  action: (...args: Targs) => Promise<FetchResponse<TReturn>>,
): (...args: Targs) => Promise<FetchResponse<TReturn>> {
  return async (...args: Targs): Promise<FetchResponse<TReturn>> => {
    try {
      return await action(...args);
    } catch (error) {
      console.error("Error in action:", error);
      return resFail({
        message: "An unexpected error occurred",
        status: 500,
      });
    }
  };
}

export async function handleResponse<T>(
  response: Response,
  schema?: zod.ZodSchema,
): Promise<FetchResponse<T>> {
  if (!response.ok) {
    return resFail({
      message: `Request failed with status ${response.status}`,
      status: response.status,
    });
  }

  const jsonData = await response.json();

  if (schema) {
    const parseResult = schema.safeParse(jsonData);

    if (!parseResult.success) {
      console.error("Response validation error:", parseResult.error);
      return resFail({
        message: "Invalid response data",
        status: 500,
      });
    }

    return resOk(parseResult.data, response.status);
  }

  return resOk(jsonData, response.status);
}