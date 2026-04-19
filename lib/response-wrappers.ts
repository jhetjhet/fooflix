import { FetchResponse } from "@/types";

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
