import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { BackButton, Button } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ConnectionSelector, DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateEventSet, CreateEventSetRequest, DataConnection, GetEventSets, GetSchema, GetSchemaRequest, Schema } from "src/rpc/api";
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

type NewEventSetState = {
  eventSetName: string | undefined;
  connection: DataConnection | undefined;
  datasetName: string | undefined;
  tableName: string | undefined;
  eventTypeColumn: ColumnSchema | undefined;
  timeColumn: ColumnSchema | undefined;
  userIdentifierColumn: ColumnSchema | undefined;
  customJoin: string | undefined;
  step: Step;
  tableType: TableType;
};

const INITIAL_DATASET_STATE: NewEventSetState = {
  eventSetName: undefined,
  connection: undefined,
  datasetName: undefined,
  tableName: undefined,
  eventTypeColumn: undefined,
  timeColumn: undefined,
  userIdentifierColumn: undefined,
  customJoin: undefined,
  step: Step.One,
  tableType: TableType.SingleTable,
};

const validateAll = (state: NewEventSetState): boolean => {
  return state.eventSetName !== undefined && state.eventSetName.length > 0
    && state.connection !== undefined
    && ((state.datasetName !== undefined && state.datasetName.length > 0 && state.tableName !== undefined && state.tableName.length > 0) || (state.customJoin !== undefined && state.customJoin.length > 0))
    && state.eventTypeColumn !== undefined
    && state.timeColumn !== undefined
    && state.userIdentifierColumn !== undefined;
};

export const NewEventSet: React.FC<{ onComplete: () => void; }> = props => {
  const [state, setState] = useState<NewEventSetState>(INITIAL_DATASET_STATE);
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
      <BackButton className="tw-mt-10 tw-mx-10" onClick={onBack} />
      <div className="tw-flex tw-justify-center tw-h-full">
        <div className='tw-w-[400px] tw-pb-10 tw-px-8 tw-mx-auto tw-mt-24'>
          <NewEventSetForm state={state} setState={setState} onComplete={props.onComplete} />
        </div>
      </div>
    </>
  );
};

type NewEventSetFormProps = {
  state: NewEventSetState;
  setState: (state: NewEventSetState) => void;
};

export const NewEventSetForm: React.FC<NewEventSetFormProps & { onComplete: () => void; }> = props => {
  const state = props.state;
  const setState = props.setState;
  let stepElement;
  switch (state.step) {
    case Step.One:
      stepElement = <NewEventSetStepOne state={state} setState={setState} />;
      break;
    case Step.Two:
      stepElement = <NewEventSetStepTwo state={state} setState={setState} />;
      break;
    case Step.Three:
      stepElement = <NewEventSetStepThree onComplete={props.onComplete} state={state} setState={setState} />;
      break;
  }

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Event Dataset</div>
      {stepElement}
    </div>
  );
};

export const NewEventSetStepOne: React.FC<NewEventSetFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const onClick = () => {
    if (state.eventSetName != null && state.eventSetName.length > 0) {
      setState({ ...state, step: Step.Two });
    }
  };
  return (
    <>
      <div className="tw-w-full tw-text-center tw-mb-3 tw-font-bold tw-text-md">Step 1/3</div>
      <ValidatedInput id='eventSetName' value={state.eventSetName} setValue={(value) => { setState({ ...state, eventSetName: value }); }} placeholder='Event Set Display Name' />
      <Button className="tw-mt-5 tw-h-10" onClick={onClick}>Continue</Button>
    </>
  );
};

