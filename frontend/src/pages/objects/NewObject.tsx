import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { Checkbox } from "src/components/checkbox/Checkbox";
import { InfoIcon } from "src/components/icons/Icons";
import { Input, ValidatedDropdownInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import {
  DestinationSelector,
  FieldSelector,
  FieldTypeSelector,
  NamespaceSelector,
  TableSelector,
} from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import {
  ConnectionType,
  CreateObject,
  CreateObjectRequest,
  Destination,
  Field,
  FieldType,
  FrequencyUnits,
  GetObjects,
  needsCursorField,
  needsEndCustomerId,
  needsPrimaryKey,
  ObjectFieldInput,
  Schema,
  shouldCreateFields,
  SyncMode,
  TargetType,
} from "src/rpc/api";
import { useSchema } from "src/rpc/data";
import { HttpError, consumeError } from "src/utils/errors";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";

enum Step {
  Initial,
  FieldMapping,
  CreateFields,
  Finalize,
}

type NewObjectState = {
  step: Step;
  displayName: string | undefined;
  destination: Destination | undefined;
  namespace: string | undefined;
  targetType: TargetType | undefined;
  tableName: string | undefined;
  syncMode: SyncMode | undefined;
  cursorField: Field | undefined;
  primaryKey: Field | undefined;
  endCustomerIdField: Field | undefined;
  frequency: number | undefined;
  frequencyUnits: FrequencyUnits | undefined;
  objectFields: ObjectFieldInput[];
  displayNameError: string | undefined;
  destinationError: string | undefined;
  fieldsError: string | undefined;
  cursorFieldError: string | undefined;
  endCustomerIdError: string | undefined;
  frequencyError: string | undefined;
  createError: string | undefined;
};

const INITIAL_OBJECT_STATE: NewObjectState = {
  step: Step.Initial,
  displayName: undefined,
  destination: undefined,
  namespace: undefined,
  targetType: undefined,
  tableName: undefined,
  syncMode: undefined,
  cursorField: undefined,
  primaryKey: undefined,
  endCustomerIdField: undefined,
  frequency: undefined,
  frequencyUnits: undefined,
  objectFields: [],
  displayNameError: undefined,
  destinationError: undefined,
  fieldsError: undefined,
  cursorFieldError: undefined,
  endCustomerIdError: undefined,
  frequencyError: undefined,
  createError: undefined,
};

type ObjectStepProps = {
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
};

const validateAll = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  return (
    validateDisplayName(state, setState) &&
    validateDestination(state, setState) &&
    validateFields(state, setState) &&
    state.syncMode !== undefined &&
    (!needsCursorField(state.syncMode) || validateCursorField(state, setState)) &&
    (!needsPrimaryKey(state.syncMode) || state.primaryKey !== undefined) &&
    (!needsEndCustomerId(state.targetType!) || state.endCustomerIdField !== undefined) &&
    validateFrequency(state, setState)
  );
};

const validateDisplayName = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.displayName === undefined || state.displayName.length <= 0) {
    setState((state) => {
      return {
        ...state,
        displayNameError: "Must set a display name",
      };
    });
    return false;
  }

  setState((state) => {
    return {
      ...state,
      displayNameError: undefined,
    };
  });
  return true;
};

const validateDestination = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.destination === undefined) {
    setState((state) => {
      return {
        ...state,
        destinationError: "Must select a destination",
      };
    });
    return false;
  }

  if (
    state.destination.connection.connection_type !== ConnectionType.Webhook &&
    state.destination.connection.connection_type !== ConnectionType.DemoDestination
  ) {
    if (state.targetType === undefined) {
      setState((state) => {
        return {
          ...state,
          destinationError: "Must select a target",
        };
      });
      return false;
    }

    if (state.targetType === TargetType.SingleExisting) {
      if (state.namespace === undefined || state.namespace.length <= 0) {
        setState((state) => {
          return {
            ...state,
            destinationError: "Must select a namespace",
          };
        });
        return false;
      }

      if (state.tableName === undefined || state.tableName.length <= 0) {
        setState((state) => {
          return {
            ...state,
            destinationError: "Must select a table name",
          };
        });
        return false;
      }
    }
  }

  setState((state) => {
    return {
      ...state,
      destinationError: undefined,
    };
  });
  return true;
};

