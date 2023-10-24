"use client";

import { CheckSession, User, sendRequest } from "@coaster/rpc/common";
import { HttpError, consumeError } from "@coaster/utils";
import { redirect } from "next/navigation";
import { createContext, useContext } from "react";
import useSWR, { Fetcher } from "swr";

// Intentionally not exported. Server components should use getUser and client components should use useUserContext
function useUser(initialUser: User | undefined) {
  const fetcher: Fetcher<User | undefined, {}> = async () => {
    try {
      const checkSessionResponse = await sendRequest(CheckSession);
      return checkSessionResponse.user;
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
    }
  };
  const { data, mutate, error, isLoading, isValidating } = useSWR({ CheckSession }, fetcher, {
    fallbackData: initialUser,
  });
  return { user: data, mutate, error, loading: isLoading || isValidating };
}

// We use context so that we can populate the initial user from the server-side fetch
const UserContext = createContext<User | undefined>(undefined);
export const useUserContext = () => useContext(UserContext);
export const UserProviderClient: React.FC<{ initialUser: User | undefined; children: React.ReactNode }> = ({
  initialUser,
  children,
}) => {
  const { user } = useUser(initialUser);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
