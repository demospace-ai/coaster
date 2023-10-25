import { getUserServer } from "@coaster/rpc/server";
import { UserProviderClient } from "@coaster/components/src/auth/UserProviderClient";

export async function UserProvider({ children }: { children: React.ReactNode }) {
  const user = await getUserServer();
  return <UserProviderClient initialUser={user}>{children}</UserProviderClient>;
}
