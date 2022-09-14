import { FormEvent, useEffect, useState } from "react";
import { BackButton, FormButton } from "src/components/button/Button";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ConnectionSelector, DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { ColumnSchema, GetSchema, Schema } from "src/rpc/api";


type NewEventSetState = {
  eventSetName: string;
  dataSourceId: number | null;
  datasetId: string | null;
  tableName: string | null;
  eventTypeColumn: ColumnSchema | null;
  timeColumn: ColumnSchema | null;
};

const INITIAL_DATASET_STATE: NewEventSetState = {
  eventSetName: "",
  dataSourceId: null,
  datasetId: null,
  tableName: null,
  eventTypeColumn: null,
  timeColumn: null,
};

export const NewEventSet: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [state, setState] = useState<NewEventSetState>(INITIAL_DATASET_STATE);
  useEffect(() => {
    if (!state.dataSourceId || !state.datasetId || !state.tableName) {
      return;
    }

    setSchemaLoading(true);
    let ignore = false;
    sendRequest(GetSchema, { connectionID: state.dataSourceId, datasetID: state.datasetId, tableName: state.tableName }).then((results) => {
      if (!ignore) {
        setSchema(results.schema);
      }

      setSchemaLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [state.dataSourceId, state.datasetId, state.tableName]);

  const createNewEventDataset = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
  };

  return (
    <div className='tw-flex tw-flex-row tw-h-full'>
      <div className='tw-m-[160px_auto_auto] tw-shadow-centered tw-bg-white tw-w-[400px] tw-pt-8 tw-pb-10 tw-px-8 tw-rounded-lg'>
        <BackButton className='tw-mb-4 tw-block' />
        <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Event Dataset</div>
        <form onSubmit={createNewEventDataset}>
          <ValidatedInput id='eventSetName' value={state.eventSetName} setValue={(value) => { setState({ ...state, eventSetName: value }); }} placeholder='Event Set Display Name' />
          <ConnectionSelector
            className='tw-my-1'
            validated={true}
            connectionID={state.dataSourceId}
            setConnectionID={(value: number) => {
              if (value !== state.dataSourceId) {
                setState({ ...state, dataSourceId: value, datasetId: null, tableName: null, eventTypeColumn: null, timeColumn: null });
              }
            }} />
          <DatasetSelector
            className='tw-mt-1'
            validated={true}
            connectionID={state.dataSourceId}
            datasetID={state.datasetId}
            setDatasetID={(value: string) => {
              if (value !== state.datasetId) {
                setState({ ...state, datasetId: value, tableName: null, eventTypeColumn: null, timeColumn: null });
              }
            }} />
          <TableSelector
            className="tw-mt-2"
            connectionID={state.dataSourceId}
            datasetID={state.datasetId}
            tableName={state.tableName}
            setTable={(value) => {
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
          <FormButton className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</FormButton>
        </form>
      </div>
    </div>
  );
};