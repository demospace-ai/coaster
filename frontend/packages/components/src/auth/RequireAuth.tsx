import { getUserServer } from "@coaster/rpc/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export async function RequireAuth({ children }: { children: ReactNode }) {
  const user = await getUserServer();
  if (user) {
    return <>{children}</>;
  } else {
    redirect("/login");
  }
}
