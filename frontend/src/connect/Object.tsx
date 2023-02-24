import React, { useImperativeHandle, useState } from "react";
import { ObjectSelector, SourceNamespaceSelector, SourceTableSelector } from "src/components/selector/Selector";
import { SetupStep } from "src/connect/App";
import { Object, Source } from "src/rpc/api";

type ObjectSetupProps = {
  nextStep: () => void;
  linkToken: string;
  source: Source;
};

export const ObjectSetup = React.forwardRef<SetupStep, ObjectSetupProps>((props, ref) => {
  const [object, setObject] = useState<Object | undefined>(undefined);
  const [namespace, setNamespace] = useState<string | undefined>(undefined);
  const [tableName, setTableName] = useState<string | undefined>(undefined);
  useImperativeHandle(ref, () => {
    return {
      continue: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        props.nextStep();
      }
    };
  });

  return (
    <div className="tw-w-full tw-px-20 tw-flex tw-flex-col">
      <div className="tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">Select your data warehouse</div>
      <div className="tw-text-center tw-mb-10 tw-text-slate-700">Choose the data warehouse, database, or data lake to connect.</div>
      <div className="tw-z-[99] tw-h-full">
        <ObjectSelector object={object} setObject={setObject} linkToken={props.linkToken} />
        <SourceNamespaceSelector namespace={namespace} setNamespace={setNamespace} linkToken={props.linkToken} source={undefined} />
        <SourceTableSelector tableName={tableName} setTableName={setTableName} linkToken={props.linkToken} source={undefined} namespace={namespace} />
      </div>
    </div>
  );
});