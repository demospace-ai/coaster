import {
  ConnectionType,
  Destination,
  FabraObject,
  Field,
  FieldType,
  FrequencyUnits,
  needsCursorField,
  needsEndCustomerId,
  needsPrimaryKey,
  ObjectFieldInput,
  SyncMode,
  TargetType,
} from "src/rpc/api";

export enum Step {
  Initial,
  ExistingFields,
  CreateFields,
  Finalize,
}

export type NewObjectState = {
  step: Step;

  // Destination setup step.
  destinationSetupData: {
    displayName: string | undefined;
    destination: Destination | undefined;
    namespace: string | undefined;
    targetType: TargetType | undefined;
    tableName: string | undefined;
  };

  // Object fields step.
  objectFields: ObjectFieldInput[];

  syncMode: SyncMode | undefined;
  cursorField: Field | undefined;
  primaryKey: Field | undefined;
  endCustomerIdField: Field | undefined;
  recurring: boolean;
  frequency: number | undefined;
  frequencyUnits: FrequencyUnits | undefined;
  fieldsError: string | undefined;
  cursorFieldError: string | undefined;
  endCustomerIdError: string | undefined;
  frequencyError: string | undefined;
  createError: string | undefined;
};

export type DestinationSetupFormState = {
  displayName: string;
  destination: Destination | null;
  targetType: TargetType | null;
  tableName: string | null;
  namespace: string | null;
};

export const INITIAL_OBJECT_STATE: NewObjectState = {
  step: Step.Initial,
  destinationSetupData: {
    displayName: undefined,
    destination: undefined,
    namespace: undefined,
    targetType: undefined,
    tableName: undefined,
  },
  syncMode: undefined,
  cursorField: undefined,
  primaryKey: undefined,
  endCustomerIdField: undefined,
  recurring: false,
  frequency: undefined,
  frequencyUnits: undefined,
  objectFields: [],
  fieldsError: undefined,
  cursorFieldError: undefined,
  endCustomerIdError: undefined,
  frequencyError: undefined,
  createError: undefined,
};

export const validateAll = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  const errors = {
    displayName: validateDisplayName(state, setState),
    destination: validateDestination(state, setState),
    fields: validateFields(state, setState),
    frequency: validateFrequency(state, setState),
  };
  const optionalErrors: Record<string, boolean | undefined> = {};
  if (state.syncMode !== undefined) {
    optionalErrors.cursorField = !needsCursorField(state.syncMode) ? undefined : validateCursorField(state, setState);
    optionalErrors.primaryKey = !needsPrimaryKey(state.syncMode) ? undefined : !!state.primaryKey;
    optionalErrors.endCustomerIdField = !needsEndCustomerId(state.destinationSetupData.targetType!)
      ? undefined
      : !!state.endCustomerIdField;
  }

  const isValid =
    Object.values(errors).every((value) => value === true) &&
    Object.values(optionalErrors).every((value) => value === true || value === undefined);

  return isValid;
};

export const validateDisplayName = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.destinationSetupData.displayName === undefined || state.destinationSetupData.displayName.length <= 0) {
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

export const validateDestination = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (!state.destinationSetupData.destination) {
    setState((state) => {
      return {
        ...state,
        destinationError: "Must select a destination",
      };
    });
    return false;
  }

  const connectionType = state.destinationSetupData.destination.connection.connection_type;
  if (connectionType !== ConnectionType.Webhook) {
    if (!state.destinationSetupData.targetType) {
      setState((state) => {
        return {
          ...state,
          destinationError: "Must select a target",
        };
      });
      return false;
    }

    if (state.destinationSetupData.targetType === TargetType.SingleExisting) {
      if (connectionType !== ConnectionType.DynamoDb && !state.destinationSetupData.namespace) {
        setState((state) => {
          return {
            ...state,
            destinationError: "Must select a namespace",
          };
        });
        return false;
      }

      if (!state.destinationSetupData.tableName) {
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

export const validateFields = (
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

export const validateCursorField = (
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

export const validateFrequency = (
  state: NewObjectState,
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>,
): boolean => {
  if (state.recurring === false) {
    return true;
  }

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

export const getFieldFromName = (objectFields: ObjectFieldInput[], fieldName: string): Field | undefined => {
  const matchingField = objectFields.find((predicate) => predicate.name === fieldName);
  if (!matchingField) {
    return undefined;
  }

  return {
    name: fieldName,
    type: matchingField.type!,
  };
};

export const initalizeFromExisting = (
  existingObject: FabraObject,
  existingDestination: Destination,
): NewObjectState => {
  return {
    ...INITIAL_OBJECT_STATE,
    destinationSetupData: {
      displayName: existingObject.display_name,
      destination: existingDestination,
      targetType: existingObject.target_type,
      namespace: existingObject.namespace,
      tableName: existingObject.table_name,
    },
    objectFields: existingObject.object_fields ?? [],
    syncMode: existingObject.sync_mode,
    cursorField: existingObject.cursor_field
      ? getFieldFromName(existingObject.object_fields, existingObject.cursor_field)
      : undefined,
    endCustomerIdField: existingObject.end_customer_id_field
      ? getFieldFromName(existingObject.object_fields, existingObject.end_customer_id_field)
      : undefined,
    recurring: existingObject.recurring,
    frequency: existingObject.frequency,
    frequencyUnits: existingObject.frequency_units,
  };
};

export const initializeFromDestination = (destination: Destination): NewObjectState => {
  const state = {
    ...INITIAL_OBJECT_STATE,
  };
  state.destinationSetupData.destination = destination;
  if (destination.connection.connection_type === ConnectionType.Webhook) {
    state.destinationSetupData.targetType = TargetType.Webhook;
    state.endCustomerIdField = { name: "end_customer_id", type: FieldType.Integer };
  } else {
    state.destinationSetupData.targetType = TargetType.SingleExisting;
  }
  return state;
};

export type ObjectTargetOption = {
  type: TargetType;
  title: string;
  description: string;
};
export const objectTargetOptions: ObjectTargetOption[] = [
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
