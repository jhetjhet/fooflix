export type FetchResponse<T> =
  | {
      ok: true;
      data: T;
      error: null;
      status?: number;
    }
  | {
      ok: false;
      data: null;
      error: ResponseError;
      status?: number;
    };

export interface ResponseError {
  message?: string;
  fields?: Record<string, string>;
  code?: string;
}