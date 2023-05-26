import { PlusCircleIcon } from "@heroicons/react/24/outline";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton, Button, DeleteButton } from "src/components/button/Button";
import { Checkbox } from "src/components/checkbox/Checkbox";
import { InfoIcon } from "src/components/icons/Icons";
import { Input, ValidatedDropdownInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useShowToast } from "src/components/notifications/Notifications";
import {
  DestinationSelector,
  FieldSelector,
  FieldTypeSelector,
  NamespaceSelector,
  TableSelector,
} from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import {
  initalizeFromExisting,
  INITIAL_OBJECT_STATE,
  initializeFromDestination,
  NewObjectState,
  Step,
  validateAll,
  validateDestination,
  validateDisplayName,
  validateFields,
} from "src/pages/objects/helpers";
import { sendRequest } from "src/rpc/ajax";
import {
  ConnectionType,
  CreateObject,
  CreateObjectRequest,
  Destination,
  FabraObject,
  Field,
  FieldType,
  FrequencyUnits,
  GetObjects,
  ObjectFieldInput,
  shouldCreateFields,
  SyncMode,
  TargetType,
  UpdateObject,
  UpdateObjectFields,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "src/rpc/api";
import { useSchema } from "src/rpc/data";
import { consumeError, forceError, HttpError } from "src/utils/errors";
import { useMutation } from "src/utils/queryHelpers";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";

type ObjectStepProps = {
  isUpdate: boolean;
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
};

export type NewObjectProps = {
  existingObject?: FabraObject;
  existingDestination?: Destination;
  onComplete?: () => void;
};

export const NewObject: React.FC<NewObjectProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const maybeDestination = location.state?.destination as Destination | undefined;
  const [state, setState] = useState<NewObjectState>(
    props.existingObject && props.existingDestination
      ? initalizeFromExisting(props.existingObject, props.existingDestination)
      : maybeDestination
      ? initializeFromDestination(maybeDestination)
      : INITIAL_OBJECT_STATE,
  );

  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName);
  const onComplete = props.onComplete
    ? props.onComplete
    : () => {
        navigate("/objects");
      };

  useEffect(() => {
    // No need to initialize object fields from the schema if we're updating an existing object
    if (props.existingObject) {
      return;
    }

    if (schema) {
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
  }, [schema, props.existingObject]);

  let content: React.ReactElement;
  let back: () => void;
  switch (state.step) {
    case Step.Initial:
      content = <DestinationSetup isUpdate={!!props.existingObject} state={state} setState={setState} />;
      // TODO: prompt if they want to exit here
      back = onComplete;
      break;
    case Step.ExistingFields:
      content = <ExistingObjectFields isUpdate={!!props.existingObject} state={state} setState={setState} />;
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
      content = <NewObjectFields isUpdate={!!props.existingObject} state={state} setState={setState} />;
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
      content = (
        <Finalize
          isUpdate={!!props.existingObject}
          existingObject={props.existingObject}
          state={state}
          setState={setState}
          onComplete={() => {
            props.onComplete ? props.onComplete() : onComplete();
          }}
        />
      );
      let prevStep: Step;
      if (shouldCreateFields(state.destination!.connection.connection_type, state.targetType!)) {
        prevStep = Step.CreateFields;
      } else {
        prevStep = Step.ExistingFields;
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
    <div className="tw-flex tw-flex-col tw-mb-10">
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
    </div>
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
          return { ...state, step: Step.ExistingFields };
        });
      }
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-100">
      <div className="tw-mb-1 tw-font-bold tw-text-xl tw-text-center">
        {props.isUpdate ? "Update Object" : "New Object"}
      </div>
      <div className="tw-text-center tw-mb-3">
        {props.isUpdate ? "Change your object's configuration." : "Enter your object configuration."}
      </div>
      <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-2">
        <span className="tw-font-medium">Display Name</span>
        <Tooltip placement="right" label="Pick a name for this object that your customers will see.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput
        autoFocus
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
        disabled={props.isUpdate}
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
      <DestinationTarget isUpdate={props.isUpdate} state={state} setState={setState} />
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

type FinalizeStepProps = {
  existingObject?: FabraObject;
  onComplete: () => void;
};

