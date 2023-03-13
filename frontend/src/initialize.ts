import { FabraMessage, MessageType } from "src/message/message";
import { CustomTheme } from "./utils/theme";

declare global {
    interface Window { fabra: any; }
}

let iframe: HTMLIFrameElement | null = null;
let iframeReady: boolean = false;
let customTheme: CustomTheme | undefined = undefined;

const initialize = ({ theme } : {  theme?: CustomTheme}) => {
    window.addEventListener("message", handleMessage);

    const frame = document.createElement("iframe");
    frame.setAttribute("src", "https://connect.fabra.io/connect.html");
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

    if ( theme ){
        customTheme = theme
    }

    iframe = frame;
};

const handleMessage = (n: MessageEvent<FabraMessage>) => {
    switch (n.data.messageType) {
        case MessageType.IFrameReady:
            // NOTE: iFrame is letting us know that initialization is complete, and user can call
            // open whenever they want now.
            if ( iframe && customTheme){
                const message: FabraMessage = { messageType: MessageType.Theme, theme: customTheme}
                iframe.contentWindow!.postMessage(message, "https://connect.fabra.io");
            }
            iframeReady = true;
            break;
        case MessageType.Close:
            return close();
    }
};

const open = (linkToken: string) => {
    if ( iframe && iframeReady ){
        iframe.contentWindow!.postMessage({ messageType: MessageType.LinkToken, linkToken }, "https://connect.fabra.io");
        iframe.style.display = 'block'
    } else {
        window.setTimeout(open, 100)
    }
};

const close = () => {
    if ( iframe ){
        iframe.style.display = 'none'
    }
};


window.fabra = {
    open: open,
    close: close,
    initialize,
};