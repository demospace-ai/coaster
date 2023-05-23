import { useState } from "react";
import { consumeError } from "./errors";

type AsyncFunction<T = any, U = any> = (...args: U[]) => Promise<T>;

export function useMutation<T = any, U = any>(
  mutationFn: AsyncFunction<T, U>,
  opts: { onSuccess?: (data: T) => void; onError?: (err: Error) => void } = { onSuccess: () => {}, onError: () => {} },
) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [data, setData] = useState<T | undefined>();
  const mutate = async (...args: U[]) => {
    setIsLoading(true);
    try {
      const response = await mutationFn(...args);
      setIsSuccess(true);
      setData(response);
      setError(null);
      setIsFailed(false);
      opts.onSuccess?.(response);
    } catch (err) {
      consumeError(err);
      console.error(err);
      if (err instanceof Error) {
        setError(err);
        opts.onError?.(err);
      } else {
        const unknownError = new Error("Unknown error");
        setError(unknownError);
        opts.onError?.(unknownError);
      }
      setIsFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    error,
    isLoading,
    isSuccess,
    isFailed,
    data,
    reset: () => {
      setIsLoading(false);
      setIsSuccess(false);
      setIsFailed(false);
      setData(undefined);
      setError(null);
    },
  };
}