const Finalize: React.FC<ObjectStepProps & FinalizeStepProps> = (props) => {
  const { state, setState } = props;
  const showToast = useShowToast();

  const createNewObject = async (state: NewObjectState) => {
    const payload: CreateObjectRequest = {
      display_name: state.displayName!,
      destination_id: state.destination!.id,
      target_type: state.targetType!,
      namespace: state.namespace ?? "",
      table_name: state.tableName ?? "",
      sync_mode: state.syncMode!,
      cursor_field: state.cursorField && state.cursorField.name,
      primary_key: state.primaryKey && state.primaryKey.name,
      // @ts-ignore Need to fix this soon.
      end_customer_id_field: state.endCustomerIdField && state.endCustomerIdField.name,
      frequency: state.frequency!,
      frequency_units: state.frequencyUnits!,
      object_fields: state.objectFields,
    };
    await sendRequest(CreateObject, payload);
    mutate({ GetObjects: GetObjects }); // Tell SWRs to refetch event sets
  };

  const updateObject = async (newObj: NewObjectState) => {
    if (!props.existingObject) {
      consumeError(new Error("Cannot update object without existing object"));
      return;
    }

    // For object field update, we need to compute the change sets. New fields are added, existing fields are updated.
    // Removing fields is not supported as of 2023 May 24.
    const updatedFields = newObj.objectFields.filter((field) =>
      props.existingObject?.object_fields?.find((existingField) => existingField.name === field.name),
    );

    await Promise.all([
      sendRequest<UpdateObjectRequest, UpdateObjectResponse>(UpdateObject, {
        objectID: Number(props.existingObject?.id),
        display_name: newObj.displayName,
        destination_id: newObj.destination?.id,
        target_type: newObj.targetType,
        namespace: newObj.namespace,
        table_name: newObj.tableName,
        sync_mode: newObj.syncMode,
        cursor_field: newObj.cursorField?.name,
        end_customer_id_field: newObj.endCustomerIdField?.name,
        frequency: newObj.frequency,
        frequency_units: newObj.frequencyUnits,
      }),
      sendRequest<UpdateObjectFieldsRequest, UpdateObjectFieldsResponse>(UpdateObjectFields, {
        objectID: Number(props.existingObject?.id),
        object_fields: updatedFields as UpdateObjectFieldsRequest["object_fields"],
      }),
    ]);
  };

  const saveConfigurationMutation = useMutation(
    async () => {
      if (props.existingObject) {
        await updateObject(state);
      } else {
        await createNewObject(state);
      }
    },
    {
      onSuccess: () => {
        showToast("success", props.isUpdate ? "Successfully updated object!" : "Successfully created object!", 4000);
      },
      onError: (e) => {
        showToast("error", props.isUpdate ? "Failed to update object." : "Failed to create object.", 4000);
        const err = forceError(e);
        setState((state) => ({ ...state, createError: err?.message ?? "Failed to save object" }));
      },
    },
  );

  const saveConfiguration = () => {
    if (!validateAll(state, setState)) {
      console.error("Validation failed");
      return;
    }

    saveConfigurationMutation.mutate();
  };

  const fields: Field[] = state.objectFields
    ? state.objectFields
        .filter((field) => field.name && field.type && !field.omit && !field.optional)
        .map((field) => {
          return { name: field.name!, type: field.type! };
        })
    : [];

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
      <SyncModeSelector state={state} setState={setState} isUpdate={props.isUpdate} />
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
            disabled={!!props.existingObject}
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
            disabled={!!props.existingObject}
          />
        </>
      )}
      {state.syncMode !== undefined && (
        <>
          {state.destination?.connection.connection_type !== ConnectionType.Webhook && (
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
                disabled={!!props.existingObject}
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
      <Button onClick={saveConfiguration} className="tw-mt-10 tw-w-full tw-h-10">
        {saveConfigurationMutation.isLoading ? <Loading /> : props.existingObject ? "Update Object" : "Create Object"}
      </Button>
    </div>
  );
};

const DestinationTarget: React.FC<ObjectStepProps> = ({ state, setState, ...props }) => {
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

  if (!state.destination || state.destination.connection.connection_type === ConnectionType.Webhook) {
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
                disabled={props.isUpdate}
                className={mergeClasses(
                  "tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer",
                  props.isUpdate ? "tw-cursor-not-allowed" : "tw-cursor-pointer",
                )}
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
            disabled={props.isUpdate}
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
            disabled={props.isUpdate}
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

const SyncModeSelector: React.FC<ObjectStepProps> = ({ state, setState, isUpdate }) => {
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
                disabled={isUpdate}
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
