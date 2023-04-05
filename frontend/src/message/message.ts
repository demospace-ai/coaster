import { CustomTheme } from "src/utils/theme";

export enum MessageType {
  IFrameReady = "fabra-iframe-ready",
  LinkToken = "fabra-link-token",
  Theme = "fabra-theme",
  Close = "fabra-window-close",
}

export type FabraMessage = {
  messageType: MessageType.IFrameReady;
} | {
  messageType: MessageType.LinkToken;
  linkToken: string;
} | {
  messageType: MessageType.Close;
} | {
  messageType: MessageType.Theme,
  theme: CustomTheme;
};