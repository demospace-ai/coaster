import { H } from "highlight.run";
export class HttpError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function forceError(maybe: Error | unknown | string | null): Error | null {
  if (maybe instanceof Error) {
    return maybe;
  } else if (typeof maybe === "string") {
    return new Error(maybe);
  } else if (maybe === null) {
    return null;
  } else {
    try {
      const errStr = maybe?.toString() ?? JSON.stringify(maybe);
      return new Error(errStr);
    } catch (err) {
      return new Error("Unknown error");
    }
  }
}

export function consumeError(error: Error | unknown, opts: { message?: string } = {}) {
  let e;
  let payload;
  if (typeof error === "string") {
    e = new Error(error);
  } else if (error instanceof Error) {
    e = error;
  } else {
    e = new Error("Unknown error");
    try {
      const err = error?.toString() ?? JSON.stringify(error);
      payload = {
        error: err,
      };
    } catch (innerErr) {
      payload = {
        error: "Unknown error",
        innerErr: innerErr?.toString() ?? JSON.stringify(innerErr),
      };
    }
  }
  H.consumeError(e, opts.message, payload);
}
