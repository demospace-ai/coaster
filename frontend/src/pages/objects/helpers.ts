import {
  ConnectionType,
  Destination,
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

export const INITIAL_OBJECT_STATE: NewObjectState = {
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

export const validateAll = (
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

export const validateDisplayName = (
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

export const validateDestination = (
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

  if (state.destination.connection.connection_type !== ConnectionType.Webhook) {
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
