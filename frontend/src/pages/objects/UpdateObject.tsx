import { useNavigate, useParams } from "react-router-dom";
import { INITIAL_OBJECT_STATE, NewObject } from "src/pages/objects/NewObject";
import { sendRequest } from "src/rpc/ajax";
import {
  FieldType,
  UpdateObject as UpdateObjectAPI,
  UpdateObjectFields,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "src/rpc/api";
import { useDestination, useObject } from "src/rpc/data";

const tableHeaderStyle =
  "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle =
  "tw-whitespace-nowrap tw-left tw-overflow-hidden tw-py-4 tw-pl-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

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
            const newFields = newObj.objectFields.filter(
              (field) => !initObj?.object_fields?.find((initField) => initField.name === field.name),
            );
            const updatedFields = newObj.objectFields.filter((field) =>
              initObj?.object_fields?.find((initField) => initField.name === field.name),
            );
            sendRequestWith<UpdateObjectRequest, UpdateObjectResponse>({
              endpoint: UpdateObjectAPI,
              queryParams: { objectID: `${objectID}` },
              payload: {
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
              },
            });
            sendRequestWith<CreateObjectFieldsRequest, CreateObjectFieldsResponse>({
              endpoint: CreateObjectFields,
              payload: newFields as ObjectField[],
              queryParams: { objectID: `${objectID}` },
            });
            sendRequestWith<UpdateObjectFieldsRequest, UpdateObjectFieldsResponse>({
              endpoint: UpdateObjectFields,
              payload: updatedFields as ObjectField[],
              queryParams: { objectID: `${objectID}` },
            });
            await Promise.all([]);
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
          endCustomerIdField: initObj?.end_customer_id_field
            ? {
                name: initObj?.end_customer_id_field,
                type: initObj?.object_fields.find((predicate) => predicate.name === initObj?.end_customer_id_field)
                  ?.type as FieldType,
              }
            : undefined,
          frequency: initObj?.frequency,
          frequencyUnits: initObj?.frequency_units,
        }}
        onComplete={() => {
          navigate(`/object/${objectID}`);
        }}
      ></NewObject>
    </div>
  );
};
