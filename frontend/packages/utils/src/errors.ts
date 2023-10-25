export class HttpError extends Error {
  readonly code: number;
  readonly statusText: string;

  constructor(code: number, statusText: string, message: string) {
    super(message);
    this.code = code;
    this.statusText = statusText;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/** Tries its best to turn something into an Error. */
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

export function forceErrorMessage(maybe: Error | unknown | string | null): string {
  const error = forceError(maybe);
  if (error) {
    return error.message;
  } else {
    return "Unknown error";
  }
}
