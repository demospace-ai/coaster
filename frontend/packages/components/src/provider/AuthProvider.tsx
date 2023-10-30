"use client";

import { AuthContext } from "@coaster/rpc/client";
import { CheckSession, sendRequest } from "@coaster/rpc/common";
import { User } from "@coaster/types";
import { consumeError } from "@coaster/utils/client";
import { HttpError } from "@coaster/utils/common";
import { redirect, usePathname } from "next/navigation";
import { pathToRegexp } from "path-to-regexp";
import { useCallback, useMemo, useState } from "react";
import useSWR, { Fetcher } from "swr";

// Not exported - everywhere else should use useAuthContext
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

export const AuthProvider: React.FC<{ children: React.ReactNode; publicPaths: string[] }> = ({
  children,
  publicPaths,
}) => {
  const { user, loading } = useUser();
  const [loginOpen, setModalOpen] = useState(false);
  const [create, setCreate] = useState(false);
  const pathname = usePathname();

  const openLoginModal = useCallback((create?: boolean) => {
    if (create) {
      setCreate(true);
    }
    setModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    () => {
      setModalOpen(false);
      setCreate(false);
    };
  }, []);

  const contextObject = useMemo(
    () => ({
      user,
      loading,
      loginOpen,
      create,
      openLoginModal,
      closeLoginModal,
    }),
    [user, loading, loginOpen, create, openLoginModal, closeLoginModal],
  );

  const isPublicRoute = createRouteMatcher(publicPaths);
  if (!user && !loading && !isPublicRoute(pathname)) {
    return redirect("/login");
  }

  return <AuthContext.Provider value={contextObject}>{children}</AuthContext.Provider>;
};

const createRouteMatcher = (routes: string[]) => {
  const matchers = routes.map((route) => pathToRegexp(route));
  return (pathname: string) => matchers.some((matcher) => matcher.test(pathname));
};
