import { UserProviderClient } from "@coaster/rpc/client";

export async function UserProvider({ children }: { children: React.ReactNode }) {
  return <UserProviderClient>{children}</UserProviderClient>;
}
