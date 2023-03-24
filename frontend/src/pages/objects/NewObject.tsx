import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { Checkbox } from "src/components/checkbox/Checkbox";
import { InfoIcon } from "src/components/icons/Icons";
import { Input, ValidatedDropdownInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { DestinationSelector, FieldSelector, FieldTypeSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { ConnectionType, CreateObject, CreateObjectRequest, Destination, Field, FieldType, FrequencyUnits, GetObjects, needsCursorField, needsPrimaryKey, ObjectFieldInput, Schema, SyncMode, TargetType } from "src/rpc/api";
import { useSchema } from "src/rpc/data";
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
};

type ObjectStepProps = {
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
};

const validateDestination = (state: NewObjectState): boolean => {
  if (
    state.displayName !== undefined && state.displayName.length > 0
    && state.destination !== undefined
  ) {
    if (state.destination.connection.connection_type === ConnectionType.Webhook) {
      return true;
    } else {
      return (state.targetType !== undefined
        && state.namespace !== undefined && state.namespace.length > 0
        && state.tableName !== undefined && state.tableName.length > 0);
    }
  } else {
    return false;
  }
};

const validateFields = (state: NewObjectState): boolean => {
  return (
    validateDestination(state)
    && state.objectFields !== undefined && state.objectFields.length > 0
    && state.objectFields.every(objectField =>
      objectField.name && objectField.name.length > 0 && objectField.type && objectField.type.length > 0
    )
  );
};


const validateAll = (state: NewObjectState): boolean => {
  return (
    validateDestination(state)
    && validateFields(state)
    && state.syncMode !== undefined
    && (!needsCursorField(state.syncMode) || validateCursorField(state))
    && (!needsPrimaryKey(state.syncMode) || state.primaryKey !== undefined)
    //&& state.endCustomerIdField !== undefined
    && state.frequency !== undefined
    && state.frequencyUnits !== undefined
  );
};

const validateCursorField = (state: NewObjectState): boolean => {
  // TODO: allow using other types
  return state.cursorField !== undefined && (
    state.cursorField.type === FieldType.TimestampNtz
    || state.cursorField.type === FieldType.TimestampTz
    || state.cursorField.type === FieldType.Integer
  );
};

export const NewObject: React.FC<{ onComplete: () => void; }> = props => {
  const [state, setState] = useState<NewObjectState>(INITIAL_OBJECT_STATE);
  const [prevSchema, setPrevSchema] = useState<Schema | undefined>(undefined);
  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName);

  // Initialize object fields from schema
  if (schema && schema !== prevSchema) {
    setPrevSchema(schema);
    const objectFields = schema.map(field => {
      // automatically omit end customer ID field
      return {
        name: field.name,
        type: field.type,
        omit: false,
        optional: false,
      };
    });
    setState(s => {
      return {
        ...s,
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
      back = () => setState({ ...state, step: Step.Initial });
      break;
    case Step.CreateFields:
      content = <NewObjectFields state={state} setState={setState} />;
      back = () => setState({ ...state, step: Step.Initial });
      break;
    case Step.Finalize:
      content = <Finalize state={state} setState={setState} onComplete={props.onComplete} />;
      back = () => setState({ ...state, step: Step.FieldMapping });
      break;
  }

  return (
    <>
      <BackButton onClick={back} />
      <div className='tw-flex tw-flex-col tw-w-[900px] tw-mt-8 tw-mb-24 tw-py-12 tw-px-10 tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center'>
        {content}
      </div>
    </>
  );
};

export const DestinationSetup: React.FC<ObjectStepProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const advance = () => {
    if (validateDestination(state)) {
      if (state.destination?.connection.connection_type === ConnectionType.Webhook) {
        setState({ ...state, step: Step.CreateFields });
      } else {
        setState({ ...state, step: Step.FieldMapping });
      }
    };
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
        setValue={(value) => { setState({ ...state, displayName: value }); }}
        placeholder='Display Name'
      />
      <div className="tw-w-full  tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-3">
        <span className="tw-font-medium">Destination</span>
      </div>
      <DestinationSelector
        className='tw-mt-0 tw-w-100'
        validated={true}
        destination={state.destination}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            if (value.connection.connection_type === ConnectionType.Webhook) {
              // Just hardcode EndCustomerIDField and TargetType for webhooks— they don't matter anyway
              setState({ ...state, destination: value, namespace: undefined, tableName: undefined, targetType: TargetType.Webhook, endCustomerIdField: { name: "end_customer_id", type: FieldType.Integer }, objectFields: [] });
            } else {
              setState({ ...state, destination: value, namespace: undefined, tableName: undefined, endCustomerIdField: undefined, objectFields: [] });
            }
          }
        }} />
      <DestinationTarget state={state} setState={setState} />
      <Button onClick={advance} className='tw-mt-10 tw-w-full tw-h-10' >Continue</Button>
    </div>
  );
};

