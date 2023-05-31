import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Button, DeleteButton } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { FieldTypeSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { Step, validateFields } from "src/pages/objects/helpers";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { ObjectFieldInput } from "src/rpc/api";

export const NewObjectFields: React.FC<ObjectStepProps> = (props) => {
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

  const addObjectField = () => {
    if (!state.objectFields) {
      return;
    }

    setState({
      ...state,
      objectFields: [
        ...state.objectFields,
        {
          name: undefined,
          type: undefined,
          omit: false,
          optional: false,
        },
      ],
    });
  };

  const removeObjectField = (index: number) => {
    setState({
      ...state,
      objectFields: state.objectFields.filter((_, i) => i !== index),
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
        {props.isUpdate ? "Update Object Fields" : "Create Object Fields"}
      </div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields ? (
          <div>
            {state.objectFields.map((objectField, i) => (
              <div key={i} className="tw-mt-5 tw-mb-7 tw-text-left tw-p-4 tw-border tw-rounded-lg">
                <div className="tw-flex tw-items-center">
                  <span className="tw-font-semibold tw-text-lg tw-grow">Field {i + 1}</span>
                  <DeleteButton
                    className="tw-ml-auto tw-stroke-red-400 tw-p-2"
                    onClick={() => removeObjectField(i)}
                    disabled={props.isUpdate}
                  />
                </div>
                <div className="tw-flex tw-items-center tw-mt-3">
                  <span>Optional?</span>
                  <Checkbox
                    className="tw-ml-2 tw-h-4 tw-w-4"
                    checked={Boolean(objectField.optional)}
                    disabled={props.isUpdate}
                    onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)}
                  />
                </div>
                <div className="tw-flex tw-w-full tw-items-center tw-mb-2">
                  <div className="tw-w-full tw-mr-4">
                    <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                      <span>Field Key</span>
                      <Tooltip
                        placement="right"
                        label="Choose a valid JSON key that will be used when sending this field to your webhook."
                      >
                        <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                      </Tooltip>
                    </div>
                    <Input
                      value={objectField.name}
                      disabled={props.isUpdate}
                      setValue={(value) => updateObjectField({ ...objectField, name: value }, i)}
                      placeholder="Field Key"
                    />
                  </div>
                  <div>
                    <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                      <span>Field Type</span>
                      <Tooltip placement="right" label="Choose the type for this field.">
                        <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                      </Tooltip>
                    </div>
                    <FieldTypeSelector
                      className="tw-w-48 tw-m-0"
                      disabled={props.isUpdate}
                      type={objectField.type}
                      setFieldType={(value) => updateObjectField({ ...objectField, type: value }, i)}
                    />
                  </div>
                </div>
                <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                  <span>Display Name</span>
                  <Tooltip
                    placement="right"
                    label="Set a customer-facing name that your customers will see when setting up a sync."
                  >
                    <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                  </Tooltip>
                </div>
                <Input
                  className="tw-mb-2"
                  value={objectField.display_name}
                  setValue={(value) => updateObjectField({ ...objectField, display_name: value }, i)}
                  placeholder="Display Name (optional)"
                />
                <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
                  <span>Description</span>
                  <Tooltip
                    placement="right"
                    label="Add any extra information that will help your customers understand how to map their data to this object."
                  >
                    <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                  </Tooltip>
                </div>
                <Input
                  className="tw-mb-2"
                  value={objectField.description}
                  setValue={(value) => updateObjectField({ ...objectField, description: value }, i)}
                  placeholder="Description (optional)"
                />
              </div>
            ))}
            {/* No adding/removing fields on existing objects since this may break syncs */}
            {!props.isUpdate && (
              <Button className="tw-mt-7 tw-mx-auto tw-flex tw-items-center tw-mb-8" onClick={addObjectField}>
                <PlusCircleIcon className="tw-h-5 tw-mr-1.5 tw-stroke-2" />
                Add Object Field
              </Button>
            )}
          </div>
        ) : (
          <Loading className="tw-mt-5" />
        )}
      </div>
      <Button onClick={advance} className="tw-mt-8 tw-w-100 tw-h-10">
        Continue
      </Button>
    </div>
  );
};
