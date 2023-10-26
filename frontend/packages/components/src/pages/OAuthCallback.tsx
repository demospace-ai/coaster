import { getUserServer } from "@coaster/rpc/server";
import { OAuthCallbackInner } from "./OAuthCallback.client";

export async function OAuthCallback() {
  const user = await getUserServer();
  return <OAuthCallbackInner user={user} />;
}
