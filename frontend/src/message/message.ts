
export enum MessageType {
  IFrameReady,
  LinkToken,
  Close,
}

export type FabraMessage = {
  messageType: MessageType;
  linkToken: string;
};