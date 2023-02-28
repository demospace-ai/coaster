
export enum MessageType {
  IFrameReady = "fabra-iframe-ready",
  LinkToken = "fabra-link-token",
  Close = "fabra-window-close",
}

export type FabraMessage = {
  messageType: MessageType;
  linkToken: string;
};