const validateFields = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.objectFields === undefined || state.objectFields.length <= 0) {
    setState((state) => {
      return {
        ...state,
        fieldsError: "Must create at least one object field",
      };
    });
    return false;
  }

  for (const objectField of state.objectFields) {
    if (!objectField.name || objectField.name.length <= 0 || !objectField.type || objectField.type.length <= 0) {
      setState((state) => {
        return {
          ...state,
          fieldsError: "Must provide name and type for each object field",
        };
      });
      return false;
    }
  }

  setState((state) => {
    return {
      ...state,
      fieldsError: undefined,
    };
  });
  return true;
};

const validateCursorField = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  // TODO: allow using other types
  if (state.cursorField === undefined) {
    setState((state) => {
      return {
        ...state,
        cursorFieldError: "Must set cursor field",
      };
    });
    return false;
  }

  if (
    state.cursorField.type !== FieldType.Timestamp &&
    state.cursorField.type !== FieldType.DatetimeTz &&
    state.cursorField.type !== FieldType.DatetimeNtz &&
    state.cursorField.type !== FieldType.Date &&
    state.cursorField.type !== FieldType.Integer &&
    state.cursorField.type !== FieldType.Number
  ) {
    setState((state) => {
      return {
        ...state,
        cursorFieldError: "Cursor field must be an integer, number, timestamp, date, or datetime type.",
      };
    });
    return false;
  }

  setState((state) => {
    return {
      ...state,
      cursorFieldError: undefined,
    };
  });
  return true;
};

const validateFrequency = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.frequency === undefined) {
    setState((state) => {
      return { ...state, frequencyError: "Must set frequency" };
    });
    return false;
  }

  if (state.frequencyUnits === undefined) {
    setState((state) => {
      return { ...state, frequencyError: "Must set frequency units" };
    });
    return false;
  }

  return true;
};

export const NewObject: React.FC<{ onComplete: () => void }> = (props) => {
  const [state, setState] = useState<NewObjectState>(INITIAL_OBJECT_STATE);
  const [prevSchema, setPrevSchema] = useState<Schema | undefined>(undefined);
  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName);

  // Initialize object fields from schema
  if (schema && schema !== prevSchema) {
    setPrevSchema(schema);
    const objectFields = schema.map((field) => {
      // automatically omit end customer ID field
      return {
        name: field.name,
        type: field.type,
        omit: false,
        optional: false,
      };
    });
    setState((state) => {
      return {
        ...state,
        objectFields: objectFields,
      };
    });
  }

  let content: React.ReactElement;
  let back: () => void;
  switch (state.step) {
    case Step.Initial:
      content = <DestinationSetup state={state} setState={setState} />;
      // TODO: prompt if they want to exit here
      back = props.onComplete;
      break;
    case Step.FieldMapping:
      content = <ExistingObjectFields state={state} setState={setState} />;
      back = () =>
        setState({
          ...state,
          step: Step.Initial,
          displayNameError: undefined,
          destinationError: undefined,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
    case Step.CreateFields:
      content = <NewObjectFields state={state} setState={setState} />;
      back = () =>
        setState({
          ...state,
          step: Step.Initial,
          displayNameError: undefined,
          destinationError: undefined,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
    case Step.Finalize:
      content = <Finalize state={state} setState={setState} onComplete={props.onComplete} />;
      let prevStep: Step;
      if (shouldCreateFields(state.destination!.connection.connection_type, state.targetType!)) {
        prevStep = Step.CreateFields;
      } else {
        prevStep = Step.FieldMapping;
      }

      back = () =>
        setState({
          ...state,
          step: prevStep,
          displayNameError: undefined,
          destinationError: undefined,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
  }

  return (
    <>
      <BackButton onClick={back} />
      <div className="tw-flex tw-flex-col tw-w-[900px] tw-mt-8 tw-mb-24 tw-py-12 tw-px-10 tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center">
        {content}
        {state.displayNameError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.displayNameError}
          </div>
        )}
        {state.destinationError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.destinationError}
          </div>
        )}
        {state.fieldsError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.fieldsError}
          </div>
        )}
        {state.cursorFieldError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.cursorFieldError}
          </div>
        )}
        {state.frequencyError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.frequencyError}
          </div>
        )}
        {state.createError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.createError}
          </div>
        )}
      </div>
    </>
  );
};

