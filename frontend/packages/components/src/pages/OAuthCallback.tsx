"use client";

import { useEffect } from "react";
import { Loading } from "../loading/Loading";
import { MessageType } from "../login/message";

export async function OAuthCallback() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: MessageType.Done });
      window.close();
    }
  }, []);

  return <Loading />;
}
