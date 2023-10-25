"use client";

import { consumeError } from "@coaster/utils";
import { useState } from "react";

type AsyncFunction<Data, Args> = (variables: Args) => Promise<Data>;

export type Mutation<Args = any> = {
  mutate: AsyncFunction<void, Args>;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  data: any;
  reset: () => void;
};

export type MutationOpts<Data = any> = { onSuccess?: (data: Data) => void; onError?: (err: Error) => void };

export function useMutation<Data = any | undefined, Args = any>(
  mutationFn: AsyncFunction<Data, Args>,
  opts: MutationOpts<Data> = {
    onSuccess: () => {},
    onError: () => {},
  },
): Mutation<Args> {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const mutate = async (variables: Args) => {
    setIsLoading(true);
    try {
      const response = await mutationFn(variables);
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