const ExistingObjectFields: React.FC<ObjectStepProps> = props => {
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
      })
    });
  };

  const advance = () => {
    if (validateFields(state)) {
      setState({ ...state, step: Step.Finalize });
    }
  };

  return (
    <div className="tw-h-full tw-w-full tw-text-center">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Fields</div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields.length > 0 ?
          state.objectFields.map((objectField, i) => (
            <div key={objectField.name} className={mergeClasses("tw-mt-5 tw-mb-7 tw-text-left")}>
              <span className="tw-text-base tw-font-semibold">{objectField.name}</span>
              <div className="tw-flex tw-items-center tw-mt-2 tw-pb-1.5">
                <span className="">Omit?</span>
                <Checkbox className="tw-ml-2 tw-h-4 tw-w-4 tw-" checked={Boolean(objectField.omit)} onCheckedChange={() => updateObjectField({ ...objectField, omit: !objectField.omit }, i)} />
                <span className="tw-ml-4">Optional?</span>
                <Checkbox className="tw-ml-2 tw-h-4 tw-w-4" checked={Boolean(objectField.optional)} onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)} />
              </div>
              <Input className="tw-mb-2" value={objectField.display_name} setValue={value => updateObjectField({ ...objectField, display_name: value }, i)} placeholder="Display Name (optional)" label="Display Name" />
              <Input className="tw-mb-2" value={objectField.description} setValue={value => updateObjectField({ ...objectField, description: value }, i)} placeholder="Description (optional)" label="Description" />
            </div>
          ))
          :
          <Loading />
        }
      </div>
      <Button onClick={advance} className='tw-mt-6 tw-w-100 tw-h-10' >Continue</Button>
    </div >
  );
};

const NewObjectFields: React.FC<ObjectStepProps> = props => {
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
      })
    });
  };

  const addObjectField = () => {
    if (!state.objectFields) {
      return;
    }

    setState({
      ...state,
      objectFields: [...state.objectFields, {
        name: undefined,
        type: undefined,
        omit: false,
        optional: false,
      }]
    });
  };

  const advance = () => {
    if (validateFields(state)) {
      setState({ ...state, step: Step.Finalize });
    }
  };

  return (
    <div className="tw-h-full tw-w-full tw-text-center">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Fields</div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields ?
          <div>
            {state.objectFields.map((objectField, i) => (
              <div key={i} className="tw-mt-5 tw-mb-7 tw-text-left tw-p-4 tw-border tw-rounded-lg">
                <span className="tw-font-semibold tw-text-lg">Field {i + 1}</span>
                <div className="tw-flex tw-items-center tw-mt-3">
                  <span>Optional?</span>
                  <Checkbox className="tw-ml-2 tw-h-4 tw-w-4" checked={Boolean(objectField.optional)} onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)} />
                </div>
                <div className="tw-flex tw-w-full tw-items-center tw-mb-2">
                  <div className="tw-w-full tw-mr-4">
                    <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                      <span>Field Key</span>
                      <Tooltip placement="right" label="Choose a valid JSON key that will be used when sending this field to your webhook.">
                        <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                      </Tooltip>
                    </div>
                    <Input value={objectField.name} setValue={value => updateObjectField({ ...objectField, name: value }, i)} placeholder="Field Key" />
                  </div>
                  <div>
                    <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                      <span>Field Type</span>
                      <Tooltip placement="right" label="Choose the type for this field.">
                        <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                      </Tooltip>
                    </div>
                    <FieldTypeSelector className="tw-w-48 tw-m-0" type={objectField.type} setFieldType={value => updateObjectField({ ...objectField, type: value }, i)} />
                  </div>
                </div>
                <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
                  <span>Display Name</span>
                  <Tooltip placement="right" label="Set a customer-facing name that your customers will see when setting up a sync.">
                    <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                  </Tooltip>
                </div>
                <Input className="tw-mb-2" value={objectField.display_name} setValue={value => updateObjectField({ ...objectField, display_name: value }, i)} placeholder="Display Name (optional)" />
                <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
                  <span>Description</span>
                  <Tooltip placement="right" label="Add any extra information that will help your customers understand how to map their data to this object.">
                    <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
                  </Tooltip>
                </div>
                <Input className="tw-mb-2" value={objectField.description} setValue={value => updateObjectField({ ...objectField, description: value }, i)} placeholder="Description (optional)" />
              </div>
            ))}
            <Button className="tw-mt-7 tw-mx-auto tw-flex tw-items-center" onClick={addObjectField}>
              <PlusCircleIcon className="tw-h-5 tw-mr-1.5 tw-stroke-2" />
              Add Object Field
            </Button>
          </div>
          :
          <Loading className="tw-mt-5" />
        }
      </div>
      <Button onClick={advance} className='tw-mt-16 tw-w-100 tw-h-10' >Continue</Button>
    </div >
  );
};

