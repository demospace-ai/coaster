import React from "react";
import { ValidatedDropdownInput } from "src/components/input/Input";
import { SetupSyncProps } from "src/connect/App";
import { useObjectSchema } from "src/rpc/data";


export const FinalizeSync: React.FC<SetupSyncProps> = (props) => {
  const { schema } = useObjectSchema(props.state.object?.id, props.linkToken);

  return (
    <div className="tw-w-full tw-px-20 tw-flex tw-flex-col tw-items-center">
      <div className="tw-text-center tw-mb-8 tw-text-2xl tw-font-bold">Finalize your sync configuration</div>
      <div className="tw-w-[50%] tw-min-w-[400px] tw-h-full">
        <div className="tw-text-base tw-font-semibold tw-mb-1">Columns Mapping</div>
        <div className="tw-text-slate-600">This is how your data will be populated to the fields in the application.</div>
        {schema?.map(column => {
          return <div>{column.name}</div>;
        })}
        <div className="tw-text-base tw-font-semibold tw-mt-8 tw-mb-1">Replication Configuration</div>
        <div className="tw-text-slate-600">Configure settings for the replication itself.</div>
        <ValidatedDropdownInput options={["minute", "hour", "day", "week"]} selected="minute" setSelected={() => { }} loading={false} placeholder="Replication Frequency" noOptionsString="nil" />
        <div className="tw-pb-52"></div>
      </div>
    </div>
  );
};