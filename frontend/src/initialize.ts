import { FabraMessage, MessageType } from "src/message/message";

declare global {
    interface Window { fabra: any; }
}

let iframeReady = false;

const initialize = () => {
    window.addEventListener("message", handleMessage);

    const frame = document.createElement("iframe");
    frame.setAttribute("src", "https://connect.fabra.io/connect.html");
    frame.style.position = "absolute";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.zIndex = "999";
    frame.style.visibility = "hidden";
    document.body.appendChild(frame);

    return frame;
};

const handleMessage = (n: MessageEvent<FabraMessage>) => {
    switch (n.data.messageType) {
        case MessageType.IFrameReady:
            iframeReady = true;
            break;
        case MessageType.Close:
            return close();
        default:
            console.log("unexpected message");
            break;
    }
};

const open = (linkToken: string) => {
    if (iframeReady) {
        frame.contentWindow!.postMessage({ messageType: MessageType.LinkToken, linkToken: linkToken });
        frame.style.visibility = "visible";
    } else {
        window.setTimeout(open, 100);
    }
};

const close = () => {
    frame.style.visibility = "hidden";
};

const frame = initialize();

window.fabra = {
    open: open,
    close: close,
};