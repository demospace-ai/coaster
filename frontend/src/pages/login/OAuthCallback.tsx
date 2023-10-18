import { useEffect } from "react";
import { Loading } from "src/components/loading/Loading";
import { MessageType } from "src/pages/login/message";

export const OAuthCallback: React.FC = () => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: MessageType.Done });
      window.close();
    }
  });
  return <Loading></Loading>;
};
