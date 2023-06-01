import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { Checkbox } from "src/components/checkbox/Checkbox";
import { InfoIcon } from "src/components/icons/Icons";
import { ValidatedComboInput, ValidatedDropdownInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useShowToast } from "src/components/notifications/Notifications";
import { FieldSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { NewObjectState, validateAll } from "src/pages/objects/helpers";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { sendRequest } from "src/rpc/ajax";
import {
  ConnectionType,
  CreateObject,
  CreateObjectRequest,
  FabraObject,
  Field,
  FrequencyUnits,
  GetObjects,
  SyncMode,
  UpdateObject,
  UpdateObjectFields,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "src/rpc/api";
import { forceError } from "src/utils/errors";
import { useMutation } from "src/utils/queryHelpers";
import { mutate } from "swr";

type FinalizeStepProps = {
  existingObject?: FabraObject;
  onComplete: () => void;
};

export const Finalize: React.FC<ObjectStepProps & FinalizeStepProps> = (props) => {
  const { state, setState } = props;
  const showToast = useShowToast();
  const navigate = useNavigate();
  const connectionType = props.state.destinationSetupData.destination?.connection.connection_type;

  const createNewObject = async (state: NewObjectState) => {
    const payload: CreateObjectRequest = {
      display_name: state.destinationSetupData.displayName!,
      destination_id: state.destinationSetupData.destination!.id,
      target_type: state.destinationSetupData.targetType!,
      namespace: state.destinationSetupData.namespace!,
      table_name: state.destinationSetupData.tableName!,
      sync_mode: state.syncMode!,
      cursor_field: state.cursorField && state.cursorField.name,
      primary_key: state.primaryKey && state.primaryKey.name,
      // @ts-ignore Need to fix this soon.
      end_customer_id_field: state.endCustomerIdField && state.endCustomerIdField.name,
      recurring: state.recurring,
      frequency: state.frequency!,
      frequency_units: state.frequencyUnits!,
      object_fields: state.objectFields,
    };
    const object = await sendRequest(CreateObject, payload);
    return object.object;
  };

  const updateObject = async (newObj: NewObjectState) => {
    if (!props.existingObject) {
      throw new Error("Cannot update object without existing object");
    }

    // For object field updates, we need to compute the change sets.
    // TODO: support adding and removing fields when updating objects
    const updatedFields = newObj.objectFields.filter((field) =>
      props.existingObject?.object_fields?.find((existingField) => existingField.name === field.name),
    );

    const [updateObjectResponse, _] = await Promise.all([
      sendRequest<UpdateObjectRequest, UpdateObjectResponse>(UpdateObject, {
        objectID: Number(props.existingObject?.id),
        display_name: newObj.destinationSetupData.displayName,
        destination_id: newObj.destinationSetupData.destination?.id,
        target_type: newObj.destinationSetupData.targetType,
        namespace: newObj.destinationSetupData.namespace,
        table_name: newObj.destinationSetupData.tableName,
        sync_mode: newObj.syncMode,
        cursor_field: newObj.cursorField?.name,
        end_customer_id_field: newObj.endCustomerIdField?.name,
        recurring: newObj.recurring,
        frequency: newObj.frequency,
        frequency_units: newObj.frequencyUnits,
      }),
      sendRequest<UpdateObjectFieldsRequest, UpdateObjectFieldsResponse>(UpdateObjectFields, {
        objectID: Number(props.existingObject?.id),
        object_fields: updatedFields as UpdateObjectFieldsRequest["object_fields"],
      }),
    ]);

    return updateObjectResponse.object;
  };

  const saveConfigurationMutation = useMutation(
    async () => {
      if (props.existingObject) {
        return await updateObject(state);
      } else {
        return await createNewObject(state);
      }
    },
    {
      onSuccess: (object) => {
        showToast("success", props.isUpdate ? "Successfully updated object!" : "Successfully created object!", 4000);
        navigate(`/objects/${object.id}`);
        mutate({ GetObjects: GetObjects });
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
          {connectionType === ConnectionType.DynamoDb && (
            <>
              <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5">
                <span className="tw-font-medium">End Customer ID</span>
              </div>
              <ValidatedComboInput
                className="tw-mt-3"
                loading={false}
                validated={true}
                disabled={!!props.existingObject}
                options={fields}
                selected={state.endCustomerIdField}
                setSelected={(value: Field) => {
                  console.log("field", value);
                  setState({ ...state, endCustomerIdField: value });
                }}
                getElementForDisplay={(value: Field) => value.name}
                noOptionsString={"No field available!"}
                placeholder={"Choose field"}
              />
            </>
          )}
          {connectionType !== ConnectionType.Webhook && connectionType !== ConnectionType.DynamoDb && (
            <>
              <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5">
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
                connection={state.destinationSetupData.destination?.connection}
                namespace={state.destinationSetupData.namespace}
                tableName={state.destinationSetupData.tableName}
                disabled={!!props.existingObject}
              />
            </>
          )}
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-6">
            <span className="tw-font-medium">Recurring?</span>
            <Checkbox
              className="tw-ml-2 tw-h-4 tw-w-4"
              checked={Boolean(state.recurring)}
              onCheckedChange={() => setState((state) => ({ ...state, recurring: !state.recurring }))}
            />
          </div>
          {state.recurring && (
            <>
              <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
                <span className="tw-font-medium">Frequency</span>
              </div>
              <ValidatedInput
                id="frequency"
                className="tw-w-100"
                min={props.state.frequencyUnits === FrequencyUnits.Minutes ? 30 : 1}
                type="number"
                value={props.state.frequency}
                setValue={(value) => setState({ ...props.state, frequency: value })}
                placeholder="Sync Frequency"
              />
              <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
                <span className="tw-font-medium">Frequency Units</span>
              </div>
              <ValidatedDropdownInput
                className="tw-mt-0 tw-w-100"
                options={Object.values(FrequencyUnits)}
                selected={props.state.frequencyUnits}
                setSelected={(value) => setState({ ...props.state, frequencyUnits: value })}
                loading={false}
                placeholder="Frequency Units"
                noOptionsString="nil"
                getElementForDisplay={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
            </>
          )}
        </>
      )}
      <Button onClick={saveConfiguration} className="tw-mt-10 tw-w-full tw-h-10">
        {saveConfigurationMutation.isLoading ? <Loading /> : props.existingObject ? "Update Object" : "Create Object"}
      </Button>
    </div>
  );
};

export const SyncModeSelector: React.FC<ObjectStepProps> = ({ state, setState, isUpdate }) => {
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
