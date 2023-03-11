import { useEffect, useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { Checkbox } from "src/components/checkbox/Checkbox";
import { Input, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ColumnSelector, DestinationSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateObject, CreateObjectRequest, Destination, GetObjects, ObjectFieldInput } from "src/rpc/api";
import { useSchema } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";

enum Step {
  Initial,
  FieldMapping,
}

type NewObjectState = {
  step: Step;
  displayName: string | undefined;
  destination: Destination | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  endCustomerIdColumn: ColumnSchema | undefined;
  objectFields: ObjectFieldInput[] | undefined;
};

const INITIAL_OBJECT_STATE: NewObjectState = {
  step: Step.Initial,
  displayName: undefined,
  destination: undefined,
  namespace: undefined,
  tableName: undefined,
  endCustomerIdColumn: undefined,
  objectFields: undefined,
};

const validateAll = (state: NewObjectState): boolean => {
  return state.displayName !== undefined
    && state.displayName.length > 0
    && state.destination !== undefined
    && state.namespace !== undefined && state.namespace.length > 0
    && state.tableName !== undefined && state.tableName.length > 0
    && state.endCustomerIdColumn !== undefined;
};

export const NewObject: React.FC<{ onComplete: () => void; }> = props => {
  const [state, setState] = useState<NewObjectState>(INITIAL_OBJECT_STATE);

  let content: React.ReactElement;
  let back: () => void;
  switch (state.step) {
    case Step.Initial:
      content = <NewObjectForm state={state} setState={setState} />;
      // TODO: prompt if they want to exit here
      back = props.onComplete;
      break;
    case Step.FieldMapping:
      content = <ObjectFields state={state} setState={setState} onComplete={props.onComplete} />;
      back = () => setState({ ...state, step: Step.Initial });
      break;
  }

  return (
    <div className="tw-h-full tw-pb-20 tw-pt-3">
      <BackButton onClick={back} />
      <div className='tw-flex tw-flex-col tw-w-[900px] tw-max-h-full tw-mt-8 tw-py-12 tw-px-10 tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center tw-overflow-auto'>
        {content}
      </div>
    </div>
  );
};

type NewObjectFormProps = {
  state: NewObjectState;
  setState: (state: NewObjectState) => void;
};

export const NewObjectForm: React.FC<NewObjectFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const advance = () => {
    if (validateAll(state)) {
      setState({ ...state, step: Step.FieldMapping });
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-[400px]">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">New Object</div>
      <div className="tw-text-center tw-mb-3">Enter your object configuration.</div>
      <ValidatedInput
        id='displayName'
        value={state.displayName}
        setValue={(value) => { setState({ ...state, displayName: value }); }}
        placeholder='Display Name'
        label="Display Name" />
      <DestinationSelector
        className='tw-mt-5 tw-w-[400px]'
        validated={true}
        destination={state.destination}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            setState({ ...state, destination: value, namespace: undefined, tableName: undefined, endCustomerIdColumn: undefined, objectFields: undefined });
          }
        }} />
      <NamespaceSelector
        className='tw-mt-5 tw-w-[400px]'
        validated={true}
        connection={state.destination?.connection}
        namespace={state.namespace}
        setNamespace={(value: string) => {
          if (value !== state.namespace) {
            setState({ ...state, namespace: value, tableName: undefined, endCustomerIdColumn: undefined, objectFields: undefined });
          }
        }}
        noOptionsString="No Namespaces Available! (Choose a data source)"
      />
      <TableSelector
        className="tw-mt-5 tw-w-[400px]"
        connection={state.destination?.connection}
        namespace={state.namespace}
        tableName={state.tableName}
        setTableName={(value: string) => {
          if (value !== state.tableName) {
            setState({ ...state, tableName: value, endCustomerIdColumn: undefined, objectFields: undefined });
          }
        }}
        noOptionsString="No Tables Available! (Choose a namespace)"
        validated={true}
      />
      <ColumnSelector
        className="tw-mt-5 tw-w-[400px]"
        column={state.endCustomerIdColumn}
        setColumn={(value: ColumnSchema) => { setState({ ...state, endCustomerIdColumn: value }); }}
        placeholder='End Customer ID Column'
        label='End Customer ID Column'
        noOptionsString="No Columns Available! (Choose a table)"
        validated={true}
        connection={state.destination?.connection}
        namespace={state.namespace}
        tableName={state.tableName}
      />
      <Button onClick={advance} className='tw-mt-8 tw-w-full tw-h-10' >Continue</Button>
    </div>
  );
};

