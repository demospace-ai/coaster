import { useCallback, useState } from "react";
import {
  DestinationSetupBigQueryFormType,
  DestinationSetupDynamoDbFormType,
  DestinationSetupFormSchema,
  DestinationSetupFormType,
  DestinationSetupUnsupportedFormType,
  DestinationSetupWebhookFormType,
  FinalizeObjectFormSchema,
  FinalizeObjectFormType,
  NewObjectState,
  ObjectFieldsFormType,
  ObjectFieldsSchema,
  Step,
} from "src/pages/objects/helpers";
import {
  ConnectionType,
  Destination,
  FabraObject,
  FieldType,
  ObjectField,
  TargetType,
  shouldCreateFields,
} from "src/rpc/api";
import { z } from "zod";

export type ObjectStepProps = {
  isUpdate: boolean;
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
};

const InitialStepSchema = z.object({
  step: z.literal(Step.Initial),
  destinationSetup: DestinationSetupFormSchema.optional(),
  objectFields: ObjectFieldsSchema.optional(),
  finalize: FinalizeObjectFormSchema.optional(),
});
type InitialStepSchema = z.infer<typeof InitialStepSchema>;

const CreatingObjectStepSchema = z.object({
  step: z.literal(Step.CreateFields),
  destinationSetup: DestinationSetupFormSchema,
  objectFields: ObjectFieldsSchema.optional(),

  finalize: FinalizeObjectFormSchema.optional(),
});
type CreatingObjectStepSchema = z.infer<typeof CreatingObjectStepSchema>;

const ExistingObjectFieldsStepSchema = z.object({
  step: z.literal(Step.ExistingFields),
  destinationSetup: DestinationSetupFormSchema,
  objectFields: ObjectFieldsSchema.optional(),
  finalize: FinalizeObjectFormSchema.optional(),
});
type ExistingObjectFieldsStepSchema = z.infer<typeof ExistingObjectFieldsStepSchema>;

const FinalizeStepSchema = z.object({
  step: z.literal(Step.Finalize),
  destinationSetup: DestinationSetupFormSchema,
  objectFields: ObjectFieldsSchema,
  finalize: FinalizeObjectFormSchema.optional(),
});
type FinalizeStepSchema = z.infer<typeof FinalizeStepSchema>;

const UnsupportedConnectionTypeSchema = z.object({
  step: z.literal(Step.UnsupportedConnectionType),
  message: z.string(),
});
type UnsupportedConnectionTypeSchema = z.infer<typeof UnsupportedConnectionTypeSchema>;

const StateSchema = z.discriminatedUnion("step", [
  InitialStepSchema,
  CreatingObjectStepSchema,
  FinalizeStepSchema,
  ExistingObjectFieldsStepSchema,
  UnsupportedConnectionTypeSchema,
]);
type StateSchemaType = z.infer<typeof StateSchema>;

type InitializeStateArgs = {
  existingObject: FabraObject | undefined;
  existingDestination: Destination | undefined;
  maybeDestination: Destination | undefined;
};

