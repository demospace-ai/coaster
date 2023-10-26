"use client";

import { useEffect } from "react";
import { useUserContext } from "../auth/UserProviderClient";
import { Loading } from "../loading/Loading";
import { MessageType } from "../login/message";

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
