import { useNavigate, useParams } from "react-router-dom";
import { INITIAL_OBJECT_STATE } from "src/pages/objects/helpers";
import { NewObject } from "src/pages/objects/NewObject";
import { sendRequest } from "src/rpc/ajax";
import {
  Field,
  ObjectFieldInput,
  UpdateObject as UpdateObjectAPI,
  UpdateObjectFields,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "src/rpc/api";
import { useDestination, useObject } from "src/rpc/data";

export const UpdateObject: React.FC = () => {
  const navigate = useNavigate();
  const { objectID } = useParams<{ objectID: string }>();
  const { object: initObj } = useObject(Number(objectID));
  const { destination } = useDestination(Number(initObj?.destination_id));
  return (
    <div className="tw-pt-5 tw-pb-24 tw-px-10 tw-h-full tw-w-full tw-overflow-scroll">
      <NewObject
        destinationStepProps={{
          title: "Update Object",
          subtitle: "Change your object's configuration.",
          readonlyDestination: true,
        }}
        newObjectFieldsStepProps={{
          readonlyFieldKey: true,
          readonlyFieldType: true,
          disableAddNewFields: true,
          fieldKeyHelpMessage: "Changing the field key is currently not supported.",
          fieldKeyTypeHelpMessage: "Changing the field key type is currently not supported.",
        }}
        existingObjectFieldsStepProps={{}}
        finalStepProps={{
          successTitle: "Your object is updated.",
          saveButtonText: "Update Object",
          saveObjectConfigurations: async (newObj) => {
            // For object field update, we need to compute the change sets. New fields are added, existing fields are updated.
            // Removing fields is not supported as of 2023 May 24.
            const updatedFields = newObj.objectFields.filter((field) =>
              initObj?.object_fields?.find((initField) => initField.name === field.name),
            );
            await Promise.all([
              sendRequest<UpdateObjectRequest, UpdateObjectResponse>(UpdateObjectAPI, {
                objectID: Number(objectID),
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
                objectID: Number(objectID),
                object_fields: updatedFields as UpdateObjectFieldsRequest["object_fields"],
              }),
            ]);
          },
        }}
        initialObject={{
          ...INITIAL_OBJECT_STATE,
          displayName: initObj?.display_name,
          destination,
          targetType: initObj?.target_type,
          namespace: initObj?.namespace,
          tableName: initObj?.table_name,
          objectFields: initObj?.object_fields ?? [],
          syncMode: initObj?.sync_mode,
          cursorField: initObj?.cursor_field
            ? getFieldFromName(initObj?.object_fields, initObj.cursor_field)
            : undefined,
          endCustomerIdField: initObj?.end_customer_id_field
            ? getFieldFromName(initObj?.object_fields, initObj.end_customer_id_field)
            : undefined,
          frequency: initObj?.frequency,
          frequencyUnits: initObj?.frequency_units,
        }}
        onComplete={() => {
          navigate(`/objects/${objectID}`);
        }}
      ></NewObject>
    </div>
  );
};

const getFieldFromName = (objectFields: ObjectFieldInput[], fieldName: string): Field | undefined => {
  const matchingField = objectFields.find((predicate) => predicate.name === fieldName);
  if (!matchingField) {
    return undefined;
  }

  return {
    name: fieldName,
    type: matchingField.type!,
  };
};
