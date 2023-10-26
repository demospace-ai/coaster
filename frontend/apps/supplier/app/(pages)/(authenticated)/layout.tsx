"use client";

import { useUserContext } from "@coaster/rpc/client";
import { redirect } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  // TODO: this doesn't work
  const { user } = useUserContext();
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
