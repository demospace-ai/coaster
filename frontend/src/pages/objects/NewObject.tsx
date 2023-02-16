import { useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { DestinationSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateObject, CreateObjectRequest, Destination, GetObjects } from "src/rpc/api";
import { useSchema } from "src/rpc/data";
import { mutate } from "swr";

type NewObjectState = {
  displayName: string | undefined;
  destination: Destination | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  customerIdColumn: ColumnSchema | undefined;
};

const INITIAL_DATASET_STATE: NewObjectState = {
  displayName: undefined,
  destination: undefined,
  namespace: undefined,
  tableName: undefined,
  customerIdColumn: undefined,
};

const validateAll = (state: NewObjectState): boolean => {
  return state.displayName !== undefined
    && state.displayName.length > 0
    && state.destination !== undefined
    && state.namespace !== undefined && state.namespace.length > 0
    && state.tableName !== undefined && state.tableName.length > 0
    && state.customerIdColumn !== undefined;
};

export const NewObject: React.FC<{ onComplete: () => void; }> = props => {
  const [state, setState] = useState<NewObjectState>(INITIAL_DATASET_STATE);

  return (
    <>
      <BackButton className="tw-mt-3" onClick={props.onComplete} />
      <div className='tw-flex tw-flex-col tw-w-[800px] tw-py-12 tw-px-10 tw-mx-auto tw-mb-20 tw-mt-8 tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center'>
        <NewObjectForm state={state} setState={setState} onComplete={props.onComplete} />
      </div>
    </>
  );
};

type NewObjectFormProps = {
  state: NewObjectState;
  setState: (state: NewObjectState) => void;
  onComplete: () => void;
};

export const NewObjectForm: React.FC<NewObjectFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const [loading, setLoading] = useState<boolean>(false);
  const [createObjectSuccess, setCreateObjectSuccess] = useState<boolean | null>(null);
  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName);

  const createNewObject = async () => {
    setLoading(true);

    if (!validateAll(state)) {
      setLoading(false);
      return;
    }

    const payload: CreateObjectRequest = {
      'display_name': state.displayName!,
      'destination_id': state.destination!.id,
      'namespace': state.namespace!,
      'table_name': state.tableName!,
      'customer_id_column': state.customerIdColumn!.name,
      'object_fields': [],
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

  return (
    <div className="tw-flex tw-flex-col tw-w-[400px]">
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">New Object</div>
      <div className="tw-text-center tw-mb-3">Enter your object configuration:</div>
      <ValidatedInput
        id='displayName'
        value={state.displayName}
        setValue={(value) => { setState({ ...state, displayName: value }); }}
        placeholder='Display Name'
        label="Display Name" />
      <DestinationSelector
        className='tw-mt-5'
        validated={true}
        destination={state.destination}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            setState({ ...state, destination: value, namespace: undefined, tableName: undefined, customerIdColumn: undefined, });
          }
        }} />
      <NamespaceSelector
        className='tw-mt-5'
        validated={true}
        connection={state.destination?.connection}
        namespace={state.namespace}
        setNamespace={(value: string) => {
          if (value !== state.namespace) {
            setState({ ...state, namespace: value, tableName: undefined, customerIdColumn: undefined, });
          }
        }}
        noOptionsString="No Namespaces Available! (Choose a data source)"
      />
      <TableSelector
        className="tw-mt-5"
        connection={state.destination?.connection}
        namespace={state.namespace}
        tableName={state.tableName}
        setTableName={(value: string) => {
          if (value !== state.tableName) {
            setState({ ...state, tableName: value, customerIdColumn: undefined, });
          }
        }}
        noOptionsString="No Tables Available! (Choose a namespace)"
        validated={true}
        allowCustom={true}
      />
      <ValidatedComboInput
        className="tw-mt-5"
        options={schema ? schema : []}
        selected={state.customerIdColumn}
        setSelected={(value: ColumnSchema) => { setState({ ...state, customerIdColumn: value }); }}
        getElementForDisplay={(value: ColumnSchema) => value.name}
        placeholder='End Customer ID Column'
        label='End Customer ID Column'
        noOptionsString="No Columns Available! (Return to previous step)"
        loading={!schema}
        validated={true}
      />
      <Button onClick={() => createNewObject()} className='tw-mt-8 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</Button>
    </div>
  );
};