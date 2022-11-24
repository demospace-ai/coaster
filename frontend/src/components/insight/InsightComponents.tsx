import { CheckIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreOptionsButton } from "src/components/button/Button";
import { BoxLeftIcon, SaveIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { ConfigureAnalysisModal, DeleteAnalysisModal } from "src/components/modal/Modal";
import { PropertySelector } from "src/components/selector/Selector";
import { ExpandingTextarea } from "src/components/textarea/Textarea";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { DeleteAnalysis, GetAllAnalyses, Property, UpdateAnalysisRequest } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";
import { useSWRConfig } from "swr";

type HeaderProps = {
  id: string;
  onSave: () => Promise<void>;
  showSchemaExplorer?: () => void;
};

export const ReportHeader: React.FC<HeaderProps> = props => {
  const { id, onSave, showSchemaExplorer } = props;
  const { analysis, updateAnalysis } = useAnalysis(id);
  const [title, setTitle] = useState<string>(analysis?.title || "");
  const [description, setDescription] = useState<string>(analysis?.description || "");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveDone, setSaveDone] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfigureModal, setShowConfigureModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();

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
    setTimeout(() => {
      setSaveDone(true);
      setSaving(false);
      setTimeout(() => {
        setSaveDone(false);
      }, 1000);
    }, 500);

  }, [onSave]);

  const deleteAnalysis = async () => {
    await sendRequest(DeleteAnalysis, { analysisID: Number(id) });
    mutate({ GetAllAnalyses });
    // Now that the analysis is deleted, we need to send the user somewhere that makes sense
    // TODO: if they got to this insight from search, we should return them there (maybe)
    navigate('/insights');
  };

  // TODO: allow people to cancel renaming the title/description.
  useEffect(() => {
    const onSave = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        manualSave();
      }
    };

    document.addEventListener('keydown', onSave);
    return () => {
      document.removeEventListener('keydown', onSave);
    };
  });

  return (
    <div>
      <ConfigureAnalysisModal analysisID={id} show={showConfigureModal} close={() => setShowConfigureModal(false)} />
      <DeleteAnalysisModal analysisID={id} show={showDeleteModal} close={() => setShowDeleteModal(false)} deleteAnalysis={deleteAnalysis} />
      <div className="tw-mb-3 tw-flex tw-flex-row">
        <input className='tw-w-full -tw-ml-0.5 tw-max-w-5xl tw-p-0.5 tw-font-semibold tw-text-2xl tw-peer' onChange={e => setTitle(e.target.value)} value={title} onBlur={updateTitle} />
        <div className='tw-flex tw-ml-auto'>
          <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
          <Tooltip label="Copy Link">
            <div className="tw-flex tw-justify-center tw-items-center tw-mx-1 tw-w-8 tw-h-8 tw-bg-white tw-rounded-md tw-cursor-pointer tw-text-gray-800 hover:tw-bg-gray-200" onClick={copyLink}>
              {copied ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <LinkIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' />}
            </div>
          </Tooltip>
          <Tooltip label="Save (⌘ + S)">
            <div className="tw-flex tw-justify-center tw-items-center tw-mx-1 tw-w-8 tw-h-8 tw-bg-white tw-rounded-md tw-cursor-pointer tw-text-gray-800 hover:tw-bg-gray-200" onClick={manualSave}>
              {saving ? <Loading /> : saveDone ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <SaveIcon className='tw-h-5 tw-inline' />}
            </div>
          </Tooltip>
          <MoreOptionsButton id={id} showConfigureModal={() => setShowConfigureModal(true)} showDeleteModal={() => setShowDeleteModal(true)} />
          <div className="tw-relative">
            {showSchemaExplorer &&
              <BoxLeftIcon className="tw-absolute tw-top-16 tw-right-0 tw-h-5 tw-stroke-[1.5] tw-ml-1 tw-rounded-md tw-cursor-pointer hover:tw-bg-gray-200" onClick={showSchemaExplorer} />
            }
          </div>
        </div>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mr-10">
        <ExpandingTextarea className="-tw-ml-0.5 tw-p-0.5 tw-w-full tw-max-w-5xl tw-resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Optional)" onBlur={updateDescription} />
      </div>
    </div>
  );
};

export const BreakdownSection: React.FC<{ analysisID: string; }> = ({ analysisID }) => {
  const { analysis, updateAnalysis } = useAnalysis(analysisID);

  const updateBreakdown = async (updatedBreakdown: Property) => {
    if (!analysisID || !analysis) {
      return;
    }

    if (updatedBreakdown === analysis.breakdown) {
      return;
    }

    const payload: UpdateAnalysisRequest = {
      analysis_id: Number(analysisID),
      breakdown: updatedBreakdown,
    };

    await updateAnalysis(payload);
  };

  return (
    <>
      <div className='tw-uppercase tw-font-bold tw-mb-2 tw-text-xs tw-select-none'>Breakdown by</div>
      <PropertySelector property={analysis?.breakdown} setProperty={updateBreakdown} connectionID={analysis?.connection?.id} eventSetID={analysis?.event_set?.id} />
    </>
  );
};