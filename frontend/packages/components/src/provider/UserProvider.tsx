"use client";

import { UserContext } from "@coaster/rpc/client";
import { CheckSession, sendRequest } from "@coaster/rpc/common";
import { User } from "@coaster/types";
import { consumeError } from "@coaster/utils/client";
import { HttpError } from "@coaster/utils/common";
import { redirect } from "next/navigation";
import useSWR, { Fetcher } from "swr";

// Not exported - everywhere else should use useUserContext
function useUser() {
  const fetcher: Fetcher<User | undefined, {}> = async () => {
    try {
      const response = await sendRequest(CheckSession);
      return response.user;
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.code === 403) {
          redirect("/unauthorized");
        } else if (e.code === 401) {
          return undefined;
        }
      }

      // This is an unexpected error, so report it
      consumeError(e);
      return undefined;
    }
  };

  const { data, mutate, error, isLoading, isValidating } = useSWR({ CheckSession }, fetcher);
  return { user: data, mutate, error, loading: isLoading || isValidating };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};
