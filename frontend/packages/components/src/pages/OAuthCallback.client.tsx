"use client";

import { User } from "@coaster/types";
import { useEffect } from "react";
import { Loading } from "../loading/Loading";
import { MessageType } from "../login/message";

export const OAuthCallbackInner: React.FC<{ user: User | undefined }> = (user) => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: MessageType.Done, user });
      window.close();
    }
  }, [user]);

  return <Loading />;
};