type ObjectFieldsProps = {
  state: NewObjectState;
  setState: React.Dispatch<React.SetStateAction<NewObjectState>>;
  onComplete: () => void;
};

const ObjectFields: React.FC<ObjectFieldsProps> = props => {
  const { state, setState } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName);
  const [createObjectSuccess, setCreateObjectSuccess] = useState<boolean | null>(null);
  const endCustomerIdColumn = state.endCustomerIdColumn?.name;
  useEffect(() => {
    const objectFields = schema ? schema.map(column => {
      // automatically omit end customer ID column
      const omit = column.name === endCustomerIdColumn;
      return {
        name: column.name,
        type: column.type,
        omit: omit,
        optional: false,
      };
    }) : [];
    setState(s => {
      return {
        ...s,
        objectFields: objectFields,
      };
    });
  }, [schema, endCustomerIdColumn, setState]);

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

  const createNewObject = async () => {
    setLoading(true);

    if (!validateAll(state)) {
      setLoading(false);
      return;
    }

    const payload: CreateObjectRequest = {
      display_name: state.displayName!,
      destination_id: state.destination!.id,
      namespace: state.namespace!,
      table_name: state.tableName!,
      end_customer_id_column: state.endCustomerIdColumn!.name,
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

  if (createObjectSuccess) {
    return (
      <div>
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your object is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  if (!state.objectFields) {
    return <Loading />;
  }

  return (
    <div className="tw-h-full tw-w-full tw-text-center">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">Object Fields</div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <div className="tw-w-full tw-px-24">
        {state.objectFields.map((objectField, i) => {
          const isEndCustomerIdColumn = objectField.name === endCustomerIdColumn;
          return (
            <Tooltip label="End Customer ID column should not be visible to your end customer, it will be automatically set by Fabra." disabled={!isEndCustomerIdColumn}>
              <div key={objectField.name} className={mergeClasses("tw-mt-5 tw-mb-7 tw-text-left")}>
                <span className="tw-text-base tw-font-semibold">{objectField.name}</span>
                <div className="tw-flex tw-items-center tw-mt-2 tw-pb-1.5">
                  <span className="">Omit?</span>
                  <Checkbox disabled={isEndCustomerIdColumn} className="tw-ml-2 tw-h-4 tw-w-4 tw-" checked={objectField.omit} onCheckedChange={() => updateObjectField({ ...objectField, omit: !objectField.omit }, i)} />
                  <span className="tw-ml-4">Optional?</span>
                  <Checkbox disabled={isEndCustomerIdColumn} className="tw-ml-2 tw-h-4 tw-w-4" checked={objectField.optional} onCheckedChange={() => updateObjectField({ ...objectField, optional: !objectField.optional }, i)} />
                </div>
                <Input disabled={isEndCustomerIdColumn} className="tw-mb-2" value={objectField.display_name} setValue={value => updateObjectField({ ...objectField, display_name: value }, i)} placeholder="Display Name" label="Display Name" />
                <Input disabled={isEndCustomerIdColumn} className="tw-mb-2" value={objectField.description} setValue={value => updateObjectField({ ...objectField, description: value }, i)} placeholder="Description" label="Description" />
              </div>
            </Tooltip>
          );
        })}
      </div>
      <Button onClick={() => createNewObject()} className='tw-mt-8 tw-w-[400px] tw-h-10'>{loading ? <Loading /> : "Save"}</Button>
    </div>
  );
};;;