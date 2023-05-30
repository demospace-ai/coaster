import { useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { ValidatedInput, ValidatedDropdownInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useShowToast } from "src/components/notifications/Notifications";
import { FieldSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SyncModeSelector } from "src/pages/objects/NewObject/DestinationSetupStep";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { NewObjectState, validateAll } from "src/pages/objects/helpers";
import { sendRequest } from "src/rpc/ajax";
import {
  FabraObject,
  CreateObjectRequest,
  CreateObject,
  UpdateObjectRequest,
  UpdateObjectResponse,
  UpdateObject,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectFields,
  GetObjects,
  Field,
  SyncMode,
  ConnectionType,
  FrequencyUnits,
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

  const createNewObject = async (state: NewObjectState) => {
    const payload: CreateObjectRequest = {
      display_name: state.displayName!,
      destination_id: state.destination!.id,
      target_type: state.targetType!,
      namespace: state.namespace!,
      table_name: state.tableName!,
      sync_mode: state.syncMode!,
      cursor_field: state.cursorField && state.cursorField.name,
      primary_key: state.primaryKey && state.primaryKey.name,
      // @ts-ignore Need to fix this soon.
      end_customer_id_field: state.endCustomerIdField && state.endCustomerIdField.name,
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

    // For object field update, we need to compute the change sets. New fields are added, existing fields are updated.
    // Removing fields is not supported as of 2023 May 24.
    const updatedFields = newObj.objectFields.filter((field) =>
      props.existingObject?.object_fields?.find((existingField) => existingField.name === field.name),
    );

    const [updateObjectResponse, _] = await Promise.all([
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