function initializeState({
  existingObject,
  existingDestination,
  maybeDestination,
}: InitializeStateArgs): InitialStepSchema | UnsupportedConnectionTypeSchema {
  const connectionType =
    existingDestination?.connection.connection_type || maybeDestination?.connection.connection_type;
  if (!connectionType) {
    return {
      step: Step.Initial,
    } as InitialStepSchema;
  }

  const destinationSetup = (function () {
    const base = {
      destination: existingDestination || maybeDestination,
      displayName: existingDestination?.display_name ?? "",
      namespace: existingObject?.display_name,
      tableName: existingObject?.table_name,
    };
    switch (connectionType) {
      case ConnectionType.Webhook: {
        return {
          ...base,
          connectionType,
          targetType: TargetType.Webhook,
        } as DestinationSetupWebhookFormType;
      }
      case ConnectionType.BigQuery: {
        return {
          ...base,
          connectionType,
        } as DestinationSetupBigQueryFormType;
      }
      case ConnectionType.DynamoDb: {
        return {
          ...base,
          connectionType,
        } as DestinationSetupDynamoDbFormType;
      }
      case ConnectionType.Snowflake:
      case ConnectionType.Synapse:
      case ConnectionType.MySQL:
      case ConnectionType.MongoDb:
      case ConnectionType.Redshift:
      case ConnectionType.Postgres: {
        return {
          ...base,
          connectionType,
        } as DestinationSetupUnsupportedFormType;
      }
    }
  })();

  let objectFields: ObjectField[];
  let finalize: FinalizeObjectFormType | undefined;
  if (existingObject) {
    objectFields = existingObject.object_fields;
    const endCustomerIdField = objectFields.find((field) => field.name === existingObject.end_customer_id_field);
    let formCustomerIdField;
    if (connectionType === ConnectionType.Webhook) {
      formCustomerIdField = {
        name: existingObject.end_customer_id_field,
        type: FieldType.String,
      };
    } else {
      formCustomerIdField = {
        name: existingObject.end_customer_id_field,
        type: endCustomerIdField?.type ?? FieldType.String,
      };
    }
    finalize = {
      syncMode: existingObject.sync_mode,
      cursorField: objectFields.find((field) => field.name === existingObject.cursor_field),
      endCustomerIdField: formCustomerIdField,
      frequency: existingObject.frequency,
      frequencyUnits: existingObject.frequency_units,
      recurring: existingObject.recurring,
    };
    console.log("finalize", finalize);
  } else {
    finalize = undefined;
    objectFields = [];
  }

  // const state = initializeFromDestination(maybeDestination);

  // const connectionType = maybeDestination.connection.connection_type;
  // if (!SUPPORTED_CONNECTION_TYPES.includes(connectionType as SupportedConnectionType)) {
  //   return {
  //     step: Step.UnsupportedConnectionType,
  //     message: `Connection type ${connectionType} is not supported yet. Message team@fabra.io to let us know you want this!`,
  //   } as UnsupportedConnectionTypeSchema;
  // }

  // if (connectionType === ConnectionType.Webhook) {
  //   state.destinationSetupData.targetType = TargetType.Webhook;
  //   state.endCustomerIdField = { name: "end_customer_id", type: FieldType.Integer };
  // } else {
  //   state.destinationSetupData.targetType = TargetType.SingleExisting;
  // }
  const returnState: InitialStepSchema = {
    step: Step.Initial,
    destinationSetup,
    objectFields: {
      objectFields,
    },
    finalize,
  };
  return returnState;
}

export function useStateMachine(args: InitializeStateArgs, onComplete: () => void) {
  const [state, setState] = useState<StateSchemaType>(initializeState(args));
  const back = useCallback(() => {
    switch (state.step) {
      case Step.Initial: {
        onComplete();
        return;
      }
      case Step.CreateFields: {
        setState(
          (state) =>
            ({
              ...state,
              step: Step.Initial,
            } as InitialStepSchema),
        );
        return;
      }
      case Step.ExistingFields: {
        setState(
          (state) =>
            ({
              ...state,
              step: Step.Initial,
            } as InitialStepSchema),
        );
        return;
      }
      case Step.Finalize: {
        const createFields = shouldCreateFields(
          state.destinationSetup.connectionType,
          state.destinationSetup.targetType,
        );
        setState(
          (state) =>
            ({
              ...state,
              step: createFields ? Step.CreateFields : Step.ExistingFields,
            } as CreatingObjectStepSchema | ExistingObjectFieldsStepSchema),
        );
        return;
      }
      case Step.UnsupportedConnectionType: {
        setState(
          (state) =>
            ({
              ...state,
              step: Step.Initial,
            } as InitialStepSchema),
        );
        return;
      }
    }
  }, [state.step]);

  return {
    advanceToObjectFields: (destinationSetup: DestinationSetupFormType) => {
      const nextState = (() => {
        const connectionType = destinationSetup.connectionType;
        switch (connectionType) {
          case ConnectionType.BigQuery:
          case ConnectionType.Webhook:
          case ConnectionType.DynamoDb: {
            const createFields = shouldCreateFields(connectionType, destinationSetup.targetType);
            return {
              step: createFields ? Step.CreateFields : Step.ExistingFields,
              destinationSetup,
            } as CreatingObjectStepSchema;
          }
          default: {
            return {
              step: Step.UnsupportedConnectionType,
            } as UnsupportedConnectionTypeSchema;
          }
        }
      })();
      setState((state) => {
        console.log("prevState", state);
        return { ...state, ...nextState };
      });
    },
    advanceToFinalizeObject: (destinationSetup: DestinationSetupFormType, objectFields: ObjectFieldsFormType) => {
      const nextState = (() => {
        return {
          step: Step.Finalize,
          destinationSetup,
          objectFields,
        } as FinalizeStepSchema;
      })();
      setState((state) => ({ ...state, ...nextState }));
    },
    state,
    back,
  };
}
