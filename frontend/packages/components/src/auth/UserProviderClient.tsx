"use client";

import { identifyUser } from "@coaster/rpc/client";
import { CheckSession, sendRequest } from "@coaster/rpc/common";
import { User } from "@coaster/types";
import { HttpError, consumeError } from "@coaster/utils";
import { redirect } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
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
  // We only call identify once for the initial user
  useEffect(() => {
    if (initialUser) {
      identifyUser(initialUser);
    }
  }, []);

  const { user } = useUser(initialUser);
  console.log("logged out" + JSON.stringify(user));

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
