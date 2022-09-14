import { FormEvent, useState } from "react";
import { BackButton, FormButton } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { ValidatedComboInput, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";


type NewEventDatasetState = {
  datasetName: string;
  dataSourceId: number | null;
  tableName: string | null;
  eventTypeColumn: string | null;
  timeColumn: string | null;
  userIdentifierColumn: string | null;
};

const INITIAL_DATASET_STATE: NewEventDatasetState = {
  datasetName: "",
  dataSourceId: null,
  tableName: null,
  eventTypeColumn: null,
  timeColumn: null,
  userIdentifierColumn: null,
};

export const NewEventDataset: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<NewEventDatasetState>(INITIAL_DATASET_STATE);

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
          <ValidatedInput id='datasetName' value={state.datasetName} setValue={(value) => { setState({ ...state, datasetName: value }); }} placeholder='Dataset Display Name' />
          <ConnectionSelector
            className='tw-mt-1'
            validated={true}
            connectionID={state.dataSourceId} setConnectionID={(value: number) => { setState({ ...state, dataSourceId: value }); }} />
          <ValidatedComboInput
            className="tw-my-2"
            options={[]}
            selected={state.tableName}
            setSelected={(value) => { setState({ ...state, tableName: value }); }}
            getDisplayName={(value) => value.name}
            placeholder='Table Name'
            noOptionsString="No Tables Available! (Choose a source)"
            loading={false}
            validated={true}
          />
          <ValidatedComboInput
            className="tw-my-2"
            options={[]}
            selected={state.eventTypeColumn}
            setSelected={(value) => { setState({ ...state, eventTypeColumn: value }); }}
            getDisplayName={(value) => value.name}
            placeholder='Event Type Column'
            noOptionsString="No Columns Available! (Choose a table)"
            loading={false}
            validated={true}
          />
          <ValidatedComboInput
            className="tw-my-2"
            options={[]}
            selected={state.timeColumn}
            setSelected={(value) => { setState({ ...state, timeColumn: value }); }}
            getDisplayName={(value) => value.name}
            placeholder='Timestamp Column'
            noOptionsString="No Columns Available! (Choose a table)"
            loading={false}
            validated={true}
          />
          <ValidatedComboInput
            className="tw-my-2"
            options={[]}
            selected={state.userIdentifierColumn}
            setSelected={(value) => { setState({ ...state, userIdentifierColumn: value }); }}
            getDisplayName={(value) => value.name}
            placeholder='User Identifier Column'
            noOptionsString="No Columns Available! (Choose a table)"
            loading={false}
            validated={true}
          />
          <FormButton className='tw-mt-5 tw-w-full tw-h-10'>{loading ? <Loading /> : "Save"}</FormButton>
        </form>
      </div>
    </div>
  );
};