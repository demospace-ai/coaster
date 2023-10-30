"use client";

import { useAuthContext } from "@coaster/rpc/client";
import { redirect } from "next/navigation";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
};
