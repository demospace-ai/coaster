import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rudderanalytics } from "src/app/rudder";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ConnectionSelector, DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, CreateEventSet, CreateEventSetRequest, DataConnection, GetSchema, Schema } from "src/rpc/api";


type NewEventSetState = {
  eventSetName: string;
  connection: DataConnection | null;
  datasetId: string | null;
  tableName: string | null;
  eventTypeColumn: ColumnSchema | null;
  timeColumn: ColumnSchema | null;
  userIdentifierColumn: ColumnSchema | null;
};

const INITIAL_DATASET_STATE: NewEventSetState = {
  eventSetName: "",
  connection: null,
  datasetId: null,
  tableName: null,
  eventTypeColumn: null,
  timeColumn: null,
  userIdentifierColumn: null,
};

const validateAll = (state: NewEventSetState): boolean => {
  return state.eventSetName.length > 0
    && state.connection != null
    && state.datasetId != null && state.datasetId.length > 0
    && state.tableName != null && state.tableName.length > 0
    && state.eventTypeColumn != null
    && state.timeColumn != null
    && state.userIdentifierColumn != null;
};

export const NewEventSet: React.FC = () => {
  return (
    <div className='tw-flex tw-flex-row tw-h-full'>
      <div className='tw-m-[160px_auto_auto] tw-shadow-centered tw-bg-white tw-w-[400px] tw-pt-8 tw-pb-10 tw-px-8 tw-rounded-lg'>
        <NewEventSetForm />
      </div>
    </div>
  );
};

export const NewEventSetForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [createEventSetSuccess, setCreateEventSetSuccess] = useState<boolean | null>(null);
  const [state, setState] = useState<NewEventSetState>(INITIAL_DATASET_STATE);
  const navigate = useNavigate();
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
      'display_name': state.eventSetName,
      'connection_id': state.connection!.id,
      'dataset_name': state.datasetId!,
      'table_name': state.tableName!,
      'event_type_column': state.eventTypeColumn!.name,
      'timestamp_column': state.timeColumn!.name,
      'user_identifier_column': state.userIdentifierColumn!.name,
    };

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
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10' onClick={() => { navigate("/"); }}>Return Home</Button>
      </div>
    );
  }

  return (
    <>
      <BackButton className='tw-mb-4 tw-block' />
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
        />
        <FormButton className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</FormButton>
      </form>
    </>
  );
};