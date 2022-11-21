import { CheckIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, MoreOptionsButton } from "src/components/button/Button";
import { SaveIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { AddPanelModal, ConfigureDashboardModal, DeleteDashboardModal } from "src/components/modal/Modal";
import { ExpandingTextarea } from "src/components/textarea/Textarea";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { DeleteDashboard, GetAllDashboards } from "src/rpc/api";
import { useDashboard } from "src/rpc/data";
import { useSWRConfig } from "swr";

type HeaderProps = {
  id: string;
  onSave: () => Promise<void>;
};

export const DashboardHeader: React.FC<HeaderProps> = props => {
  const { id, onSave } = props;
  const { dashboard, updateDashboard } = useDashboard(id);
  const [title, setTitle] = useState<string>(dashboard?.title || "");
  const [description, setDescription] = useState<string>(dashboard?.description || "");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveDone, setSaveDone] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfigureModal, setShowConfigureModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showAddPanelModal, setShowAddPanelModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  const updateTitle = () => {
    updateDashboard({ dashboard_id: Number(id), title });
  };

  const updateDescription = () => {
    updateDashboard({ dashboard_id: Number(id), description });
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

  const deleteDashboard = async () => {
    await sendRequest(DeleteDashboard, { dashboardID: Number(id) });
    mutate({ GetAllDashboards });
    // Now that the dashboard is deleted, we need to send the user somewhere that makes sense
    // TODO: if they got to this dashboard from search, we should return them there (maybe)
    navigate('/dashboards');
  };

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
    <div>
      <ConfigureDashboardModal dashboardID={id} show={showConfigureModal} close={() => setShowConfigureModal(false)} />
      <DeleteDashboardModal dashboardID={id} show={showDeleteModal} close={() => setShowDeleteModal(false)} deleteDashboard={deleteDashboard} />
      <AddPanelModal dashboardID={id} show={showAddPanelModal} close={() => setShowAddPanelModal(false)} />
      <div className="tw-mb-3 tw-flex tw-flex-row">
        <input className='tw-w-full tw-max-w-5xl tw-p-0.5 tw-font-semibold tw-text-2xl tw-peer' onChange={e => setTitle(e.target.value)} value={title} onBlur={updateTitle} />
        <div className='tw-flex tw-ml-auto'>
          <Button className="tw-flex tw-justify-center tw-items-center tw-ml-2 tw-w-36 tw-h-8 tw-bg-white tw-border-gray-400 tw-text-gray-800 hover:tw-bg-gray-200" onClick={() => setShowAddPanelModal(true)}>
            <PlusIcon className='tw-h-4 tw-stroke-2 tw-inline tw-mr-1.5' />
            <span>Add Chart</span>
          </Button>
          <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
          <Tooltip label="Copy Link">
            <div className="tw-flex tw-justify-center tw-items-center tw-mx-1 tw-w-8 tw-h-8 tw-bg-white tw-rounded-md tw-cursor-pointer tw-text-gray-800 hover:tw-bg-gray-200" onClick={copyLink}>
              {copied ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <LinkIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' />}
            </div>
          </Tooltip>
          <Tooltip label={<>Save<br />(⌘ + S)</>} className="tw-text-center">
            <div className="tw-flex tw-justify-center tw-items-center tw-mx-1 tw-w-8 tw-h-8 tw-bg-white tw-rounded-md tw-cursor-pointer tw-text-gray-800 hover:tw-bg-gray-200" onClick={manualSave}>
              {saving ? <Loading /> : saveDone ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <SaveIcon className='tw-h-5 tw-inline' />}
            </div>
          </Tooltip>
          <MoreOptionsButton id={id} showConfigureModal={() => setShowConfigureModal(true)} showDeleteModal={() => setShowDeleteModal(true)} />
        </div>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mr-10">
        <ExpandingTextarea className="tw-p-0.5 tw-w-full tw-max-w-5xl tw-resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Optional)" onBlur={updateDescription} />
      </div>
    </div>
  );
};