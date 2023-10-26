import { getUserServer } from "@coaster/rpc/server";
import { redirect } from "next/navigation";

export default async function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = await getUserServer();
  console.log("user", user);
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
