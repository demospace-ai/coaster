"use client";

import { useUserContext } from "@coaster/components/src/auth/UserProviderClient";
import { Loading } from "@coaster/components/src/loading/Loading";
import { MessageType } from "@coaster/components/src/login/message";
import { useEffect } from "react";

export const OAuthCallback = () => {
  const user = useUserContext();
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: MessageType.Done, user });
      window.close();
    }
  });
  return <Loading />;
};
