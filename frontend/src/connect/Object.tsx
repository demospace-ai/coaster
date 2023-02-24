import { useState } from "react";
import { ObjectSelector } from "src/components/selector/Selector";
import { Object } from "src/rpc/api";

type WarehouseSelectorProps = {
  nextStep: () => void;
  linkToken: string;
};

export const ObjectSetup: React.FC<WarehouseSelectorProps> = props => {
  const [object, setObject] = useState<Object | undefined>(undefined);
  const submit = () => {
    props.nextStep();
  };

  return (
    <div className="tw-w-full tw-px-20">
      <div className="tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">Select your data warehouse</div>
      <div className="tw-text-center tw-mb-10 tw-text-slate-700">Choose the data warehouse, database, or data lake to connect.</div>
      <form className="tw-pb-16" onSubmit={submit}>
        <ObjectSelector object={object} setObject={setObject} linkToken={props.linkToken} />
      </form>
    </div>
  );
};