export const DestinationSetup: React.FC<ObjectStepProps> = (props) => {
  const { state, setState } = props;

  const advance = () => {
    if (validateDisplayName(state, setState) && validateDestination(state, setState)) {
      if (shouldCreateFields(state.destination!.connection.connection_type, state.targetType!)) {
        setState((state) => {
          return { ...state, step: Step.CreateFields };
        });
      } else {
        setState((state) => {
          return { ...state, step: Step.FieldMapping };
        });
      }
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-100">
      <div className="tw-mb-1 tw-font-bold tw-text-xl tw-text-center">New Object</div>
      <div className="tw-text-center tw-mb-3">Enter your object configuration.</div>
      <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-2">
        <span className="tw-font-medium">Display Name</span>
        <Tooltip placement="right" label="Pick a name for this object that your customers will see.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput
        className="tw-w-100"
        value={state.displayName}
        setValue={(value) => {
          setState({ ...state, displayName: value });
        }}
        placeholder="Display Name"
      />
      <div className="tw-w-full  tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-3">
        <span className="tw-font-medium">Destination</span>
      </div>
      <DestinationSelector
        className="tw-mt-0 tw-w-100"
        validated={true}
        destination={state.destination}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            if (value.connection.connection_type === ConnectionType.Webhook) {
              // Just hardcode EndCustomerIDField and TargetType for webhooks— they don"t matter anyway
              setState({
                ...state,
                destination: value,
                namespace: undefined,
                tableName: undefined,
                targetType: TargetType.Webhook,
                endCustomerIdField: { name: "end_customer_id", type: FieldType.Integer },
                objectFields: [],
              });
            } else if (value.connection.connection_type === ConnectionType.DemoDestination) {
              setState({
                ...state,
                destination: value,
                namespace: undefined,
                tableName: undefined,
                targetType: TargetType.Webhook,
                endCustomerIdField: { name: "demo_destination_dummy_customer_id", type: FieldType.Integer },
                objectFields: [],
              });
            } else {
              setState({
                ...state,
                destination: value,
                namespace: undefined,
                tableName: undefined,
                endCustomerIdField: undefined,
                objectFields: [],
              });
            }
          }
        }}
      />
      <DestinationTarget state={state} setState={setState} />
      <Button onClick={advance} className="tw-mt-10 tw-w-full tw-h-10">
        Continue
      </Button>
    </div>
  );
};

const ExistingObjectFields: React.FC<ObjectStepProps> = (props) => {
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
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Fields</div>
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
                />
                <span className="tw-ml-4">Optional?</span>
                <Checkbox
                  className="tw-ml-2 tw-h-4 tw-w-4"
                  checked={Boolean(objectField.optional)}
                  onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)}
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
          <>
            asdfasdf
            <Loading />
          </>
        )}
      </div>
      <Button onClick={advance} className="tw-mt-6 tw-w-100 tw-h-10">
        Continue
      </Button>
    </div>
  );
};

