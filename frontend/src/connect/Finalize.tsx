import React, { useState } from "react";
import { ValidatedDropdownInput, ValidatedInput } from "src/components/input/Input";
import { SetupSyncProps } from "src/connect/App";
import { FrequencyUnits } from "src/rpc/api";
import { useObject } from "src/rpc/data";


export const FinalizeSync: React.FC<SetupSyncProps> = (props) => {
  const { object } = useObject(props.state.object?.id, props.linkToken);
  const [frequency, setFrequency] = useState<number | undefined>(undefined);
  const [frequencyUnits, setFrequencyUnits] = useState<FrequencyUnits | undefined>(undefined);

  return (
    <div className="tw-w-full tw-px-28 tw-flex tw-flex-col">
      <div className="tw-text-left tw-mb-5 tw-text-2xl tw-font-bold tw-text-slate-900">Finalize your sync configuration</div>
      <div className="tw-w-[50%] tw-min-w-[400px] tw-h-full">
        <div className="tw-text-base tw-font-medium tw-mb-1 tw-text-slate-800">Display Name</div>
        <div className="tw-text-slate-600 tw-mb-4">Choose a name to help you identify this sync in the future.</div>
        <ValidatedInput id="display_name" value={""} setValue={() => { }} placeholder="Display Name" />
        <div className="tw-text-base tw-font-medium tw-mt-8 tw-mb-1 tw-text-slate-800">Columns Mapping</div>
        <div className="tw-text-slate-600">This is how your data will be populated to the fields in the application.</div>
        {object?.object_fields.map(objectField => {
          return <div key={objectField.name}>{objectField.display_name}</div>;
        })}
        <div className="tw-text-base tw-font-medium tw-mt-8 tw-mb-1 tw-text-slate-800">Replication Configuration</div>
        <div className="tw-text-slate-600">Configure settings for the replication itself.</div>
        <ValidatedInput id="frequency" min={frequencyUnits === FrequencyUnits.Minutes ? 30 : 1} type="number" value={frequency} setValue={setFrequency} placeholder="Replication Frequency" label="Replication Frequency" />
        <ValidatedDropdownInput options={Object.values(FrequencyUnits)} selected={frequencyUnits} setSelected={setFrequencyUnits} loading={false} placeholder="Frequency Units" noOptionsString="nil" label="Frequency Unit" getElementForDisplay={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
        <div className="tw-pb-52"></div>
      </div>
    </div>
  );
};