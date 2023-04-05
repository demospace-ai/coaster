import { FabraMessage, MessageType } from "src/message/message";
import { isProd } from "src/utils/env";
import { CustomTheme } from "./utils/theme";

const CONNECT_ROOT = isProd() ? "https://connect.fabra.io" : "http://localhost:3000";

declare global {
  interface Window { fabra: any; }
}

interface FabraConnectOptions {
  customTheme?: CustomTheme;
}

let iframe: HTMLIFrameElement | null = null;
let iframeReady: boolean = false;

const initialize = (options?: FabraConnectOptions) => {
  window.addEventListener("message", handleMessage);

  const frame = document.createElement("iframe");
  frame.setAttribute("src", CONNECT_ROOT + "/connect.html");
  frame.style.position = "absolute";
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.style.top = "0";
  frame.style.left = "0";
  frame.style.zIndex = "999";
  frame.style.background = "transparent";
  frame.style.display = "none";
  frame.style.colorScheme = "normal";
  document.body.appendChild(frame);

  if (options?.customTheme) {
    window.fabra.customTheme = options.customTheme;
  }

  iframe = frame;
};

const handleMessage = (n: MessageEvent<FabraMessage>) => {
  switch (n.data.messageType) {
    case MessageType.IFrameReady:
      // NOTE: iFrame is letting us know that initialization is complete, and user can call open.
      if (iframe && window.fabra.customTheme) {
        const message: FabraMessage = { messageType: MessageType.Theme, theme: window.fabra.customTheme };
        iframe.contentWindow!.postMessage(message, CONNECT_ROOT);
      }
      iframeReady = true;
      break;
    case MessageType.Close:
      return close();
  }
};

const open = (linkToken: string) => {
  if (iframe && iframeReady) {
    iframe.contentWindow!.postMessage({ messageType: MessageType.LinkToken, linkToken }, CONNECT_ROOT);
    iframe.style.display = "block";
  } else {
    window.setTimeout(() => open(linkToken), 100);
  }
};

const close = () => {
  if (iframe) {
    iframe.style.display = "none";
  }
};

// Special object to hold state and functions
window.fabra = {
  open: open,
  close: close,
  initialize,
};