const NewObjectFields: React.FC<ObjectStepProps> = (props) => {
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

  const advance = () => {
    if (validateFields(state, setState)) {
      setState((state) => {
        return { ...state, step: Step.Finalize };
      });
    }
  };

  return (
    <div className="tw-h-full tw-w-full tw-text-center">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Fields</div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields ? (
          <div>
            {state.objectFields.map((objectField, i) => (
              <div key={i} className="tw-mt-5 tw-mb-7 tw-text-left tw-p-4 tw-border tw-rounded-lg">
                <span className="tw-font-semibold tw-text-lg">Field {i + 1}</span>
                <div className="tw-flex tw-items-center tw-mt-3">
                  <span>Optional?</span>
                  <Checkbox
                    className="tw-ml-2 tw-h-4 tw-w-4"
                    checked={Boolean(objectField.optional)}
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
            <Button className="tw-mt-7 tw-mx-auto tw-flex tw-items-center" onClick={addObjectField}>
              <PlusCircleIcon className="tw-h-5 tw-mr-1.5 tw-stroke-2" />
              Add Object Field
            </Button>
          </div>
        ) : (
          <>
            adsfadsf
            <Loading className="tw-mt-5" />
          </>
        )}
      </div>
      <Button onClick={advance} className="tw-mt-16 tw-w-100 tw-h-10">
        Continue
      </Button>
    </div>
  );
};

const Finalize: React.FC<ObjectStepProps & { onComplete: () => void }> = (props) => {
  const { state, setState } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [createObjectSuccess, setCreateObjectSuccess] = useState<boolean | null>(null);
  const createNewObject = async () => {
    setLoading(true);

    if (!validateAll(state, setState)) {
      setLoading(false);
      return;
    }

    const payload: CreateObjectRequest = {
      display_name: state.displayName!,
      destination_id: state.destination!.id,
      target_type: state.targetType!,
      namespace: state.namespace!,
      table_name: state.tableName!,
      sync_mode: state.syncMode!,
      cursor_field: state.cursorField && state.cursorField.name,
      primary_key: state.primaryKey && state.primaryKey.name,
      end_customer_id_field: state.endCustomerIdField!.name,
      frequency: state.frequency!,
      frequency_units: state.frequencyUnits!,
      object_fields: state.objectFields!,
    };

    try {
      await sendRequest(CreateObject, payload);
      mutate({ GetObjects: GetObjects }); // Tell SWRs to refetch event sets
      setCreateObjectSuccess(true);
    } catch (e) {
      setCreateObjectSuccess(false);
      if (e instanceof HttpError) {
        const createError = e.message;
        setState((state) => {
          return { ...state, createError };
        });
      }
      consumeError(e);
    }

    setLoading(false);
  };

  const fields: Field[] = state.objectFields
    ? state.objectFields
        .filter((field) => field.name && field.type && !field.omit && !field.optional)
        .map((field) => {
          return { name: field.name!, type: field.type! };
        })
    : [];

  if (createObjectSuccess) {
    return (
      <div>
        <div className="tw-mt-10 tw-text-center tw-font-bold tw-text-lg">
          🎉 Congratulations! Your object is set up. 🎉
        </div>
        <Button className="tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32" onClick={props.onComplete}>
          Done
        </Button>
      </div>
    );
  }
  let recommendedCursor = <></>;
  switch (state.syncMode!) {
    case SyncMode.IncrementalAppend:
      recommendedCursor = (
        <>
          For <span className="tw-px-1 tw-bg-black tw-font-mono">incremental_append</span> syncs, you should use an{" "}
          <span className="tw-px-1 tw-bg-black tw-font-mono">created_at</span> field.
        </>
      );
      break;
    case SyncMode.IncrementalUpdate:
      recommendedCursor = (
        <>
          For <span className="tw-px-1 tw-bg-black tw-font-mono">incremental_update</span> syncs, you should use an{" "}
          <span className="tw-px-1 tw-bg-black tw-font-mono">updated_at</span> field.
        </>
      );
      break;
    case SyncMode.FullOverwrite:
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-100">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Settings</div>
      <div className="tw-text-center tw-mb-3">Enter default settings for object syncs.</div>
      <SyncModeSelector state={state} setState={setState} />
      {[SyncMode.IncrementalAppend, SyncMode.IncrementalUpdate].includes(state.syncMode!) && (
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Cursor Field</span>
            <Tooltip
              placement="right"
              label={
                <>
                  Cursor field is usually a timestamp. This lets Fabra know what data has changed since the last sync.{" "}
                  {recommendedCursor}
                </>
              }
              maxWidth={400}
              interactive
            >
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </div>
          <FieldSelector
            className="tw-mt-0 tw-w-100"
            field={state.cursorField}
            setField={(value: Field) => {
              setState({ ...state, cursorField: value });
            }}
            placeholder="Cursor Field"
            label="Cursor Field"
            noOptionsString="No Fields Available!"
            predefinedFields={fields}
            validated={true}
            valid={state.cursorFieldError !== undefined ? false : undefined}
          />
        </>
      )}
      {[SyncMode.IncrementalUpdate].includes(state.syncMode!) && (
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Primary Key</span>
            <Tooltip
              placement="right"
              label="Primary key is usually an ID field. This lets Fabra know which existing rows in the target to update when they change."
              maxWidth={400}
            >
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </div>
          <FieldSelector
            className="tw-mt-0 tw-w-100"
            field={state.primaryKey}
            setField={(value: Field) => {
              setState({ ...state, primaryKey: value });
            }}
            placeholder="Primary Key"
            noOptionsString="No Fields Available!"
            validated={true}
            predefinedFields={fields}
          />
        </>
      )}
      {state.syncMode !== undefined && (
        <>
          {state.destination?.connection.connection_type !== ConnectionType.Webhook &&
            state.destination?.connection.connection_type !== ConnectionType.DemoDestination && (
              <>
                <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
                  <span className="tw-font-medium">End Customer ID</span>
                </div>
                <FieldSelector
                  className="tw-mt-0 tw-w-100"
                  field={state.endCustomerIdField}
                  setField={(value: Field) => {
                    setState({ ...state, endCustomerIdField: value });
                  }}
                  placeholder="End Customer ID Field"
                  noOptionsString="No Fields Available!"
                  validated={true}
                  connection={state.destination?.connection}
                  namespace={state.namespace}
                  tableName={state.tableName}
                />
              </>
            )}
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Frequency</span>
          </div>
          <ValidatedInput
            id="frequency"
            className="tw-w-100"
            min={props.state.frequencyUnits === FrequencyUnits.Minutes ? 30 : 1}
            type="number"
            value={props.state.frequency}
            setValue={(value) => props.setState({ ...props.state, frequency: value })}
            placeholder="Sync Frequency"
          />
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Frequency Units</span>
          </div>
          <ValidatedDropdownInput
            className="tw-mt-0 tw-w-100"
            options={Object.values(FrequencyUnits)}
            selected={props.state.frequencyUnits}
            setSelected={(value) => props.setState({ ...props.state, frequencyUnits: value })}
            loading={false}
            placeholder="Frequency Units"
            noOptionsString="nil"
            getElementForDisplay={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
        </>
      )}
      <Button onClick={() => createNewObject()} className="tw-mt-10 tw-w-full tw-h-10">
        {loading ? <Loading /> : "Create Object"}
      </Button>
    </div>
  );
};

const DestinationTarget: React.FC<ObjectStepProps> = ({ state, setState }) => {
  type TargetOption = {
    type: TargetType;
    title: string;
    description: string;
  };
  const targets: TargetOption[] = [
    {
      type: TargetType.SingleExisting,
      title: "Single Existing Table",
      description:
        "Data from all of your customers will be stored in a single existing table, with an extra ID column to distinguish between customers.",
    },
    // TODO
    // {
    //   type: TargetType.SingleNew,
    //   title: "Single New Table",
    //   description: "Data from all of your customers will be stored in a single new table, with an extra ID column to distinguish between customers."
    // },
    // {
    //   type: TargetType.TablePerCustomer,
    //   title: "Table Per Customer",
    //   description: "Data from each of your customers will be stored in a separate table in your destination. The name of the table will include the customer's ID as a suffix."
    // },
  ];

  if (
    !state.destination ||
    state.destination.connection.connection_type === ConnectionType.Webhook ||
    state.destination.connection.connection_type === ConnectionType.DemoDestination
  ) {
    return <></>;
  }

  return (
    <div className="tw-mt-5">
      <label className="tw-font-medium">Target</label>
      <p className="tw-text-slate-600">Where should Fabra load the data in your destination?</p>
      <fieldset className="tw-mt-4">
        <legend className="tw-sr-only">Target</legend>
        <div className="tw-space-y-4 tw-flex tw-flex-col">
          {targets.map((target) => (
            <div key={String(target.type)} className="tw-flex tw-items-center">
              <input
                id={String(target.type)}
                name="target"
                type="radio"
                checked={state.targetType === target.type}
                value={target.type}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setState({ ...state, targetType: e.target.value as TargetType })
                }
                className="tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer"
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(target.type)} className="tw-text-sm tw-cursor-pointer">
                  {target.title}
                </label>
                <Tooltip label={target.description} placement="top-start">
                  <InfoIcon className="tw-ml-1.5 tw-h-3 tw-fill-slate-400" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      {state.targetType === TargetType.SingleExisting && (
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Namespace</span>
          </div>
          <NamespaceSelector
            className="tw-mt-0 tw-w-100"
            validated={true}
            connection={state.destination?.connection}
            namespace={state.namespace}
            setNamespace={(value: string) => {
              if (value !== state.namespace) {
                setState({
                  ...state,
                  namespace: value,
                  tableName: undefined,
                  endCustomerIdField: undefined,
                  objectFields: [],
                });
              }
            }}
            noOptionsString="No Namespaces Available! (Choose a data source)"
          />
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-3">
            <span className="tw-font-medium">Table</span>
          </div>
          <TableSelector
            className="tw-mt-0 tw-w-100"
            connection={state.destination?.connection}
            namespace={state.namespace}
            tableName={state.tableName}
            setTableName={(value: string) => {
              if (value !== state.tableName) {
                setState({ ...state, tableName: value, endCustomerIdField: undefined, objectFields: [] });
              }
            }}
            noOptionsString="No Tables Available! (Choose a namespace)"
            validated={true}
          />
        </>
      )}
    </div>
  );
};

const SyncModeSelector: React.FC<ObjectStepProps> = ({ state, setState }) => {
  type SyncModeOption = {
    mode: SyncMode;
    title: string;
    description: string;
  };
  const syncModes: SyncModeOption[] = [
    {
      mode: SyncMode.FullOverwrite,
      title: "Full Overwrite",
      description: "Fabra will overwrite the entire target table on every sync.",
    },
    {
      mode: SyncMode.IncrementalAppend,
      title: "Incremental Append",
      description: "Fabra will append any new rows since the last sync to the existing target table.",
    },
    // TODO
    // {
    //   mode: SyncMode.IncrementalUpdate,
    //   title: "Incremental Update",
    //   description: "Fabra will add new rows and update any modified rows since the last sync."
    // },
  ];
  return (
    <div className="tw-mt-5">
      <label className="tw-font-medium">Sync Mode</label>
      <p className="tw-text-slate-600">How should Fabra load the data in your destination?</p>
      <fieldset className="tw-mt-4">
        <legend className="tw-sr-only">Sync Mode</legend>
        <div className="tw-space-y-4 tw-flex tw-flex-col">
          {syncModes.map((syncMode) => (
            <div key={String(syncMode.mode)} className="tw-flex tw-items-center">
              <input
                id={String(syncMode.mode)}
                name="syncmode"
                type="radio"
                checked={state.syncMode === syncMode.mode}
                value={syncMode.mode}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setState({ ...state, syncMode: e.target.value as SyncMode })
                }
                className="tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer"
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(syncMode.mode)} className="tw-text-sm tw-cursor-pointer">
                  {syncMode.title}
                </label>
                <Tooltip label={syncMode.description} placement="top-start">
                  <InfoIcon className="tw-ml-1.5 tw-h-3 tw-fill-slate-400" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
