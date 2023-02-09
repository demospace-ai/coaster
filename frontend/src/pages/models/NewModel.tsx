import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { DestinationSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateModel, CreateModelRequest, Destination, GetModels } from "src/rpc/api";
import { useSchema } from "src/rpc/data";
import { mutate } from "swr";

enum Step {
  One,
  Two,
  Three,
}

enum TableType {
  SingleTable,
  CustomJoin,
}

type NewModelState = {
  displayName: string | undefined;
  destination: Destination | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  customerIdColumn: ColumnSchema | undefined;
  customJoin: string | undefined;
  step: Step;
  tableType: TableType;
};

const INITIAL_DATASET_STATE: NewModelState = {
  displayName: undefined,
  destination: undefined,
  namespace: undefined,
  tableName: undefined,
  customerIdColumn: undefined,
  customJoin: undefined,
  step: Step.One,
  tableType: TableType.SingleTable,
};

const validateAll = (state: NewModelState): boolean => {
  return state.displayName !== undefined
    && state.displayName.length > 0
    && state.destination !== undefined
    && ((state.namespace !== undefined && state.namespace.length > 0 && state.tableName !== undefined && state.tableName.length > 0) || (state.customJoin !== undefined && state.customJoin.length > 0))
    && state.customerIdColumn !== undefined;
};

export const NewModel: React.FC<{ onComplete: () => void; }> = props => {
  const [state, setState] = useState<NewModelState>(INITIAL_DATASET_STATE);
  const onBack = () => {
    switch (state.step) {
      case Step.One:
        props.onComplete();
        break;
      case Step.Two:
      case Step.Three:
        setState({ ...state, step: state.step - 1 });
    }
  };

  return (
    <>
      <BackButton className="tw-mt-3" onClick={onBack} />
      <div className='tw-flex tw-flex-col tw-w-[800px] tw-py-12 tw-px-10 tw-mx-auto tw-mb-20 tw-mt-8 tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center'>
        <NewModelForm state={state} setState={setState} onComplete={props.onComplete} />
      </div>
    </>
  );
};

type NewModelFormProps = {
  state: NewModelState;
  setState: (state: NewModelState) => void;
};

export const NewModelForm: React.FC<NewModelFormProps & { onComplete: () => void; }> = props => {
  const state = props.state;
  const setState = props.setState;
  let stepElement;
  switch (state.step) {
    case Step.One:
      stepElement = <NewModelStepOne state={state} setState={setState} />;
      break;
    case Step.Two:
      stepElement = <NewModelStepTwo state={state} setState={setState} />;
      break;
    case Step.Three:
      stepElement = <NewModelStepThree onComplete={props.onComplete} state={state} setState={setState} />;
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-[400px]">
      <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Model</div>
      {stepElement}
    </div>
  );
};

export const NewModelStepOne: React.FC<NewModelFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const onClick = () => {
    if (state.displayName != null && state.displayName.length > 0) {
      setState({ ...state, step: Step.Two });
    }
  };
  return (
    <>
      <div className="tw-w-full tw-text-center tw-mb-3 tw-font-bold tw-text-md">Step 1/3</div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" />
      <Button className="tw-mt-5 tw-h-10" onClick={onClick}>Continue</Button>
    </>
  );
};

export const NewModelStepTwo: React.FC<NewModelFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const onClick = () => {
    if (state.destination !== null) {
      if (state.tableType === TableType.SingleTable && state.namespace != null && state.namespace.length > 0 && state.tableName != null && state.tableName.length > 0) {
        setState({ ...state, step: Step.Three });
      }

      if (state.tableType === TableType.CustomJoin && state.customJoin != null && state.customJoin.length > 0) {
        setState({ ...state, step: Step.Three });
      }
    }
  };

  const tabClass = ({ selected }: { selected: boolean; }) =>
    classNames(
      'tw-w-full tw-rounded-lg tw-py-2 tw-text-sm tw-font-medium tw-leading-5',
      'tw-ring-white tw-ring-opacity-60 tw-ring-offset-2 tw-ring-offset-green-400 focus:tw-outline-none',
      selected
        ? 'tw-bg-white tw-shadow'
        : 'hover:tw-bg-gray-600 hover:tw-text-white'
    );

  return (
    <>
      <div className="tw-w-full tw-text-center tw-mb-4 tw-font-bold tw-text-md">Step 2/3</div>
      <Tab.Group onChange={value => setState({ ...state, tableType: value })} selectedIndex={state.tableType}>
        <Tab.List className="tw-flex tw-space-x-1 tw-rounded-xl tw-bg-gray-200 tw-p-1">
          <Tab className={tabClass}>Single Table</Tab>
          <Tab className={tabClass}>Custom Join</Tab>
        </Tab.List>
      </Tab.Group>
      <DestinationSelector
        className='tw-mt-4'
        validated={true}
        destination={state.destination}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            setState({ ...state, destination: value, namespace: undefined, tableName: undefined, customerIdColumn: undefined, });
          }
        }} />
      {
        state.tableType === TableType.SingleTable ?
          <>
            <NamespaceSelector
              className='tw-mt-3'
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
              className="tw-mt-3"
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
          </>
          :
          <ValidatedInput
            className="tw-mt-2"
            id='custom-join'
            value={state.customJoin}
            setValue={(value) => { setState({ ...state, customJoin: value }); }}
            placeholder='Custom Join'
            textarea={true}
            label="Custom Join"
          />
      }
      <Button className="tw-mt-6 tw-h-10" onClick={onClick}>Continue</Button>
    </>
  );
};

export const NewModelStepThree: React.FC<NewModelFormProps & { onComplete: () => void; }> = props => {
  const state = props.state;
  const setState = props.setState;
  const [loading, setLoading] = useState<boolean>(false);
  const [createModelSuccess, setCreateModelSuccess] = useState<boolean | null>(null);
  const { schema } = useSchema(state.destination?.connection.id, state.namespace, state.tableName, state.customJoin);

  const createNewModel = async () => {
    setLoading(true);

    if (!validateAll(state)) {
      setLoading(false);
      return;
    }

    const payload: CreateModelRequest = {
      'display_name': state.displayName!,
      'destination_id': state.destination!.id,
      'namespace': state.namespace!,
      'table_name': state.tableName!,
      'customer_id_column': state.customerIdColumn!.name,
      'model_fields': [],
    };

    if (state.customJoin != null) {
      payload.custom_join = state.customJoin;
    }

    try {
      await sendRequest(CreateModel, payload);
      mutate({ GetModels }); // Tell SWRs to refetch event sets
      setCreateModelSuccess(true);
    } catch (e) {
      setCreateModelSuccess(false);
    }

    setLoading(false);
  };

  if (createModelSuccess) {
    return (
      <div className="tw-w-[200%] tw-translate-x-[-25%]">
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your model is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <>
      <div className="tw-w-full tw-text-center tw-mb-3 tw-font-bold tw-text-md">Step 3/3</div>
      <ValidatedComboInput
        className="tw-mb-1"
        options={schema ? schema : []}
        selected={state.customerIdColumn}
        setSelected={(value: ColumnSchema) => { setState({ ...state, customerIdColumn: value }); }}
        getElementForDisplay={(value: ColumnSchema) => value.name}
        placeholder='Customer ID Column'
        noOptionsString="No Columns Available! (Return to previous step)"
        loading={!schema}
        validated={true}
      />
      <Button onClick={() => createNewModel()} className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</Button>
    </>
  );
};