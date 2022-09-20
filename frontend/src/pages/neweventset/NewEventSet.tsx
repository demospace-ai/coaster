import { FormEvent, useEffect, useState } from "react";
import { rudderanalytics } from "src/app/rudder";
import { Button, FormButton } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ConnectionSelector, DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateEventSet, CreateEventSetRequest, DataConnection, GetSchema, Schema } from "src/rpc/api";


type NewEventSetState = {
  eventSetName: string | null;
  connection: DataConnection | null;
  datasetId: string | null;
  tableName: string | null;
  eventTypeColumn: ColumnSchema | null;
  timeColumn: ColumnSchema | null;
  userIdentifierColumn: ColumnSchema | null;
  customJoin: string | null;
};

const INITIAL_DATASET_STATE: NewEventSetState = {
  eventSetName: null,
  connection: null,
  datasetId: null,
  tableName: null,
  eventTypeColumn: null,
  timeColumn: null,
  userIdentifierColumn: null,
  customJoin: null,
};

const validateAll = (state: NewEventSetState): boolean => {
  return state.eventSetName != null && state.eventSetName.length > 0
    && state.connection != null
    && state.datasetId != null && state.datasetId.length > 0
    && state.tableName != null && state.tableName.length > 0
    && state.eventTypeColumn != null
    && state.timeColumn != null
    && state.userIdentifierColumn != null;
};

export const NewEventSet: React.FC<{ onComplete: () => void; }> = props => {
  return (
    <div className='tw-w-[400px] tw-pb-10 tw-px-8'>
      <NewEventSetForm onComplete={props.onComplete} />
    </div>
  );
};

export const NewEventSetForm: React.FC<{ onComplete: () => void; }> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [createEventSetSuccess, setCreateEventSetSuccess] = useState<boolean | null>(null);
  const [state, setState] = useState<NewEventSetState>(INITIAL_DATASET_STATE);
  useEffect(() => {
    if (!state.connection || !state.datasetId || !state.tableName) {
      return;
    }

    setSchemaLoading(true);
    let ignore = false;
    sendRequest(GetSchema, { connectionID: state.connection.id, datasetID: state.datasetId, tableName: state.tableName }).then((results) => {
      if (!ignore) {
        setSchema(results.schema);
      }

      setSchemaLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [state.connection, state.datasetId, state.tableName]);

  const createNewEventDataset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateAll(state)) {
      setLoading(false);
      return;
    }

    const payload: CreateEventSetRequest = {
      'display_name': state.eventSetName!,
      'connection_id': state.connection!.id,
      'dataset_name': state.datasetId!,
      'table_name': state.tableName!,
      'event_type_column': state.eventTypeColumn!.name,
      'timestamp_column': state.timeColumn!.name,
      'user_identifier_column': state.userIdentifierColumn!.name,
    };

    if (state.customJoin != null) {
      payload.custom_join = state.customJoin;
    }

    try {
      rudderanalytics.track("create_event_set.start");
      await sendRequest(CreateEventSet, payload);
      rudderanalytics.track("create_event_set.success");
      setCreateEventSetSuccess(true);
    } catch (e) {
      rudderanalytics.track("create_event_set.error");
      setCreateEventSetSuccess(false);
    }

    setLoading(false);
  };

  if (createEventSetSuccess) {
    return (
      <div>
        <div className='tw-mt-10 tw-text-center tw-font-bold'>🎉 Congratulations! Your event set is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <>
      <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Event Dataset</div>
      <form onSubmit={createNewEventDataset}>
        <ValidatedInput id='eventSetName' value={state.eventSetName} setValue={(value) => { setState({ ...state, eventSetName: value }); }} placeholder='Event Set Display Name' />
        <ConnectionSelector
          className='tw-my-1'
          validated={true}
          connection={state.connection}
          setConnection={(value: DataConnection) => {
            if (!state.connection || value.id !== state.connection.id) {
              setState({ ...state, connection: value, datasetId: null, tableName: null, eventTypeColumn: null, timeColumn: null });
            }
          }} />
        <DatasetSelector
          className='tw-mt-1'
          validated={true}
          connectionID={state.connection ? state.connection.id : null}
          datasetID={state.datasetId}
          setDatasetID={(value: string) => {
            if (value !== state.datasetId) {
              setState({ ...state, datasetId: value, tableName: null, eventTypeColumn: null, timeColumn: null });
            }
          }}
          noOptionsString="No Datasets Available! (Choose a data source)"
        />
        <TableSelector
          className="tw-mt-2"
          connectionID={state.connection ? state.connection.id : null}
          datasetID={state.datasetId}
          tableName={state.tableName}
          setTableName={(value: string) => {
            if (value !== state.tableName) {
              setState({ ...state, tableName: value, eventTypeColumn: null, timeColumn: null });
            }
          }}
          noOptionsString="No Tables Available! (Choose a dataset)"
          validated={true}
        />
        <ValidatedComboInput
          className="tw-my-2"
          options={schema ? schema : []}
          selected={state.eventTypeColumn}
          setSelected={(value: ColumnSchema) => { setState({ ...state, eventTypeColumn: value }); }}
          getDisplayName={(value: ColumnSchema) => value.name}
          placeholder='Event Type Column'
          noOptionsString="No Columns Available! (Choose a table)"
          loading={schemaLoading}
          validated={true}
        />
        <ValidatedComboInput
          className="tw-my-2"
          options={schema ? schema : []}
          selected={state.timeColumn}
          setSelected={(value: ColumnSchema) => { setState({ ...state, timeColumn: value }); }}
          getDisplayName={(value: ColumnSchema) => value.name}
          placeholder='Timestamp Column'
          noOptionsString="No Columns Available! (Choose a table)"
          loading={schemaLoading}
          validated={true}
        />
        <ValidatedComboInput
          className="tw-my-2"
          options={schema ? schema : []}
          selected={state.userIdentifierColumn}
          setSelected={(value: ColumnSchema) => { setState({ ...state, userIdentifierColumn: value }); }}
          getDisplayName={(value: ColumnSchema) => value.name}
          placeholder='User Identifier Column'
          noOptionsString="No Columns Available! (Choose a table)"
          loading={schemaLoading}
          validated={true}
          allowCustom={true}
        />
        <ValidatedInput
          className="tw-mt-0 tw-mb-2"
          id='custom-join'
          value={state.customJoin}
          setValue={(value) => { setState({ ...state, customJoin: value }); }}
          placeholder='Custom Join (Optional)'
          textarea={true}
        />
        <FormButton className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</FormButton>
      </form>
    </>
  );
};