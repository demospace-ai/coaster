import { CustomTheme } from "src/utils/theme";

export enum MessageType {
  IFrameReady = "fabra-iframe-ready",
  Initialize = "fabra-initialize",
  Close = "fabra-window-close",
}

export type FabraMessage = {
  messageType: MessageType.IFrameReady;
} | {
  messageType: MessageType.Initialize
  linkToken: string;
  theme?: CustomTheme
} | {
  messageType: MessageType.Close
};