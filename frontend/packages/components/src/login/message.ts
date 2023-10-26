import { User } from "@coaster/rpc/common";

export enum MessageType {
  Done = "done",
}

export type LoginMessage = {
  type: MessageType.Done;
  user: User | undefined;
};
