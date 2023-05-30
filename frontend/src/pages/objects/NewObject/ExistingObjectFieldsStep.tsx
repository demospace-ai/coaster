import { Checkbox } from "@radix-ui/react-checkbox";
import { Button } from "src/components/button/Button";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { validateFields, Step } from "src/pages/objects/helpers";
import { ObjectFieldInput } from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";

export const ExistingObjectFields: React.FC<ObjectStepProps> = (props) => {
  const { state, setState } = props;
  const updateObjectField = (newObject: ObjectFieldInput, index: number) => {
    if (!state.objectFields) {
      // TODO: should not happen
      return;
    }

    setState({
      ...state,
      objectFields: state.objectFields.map((original, i) => {
        if (i === index) {
          return newObject;
        } else {
          return original;
        }
      }),
    });
  };

  const advance = () => {
    if (validateFields(state, setState)) {
      setState((state) => {
        return { ...state, step: Step.Finalize };
      });
    }
  };

  return (
    <div className="tw-h-full tw-w-full tw-text-center">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">
        {props.isUpdate ? "Update Object Fields" : "Object Fields"}
      </div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields.length > 0 ? (
          state.objectFields.map((objectField, i) => (
            <div key={objectField.name} className={mergeClasses("tw-mt-5 tw-mb-7 tw-text-left")}>
              <span className="tw-text-base tw-font-semibold">{objectField.name}</span>
              <div className="tw-flex tw-items-center tw-mt-2 tw-pb-1.5">
                <span className="">Omit?</span>
                <Checkbox
                  className="tw-ml-2 tw-h-4 tw-w-4 tw-"
                  checked={Boolean(objectField.omit)}
                  onCheckedChange={() => updateObjectField({ ...objectField, omit: !objectField.omit }, i)}
                  disabled={props.isUpdate}
                />
                <span className="tw-ml-4">Optional?</span>
                <Checkbox
                  className="tw-ml-2 tw-h-4 tw-w-4"
                  checked={Boolean(objectField.optional)}
                  onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)}
                  disabled={props.isUpdate}
                />
              </div>
              <Input
                className="tw-mb-2"
                value={objectField.display_name}
                setValue={(value) => updateObjectField({ ...objectField, display_name: value }, i)}
                placeholder="Display Name (optional)"
                label="Display Name"
              />
              <Input
                className="tw-mb-2"
                value={objectField.description}
                setValue={(value) => updateObjectField({ ...objectField, description: value }, i)}
                placeholder="Description (optional)"
                label="Description"
              />
            </div>
          ))
        ) : (
          <Loading />
        )}
      </div>
      <Button onClick={advance} className="tw-mt-6 tw-w-100 tw-h-10">
        Continue
      </Button>
    </div>
  );
};
