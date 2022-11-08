import { CheckIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { Button, MoreOptionsButton } from "src/components/button/Button";
import { BoxLeftIcon, SaveIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { useAnalysis } from "src/rpc/data";

type HeaderProps = {
  id: string;
  onSave: () => Promise<void>;
  showModal: () => void;
  showSchemaExplorer?: () => void;
};

export const ReportHeader: React.FC<HeaderProps> = props => {
  const { id, onSave, showModal, showSchemaExplorer } = props;
  const { analysis, updateAnalysis } = useAnalysis(id);
  const [title, setTitle] = useState<string>(analysis?.title || "");
  const [description, setDescription] = useState<string>(analysis?.description || "");
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  const updateTitle = () => {
    updateAnalysis({ analysis_id: Number(id), title });
  };

  const updateDescription = () => {
    updateAnalysis({ analysis_id: Number(id), description });
  };

  const manualSave = useCallback(async () => {
    setSaving(true);
    await onSave();
    setTimeout(() => setSaving(false), 500);
  }, [onSave]);

  // TODO: allow people to cancel renaming the title/description.
  useEffect(() => {
    const onSave = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "s") {
        manualSave();
      }
    };

    document.addEventListener('keydown', onSave);
    return () => {
      document.removeEventListener('keydown', onSave);
    };
  });

  return (
    <div className="">
      <div className="tw-mb-3 tw-flex tw-flex-row">
        <input className='tw-w-full tw-font-semibold tw-text-2xl tw-peer' onChange={e => setTitle(e.target.value)} value={title} onBlur={updateTitle} />
        <div className="tw-bg-fabra-green-500 tw-text-white tw-rounded-md tw-justify-center tw-flex tw-items-center tw-px-3 tw-ml-2 tw-cursor-pointer tw-invisible peer-focus:tw-visible hover:tw-bg-fabra-green-600 tw-font-semibold">Save</div>
        <div className='tw-flex tw-ml-auto'>
          <MoreOptionsButton className='tw-flex tw-justify-center tw-align-middle tw-ml-3' showModal={showModal} />
          <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
          <Button className="tw-border-gray-400 tw-flex tw-justify-center tw-items-center tw-mr-2 tw-w-[34px] tw-h-8 tw-px-0 tw-py-0 tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200" onClick={copyLink}>
            {copied ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <LinkIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' />}
          </Button>
          <Tooltip label="⌘ + S">
            <Button className="tw-flex tw-justify-center tw-align-middle tw-ml-1 tw-w-24 tw-h-8 tw-bg-white tw-border-gray-400 tw-text-gray-800 hover:tw-bg-gray-200" onClick={manualSave}>
              {saving ? <Loading /> : <><SaveIcon className='tw-h-5 tw-inline tw-mr-1' />Save</>}
            </Button>
          </Tooltip>
          <div className="tw-relative">
            {showSchemaExplorer &&
              <BoxLeftIcon className="tw-absolute tw-top-16 tw-right-0 tw-h-5 tw-stroke-[1.5] tw-ml-1 tw-rounded-md tw-cursor-pointer hover:tw-bg-gray-200" onClick={showSchemaExplorer} />
            }
          </div>
        </div>
      </div>
      <div className="tw-flex tw-flex-row">
        <textarea className="tw-peer tw-w-full tw-resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Optional)" onBlur={updateDescription} />
        <div className="tw-bg-fabra-green-500 tw-text-white tw-rounded-md tw-justify-center tw-flex tw-items-center tw-px-3 tw-ml-2 tw-cursor-pointer tw-invisible peer-focus:tw-visible hover:tw-bg-fabra-green-600 tw-font-semibold">Save</div>
      </div>
    </div>
  );
};