const Finalize: React.FC<ObjectStepProps & { onComplete: () => void; }> = (props) => {
  const { state, setState } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [createObjectSuccess, setCreateObjectSuccess] = useState<boolean | null>(null);
  const createNewObject = async () => {
    setLoading(true);

    if (!validateAll(state)) {
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
    }

    setLoading(false);
  };

  const fields: Field[] = state.objectFields ? state.objectFields
    .filter(field => field.name && field.type && !field.omit && !field.optional)
    .map(field => {
      return { name: field.name!, type: field.type! };
    }) : [];

  if (createObjectSuccess) {
    return (
      <div>
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your object is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }
  let recommendedCursor = <></>;
  switch (state.syncMode) {
    case SyncMode.IncrementalAppend:
      recommendedCursor = <>For <span className="tw-px-1 tw-bg-black tw-font-mono">incremental_append</span> syncs, you should use an <span className="tw-px-1 tw-bg-black tw-font-mono">created_at</span> field.</>;
      break;
    case SyncMode.IncrementalUpdate:
      recommendedCursor = <>For <span className="tw-px-1 tw-bg-black tw-font-mono">incremental_update</span> syncs, you should use an <span className="tw-px-1 tw-bg-black tw-font-mono">updated_at</span> field.</>;
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-100">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Settings</div>
      <div className="tw-text-center tw-mb-3">Enter default settings for object syncs.</div>
      <SyncModeSelector state={state} setState={setState} />
      {[SyncMode.IncrementalAppend, SyncMode.IncrementalUpdate].includes(state.syncMode!) &&
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Cursor Field</span>
            <Tooltip placement="right" label={<>Cursor field is usually a timestamp. This lets Fabra know what data has changed since the last sync. {recommendedCursor}</>} maxWidth={400} interactive>
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </div>
          <FieldSelector
            className="tw-mt-0 tw-w-100"
            field={state.cursorField}
            setField={(value: Field) => { setState({ ...state, cursorField: value }); }}
            placeholder='Cursor Field'
            label='Cursor Field'
            noOptionsString="No Fields Available!"
            validated={true}
            predefinedFields={fields}
          />
        </>
      }
      {[SyncMode.IncrementalUpdate].includes(state.syncMode!) &&
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Primary Key</span>
            <Tooltip placement="right" label='Primary key is usually an ID field. This lets Fabra know which existing rows in the target to update when they change.' maxWidth={400}>
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </div>
          <FieldSelector
            className="tw-mt-0 tw-w-100"
            field={state.primaryKey}
            setField={(value: Field) => { setState({ ...state, primaryKey: value }); }}
            placeholder='Primary Key'
            noOptionsString="No Fields Available!"
            validated={true}
            predefinedFields={fields}
          />
        </>
      }
      {state.syncMode !== undefined &&
        <>
          {state.destination?.connection.connection_type !== ConnectionType.Webhook &&
            <>
              <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
                <span className="tw-font-medium">End Customer ID</span>
              </div>
              <FieldSelector
                className="tw-mt-0 tw-w-100"
                field={state.endCustomerIdField}
                setField={(value: Field) => { setState({ ...state, endCustomerIdField: value }); }}
                placeholder='End Customer ID Field'
                noOptionsString="No Fields Available!"
                validated={true}
                connection={state.destination?.connection}
                namespace={state.namespace}
                tableName={state.tableName}
              />
            </>
          }
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Frequency</span>
          </div>
          <ValidatedInput id="frequency" className="tw-w-100" min={props.state.frequencyUnits === FrequencyUnits.Minutes ? 30 : 1} type="number" value={props.state.frequency} setValue={value => props.setState({ ...props.state, frequency: value })} placeholder="Sync Frequency" />
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Frequency Units</span>
          </div>
          <ValidatedDropdownInput className="tw-mt-0 tw-w-100" options={Object.values(FrequencyUnits)} selected={props.state.frequencyUnits} setSelected={value => props.setState({ ...props.state, frequencyUnits: value })} loading={false} placeholder="Frequency Units" noOptionsString="nil" getElementForDisplay={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
        </>
      }
      <Button onClick={() => createNewObject()} className='tw-mt-10 tw-w-full tw-h-10'>{loading ? <Loading /> : "Create Object"}</Button>
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
      description: "Data from all of your customers will be stored in a single existing table, with an extra ID column to distinguish between customers."
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState({ ...state, targetType: e.target.value as TargetType })}
                className="tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer"
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(target.type)} className="tw-text-sm tw-cursor-pointer">
                  {target.title}
                </label>
                <Tooltip label={target.description} placement='top-start'>
                  <InfoIcon className="tw-ml-1.5 tw-h-3 tw-fill-slate-400" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      {state.targetType === TargetType.SingleExisting &&
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Namespace</span>
          </div>
          <NamespaceSelector
            className='tw-mt-0 tw-w-100'
            validated={true}
            connection={state.destination?.connection}
            namespace={state.namespace}
            setNamespace={(value: string) => {
              if (value !== state.namespace) {
                setState({ ...state, namespace: value, tableName: undefined, endCustomerIdField: undefined, objectFields: [] });
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
      }
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
      description: "Fabra will overwrite the entire target table on every sync."
    },
    {
      mode: SyncMode.IncrementalAppend,
      title: "Incremental Append",
      description: "Fabra will append any new rows since the last sync to the existing target table."
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState({ ...state, syncMode: e.target.value as SyncMode })}
                className="tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer"
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(syncMode.mode)} className="tw-text-sm tw-cursor-pointer">
                  {syncMode.title}
                </label>
                <Tooltip label={syncMode.description} placement='top-start'>
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