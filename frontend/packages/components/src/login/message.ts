import { User } from "@coaster/types";

export enum MessageType {
  Done = "done",
}

export type LoginMessage = {
  type: MessageType.Done;
  user: User | undefined;
};
