"use client";

import { useUserContext } from "@coaster/rpc/client";
import { redirect } from "next/navigation";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserContext();
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
};