export const NewEventSetStepTwo: React.FC<NewEventSetFormProps> = props => {
  const state = props.state;
  const setState = props.setState;
  const onClick = () => {
    if (state.connection != null) {
      if (state.tableType === TableType.SingleTable && state.datasetName != null && state.datasetName.length > 0 && state.tableName != null && state.tableName.length > 0) {
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
      <ConnectionSelector
        className='tw-mt-4 tw-mb-1'
        validated={true}
        connection={state.connection}
        setConnection={(value: DataConnection) => {
          if (!state.connection || value.id !== state.connection.id) {
            setState({ ...state, connection: value, datasetName: undefined, tableName: undefined, eventTypeColumn: undefined, timeColumn: undefined });
          }
        }} />
      {
        state.tableType === TableType.SingleTable ?
          <>
            <DatasetSelector
              className='tw-my-1'
              validated={true}
              connection={state.connection}
              datasetName={state.datasetName}
              setDatasetName={(value: string) => {
                if (value !== state.datasetName) {
                  setState({ ...state, datasetName: value, tableName: undefined, eventTypeColumn: undefined, timeColumn: undefined });
                }
              }}
              noOptionsString="No Datasets Available! (Choose a data source)"
            />
            <TableSelector
              className="tw-mt-1"
              connection={state.connection}
              datasetName={state.datasetName}
              tableName={state.tableName}
              setTableName={(value: string) => {
                if (value !== state.tableName) {
                  setState({ ...state, tableName: value, eventTypeColumn: undefined, timeColumn: undefined });
                }
              }}
              noOptionsString="No Tables Available!"
              validated={true}
            />
          </>
          :
          <ValidatedInput
            className="tw-mt-1"
            id='custom-join'
            value={state.customJoin}
            setValue={(value) => { setState({ ...state, customJoin: value }); }}
            placeholder='Custom Join'
            textarea={true}
          />
      }
      <Button className="tw-mt-5 tw-h-10" onClick={onClick}>Continue</Button>
    </>
  );
};

export const NewEventSetStepThree: React.FC<NewEventSetFormProps & { onComplete: () => void; }> = props => {
  const state = props.state;
  const setState = props.setState;
  const [loading, setLoading] = useState<boolean>(false);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [createEventSetSuccess, setCreateEventSetSuccess] = useState<boolean | null>(null);
  useEffect(() => {
    setSchemaLoading(true);

    if (!state.connection) {
      return;
    }

    let payload: GetSchemaRequest = {
      connectionID: state.connection.id,
    };

    if (state.tableType === TableType.SingleTable && state.datasetName && state.tableName) {
      payload.datasetID = state.datasetName;
      payload.tableName = state.tableName;
    } else if (state.tableType === TableType.CustomJoin && state.customJoin) {
      payload.customJoin = state.customJoin;
    } else {
      return;
    }

    let ignore = false;
    sendRequest(GetSchema, payload).then((results) => {
      if (!ignore) {
        setSchema(results.schema);
        setSchemaLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [state.connection, state.datasetName, state.tableName, state.customJoin, state.tableType]);

  const createNewEventDataset = async () => {
    setLoading(true);

    if (!validateAll(state)) {
      setLoading(false);
      return;
    }

    const payload: CreateEventSetRequest = {
      'display_name': state.eventSetName!,
      'connection_id': state.connection!.id,
      'dataset_name': state.datasetName!,
      'table_name': state.tableName!,
      'event_type_column': state.eventTypeColumn!.name,
      'timestamp_column': state.timeColumn!.name,
      'user_identifier_column': state.userIdentifierColumn!.name,
    };

    if (state.customJoin != null) {
      payload.custom_join = state.customJoin;
    }

    try {
      await sendRequest(CreateEventSet, payload);
      mutate({ GetEventSets }); // Tell SWRs to refetch event sets
      setCreateEventSetSuccess(true);
    } catch (e) {
      setCreateEventSetSuccess(false);
    }

    setLoading(false);
  };

  if (createEventSetSuccess) {
    return (
      <div className="tw-w-[200%] tw-translate-x-[-25%]">
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your event set is set up. 🎉</div>
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
        selected={state.eventTypeColumn}
        setSelected={(value: ColumnSchema) => { setState({ ...state, eventTypeColumn: value }); }}
        getElementForDisplay={(value: ColumnSchema) => value.name}
        placeholder='Event Type Column'
        noOptionsString="No Columns Available! (Choose a table)"
        loading={schemaLoading}
        validated={true}
      />
      <ValidatedComboInput
        className="tw-my-1"
        options={schema ? schema : []}
        selected={state.timeColumn}
        setSelected={(value: ColumnSchema) => { setState({ ...state, timeColumn: value }); }}
        getElementForDisplay={(value: ColumnSchema) => value.name}
        placeholder='Timestamp Column'
        noOptionsString="No Columns Available! (Choose a table)"
        loading={schemaLoading}
        validated={true}
      />
      <ValidatedComboInput
        className="tw-my-1"
        options={schema ? schema : []}
        selected={state.userIdentifierColumn}
        setSelected={(value: ColumnSchema) => { setState({ ...state, userIdentifierColumn: value }); }}
        getElementForDisplay={(value: ColumnSchema) => value.name}
        placeholder='User Identifier Column'
        noOptionsString="No Columns Available! (Choose a table)"
        loading={schemaLoading}
        validated={true}
      />
      <Button onClick={() => createNewEventDataset()} className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</Button>
    </>
  );
};