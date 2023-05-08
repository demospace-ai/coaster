import { FabraMessage, MessageType } from "src/message/message";
import { isProd } from "src/utils/env";
import { CustomTheme } from "src/utils/theme";

const CONNECT_ROOT = isProd() ? "https://connect.fabra.io" : "http://localhost:3000";

declare global {
  interface Window { fabra: any; }
}

interface FabraConnectOptions {
  customTheme?: CustomTheme;
  containerID?: string;
}

let iframe: HTMLIFrameElement | null = null;
let iframeReady: boolean = false;
let useContainer: boolean = false;

// exported for Preview page
export const initialize = (options?: FabraConnectOptions) => {
  if (window.fabra.initialized || document.querySelectorAll("#fabra-connect-iframe").length > 0) {
    return;
  }

  window.addEventListener("message", handleMessage);

  const frame = document.createElement("iframe");
  frame.id = "fabra-connect-iframe";
  frame.setAttribute("src", CONNECT_ROOT + "/connect.html");
  frame.style.position = "absolute";
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.style.top = "0";
  frame.style.left = "0";
  frame.style.zIndex = "999";
  frame.style.display = "none";
  frame.style.colorScheme = "light";

  let frameRoot = document.body;
  if (options?.containerID !== undefined) {
    const container = document.getElementById(options.containerID);
    if (container !== null) {
      useContainer = true;
      frameRoot = container;
      frame.style.position = "static";
    }
  }

  frameRoot.appendChild(frame);

  if (options?.customTheme) {
    window.fabra.customTheme = options.customTheme;
  }

  iframe = frame;
  window.fabra.initialized = true;
};

// Exported for Preview page
export const updateTheme = (customTheme: CustomTheme) => {
  if (iframe && iframeReady) {
    const message: FabraMessage = { messageType: MessageType.Configure, theme: customTheme, useContainer: useContainer };
    iframe.contentWindow!.postMessage(message, CONNECT_ROOT);
  } else {
    window.setTimeout(() => updateTheme(customTheme), 100);
  }
};

const handleMessage = (messageEvent: MessageEvent<FabraMessage>) => {
  switch (messageEvent.data.messageType) {
    case MessageType.IFrameReady:
      // NOTE: iFrame is letting us know that initialization is complete, and user can call open.
      if (iframe && window.fabra.customTheme) {
        const message: FabraMessage = { messageType: MessageType.Configure, theme: window.fabra.customTheme, useContainer: useContainer };
        iframe.contentWindow!.postMessage(message, CONNECT_ROOT);
      }
      iframeReady = true;
      break;
    case MessageType.Close:
      return close();
    default:
      break;
  }
};

export const open = (linkToken: string) => {
  if (iframe && iframeReady) {
    iframe.contentWindow!.postMessage({ messageType: MessageType.LinkToken, linkToken }, CONNECT_ROOT);
    iframe.style.display = "block";
  } else {
    window.setTimeout(() => open(linkToken), 100);
  }
};

export const close = () => {
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