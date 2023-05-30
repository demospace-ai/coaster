import { NewObjectState } from "src/pages/objects/helpers";

export type ObjectStepProps = {
  isUpdate: boolean;
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
};
