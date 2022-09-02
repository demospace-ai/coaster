import { useState } from "react";
import { Button } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { DataConnection } from "src/rpc/api";


export const NewQuery: React.FC = () => {
  const [connection, setConnection] = useState<DataConnection | null>(null);
  return (
    <div className="tw-m-10 tw-flex">
      <div className="tw-w-96 tw-inline-block">
        Data Source
        <ConnectionSelector connection={connection} setConnection={setConnection} />
      </div>
      <div className="tw-ml-10 tw-flex-grow">
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-border-b-0">
          <textarea className="tw-w-full tw-h-60 focus:tw-outline-none tw-resize-none tw-p-2 tw-font-mono" placeholder="Select ..." />
        </div>
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-p-2">
          <Button className="tw-w-32" onClick={() => { }}>Run</Button>
        </div>
      </div>
    </div>
  );
};