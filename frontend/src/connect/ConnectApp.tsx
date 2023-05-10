import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { NewSync } from "src/connect/NewSync";
import { SyncRuns } from "src/connect/SyncRuns";
import { Syncs } from "src/connect/Syncs";
import { FabraMessage, MessageType } from "src/message/message";
import { CustomTheme } from "src/utils/theme";

let needsInit = true;

export const ConnectApp: React.FC = () => {
  // TODO: figure out how to prevent Redux from being used in this app
  const [linkToken, setLinkToken] = useState<string | undefined>(undefined);
  const [useContainer, setUseContainer] = useState<boolean>(false); // whether the iFrame is nested in a container element

  const handleInitTheme = (theme: CustomTheme) => {
    const root = document.querySelector<HTMLElement>(":root");
    if (root) {
      if (theme.colors?.primary?.base) {
        root.style.setProperty("--color-primary", theme.colors.primary.base);
      }
      if (theme.colors?.primary?.hover) {
        root.style.setProperty("--color-primary-hover", theme.colors.primary.hover);
      }
      if (theme.colors?.primary?.text) {
        root.style.setProperty("--color-primary-text", theme.colors.primary.text);
      }
    };
  };

  useEffect(() => {
    // Recommended way to run one-time initialization: https://beta.reactjs.org/learn/you-might-not-need-an-effect#initializing-the-application
    if (needsInit) {
      window.addEventListener("message", (message: MessageEvent<FabraMessage>) => {
        switch (message.data.messageType) {
          case MessageType.LinkToken:
            setLinkToken(message.data.linkToken);
            break;
          case MessageType.Configure:
            setUseContainer(message.data.useContainer);
            if (message.data.theme) {
              handleInitTheme(message.data.theme);
            }
            break;
          default:
            break;
        }
      });
      window.parent.postMessage({ messageType: MessageType.IFrameReady }, "*");
      needsInit = false;
    }
  }, []);

  // No close function if Connect is embedded into a container, since it isn't a popup
  const close = useContainer ? undefined : () => {
    window.parent.postMessage({ messageType: MessageType.Close }, "*");
  };

  if (!linkToken) {
    return (<Loading />);
  }

  // TODO: pull all child state out to a reducer or redux store here so state isn"t lost on navigation
  return (
    <div className="tw-fixed tw-bg-[rgb(0,0,0,0.2)] tw-w-full tw-h-full">
      {useContainer ?
        <div className="tw-fixed tw-bg-white tw-flex tw-flex-col tw-w-full tw-h-full tw-items-center">
          <Routes>
            <Route path="/*" element={<Syncs linkToken={linkToken} close={close} />} />
            <Route path="/sync/:syncID" element={<SyncRuns linkToken={linkToken} close={close} />} />
            <Route path="/newsync" element={<NewSync linkToken={linkToken} close={close} />} />
          </Routes>
        </div>
        :
        <div className="tw-fixed tw-bg-white tw-flex tw-flex-col tw-w-[70%] tw-h-[75%] tw-top-[50%] tw-left-1/2 -tw-translate-y-1/2 -tw-translate-x-1/2 tw-rounded-lg tw-shadow-modal tw-items-center">
          <Routes>
            <Route path="/*" element={<Syncs linkToken={linkToken} close={close} />} />
            <Route path="/sync/:syncID" element={<SyncRuns linkToken={linkToken} close={close} />} />
            <Route path="/newsync" element={<NewSync linkToken={linkToken} close={close} />} />
          </Routes>
        </div>
      }

    </div>
  );
};

