import { UserProviderClient } from "@coaster/rpc/client";
import { getUserServer } from "@coaster/rpc/server";

export async function UserProvider({ children }: { children: React.ReactNode }) {
  const user = await getUserServer();
  return <UserProviderClient initialUser={user}>{children}</UserProviderClient>;
}
