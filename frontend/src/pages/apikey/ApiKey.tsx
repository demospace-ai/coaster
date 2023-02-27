import { EyeIcon, EyeSlashIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { useApiKey } from "src/rpc/data";

export const ApiKey: React.FC = () => {
  const { apiKey } = useApiKey();
  const [visible, setVisible] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string>("Copy");
  const copy = () => {
    navigator.clipboard.writeText(apiKey ? apiKey : "");
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 1200);
  };

  return (
    <div className='tw-py-5 tw-px-10'>
      <div className="tw-flex tw-w-full tw-mt-2 tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">API Key</div>
      </div>
      <div className='tw-border tw-border-solid tw-border-slate-300 tw-rounded-lg tw-max-w-lg tw-overflow-x-auto tw-overscroll-contain tw-p-2 tw-bg-white' >
        {visible ?
          (<div className="tw-flex tw-items-center">
            <EyeSlashIcon className="tw-h-4 tw-ml-1 tw-mr-2 tw-cursor-pointer" onClick={() => setVisible(false)} />
            {apiKey}
            <Tooltip label={copyText} placement="top" hideOnClick={false}>
              <Square2StackIcon className="tw-h-4 tw-ml-auto tw-mr-1 tw-cursor-pointer tw-outline-none" onClick={copy} />
            </Tooltip>
          </div>)
          :
          (<div className="tw-flex tw-items-center">
            <EyeIcon className="tw-h-4 tw-cursor-pointer tw-ml-1 tw-mr-2" onClick={() => setVisible(true)} />
            •••••••••••••••••••••••••••••••••••••••••••••••••••
            <Tooltip label={copyText} placement="top" hideOnClick={false}>
              <Square2StackIcon className="tw-h-4 tw-ml-auto tw-mr-1 tw-cursor-pointer tw-outline-none" onClick={copy} />
            </Tooltip>
          </div>)
        }
      </div>
    </div>
  );
};
