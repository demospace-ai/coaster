import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, EllipsisHorizontalIcon, LinkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { Fragment, MouseEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { SaveIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { ConfigureDashboardModal, DeleteDashboardModal } from "src/components/modal/Modal";
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
    updateDashboard({ dashboard_id: Number(id), title });
  };

  const updateDescription = () => {
    updateDashboard({ dashboard_id: Number(id), description });
  };

  const manualSave = useCallback(async () => {
    setSaving(true);
    await onSave();
    setTimeout(() => setSaving(false), 500);
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
      <div className="tw-mb-3 tw-flex tw-flex-row">
        <input className='tw-w-full tw-max-w-5xl tw-p-0.5 tw-font-semibold tw-text-2xl tw-peer' onChange={e => setTitle(e.target.value)} value={title} onBlur={updateTitle} />
        <div className='tw-flex tw-ml-auto'>
          <MoreOptionsButton id={id} className='tw-flex tw-justify-center tw-align-middle tw-ml-3' showConfigureModal={() => setShowConfigureModal(true)} showDeleteModal={() => setShowDeleteModal(true)} />
          <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
          <Button className="tw-border-gray-400 tw-flex tw-justify-center tw-items-center tw-mr-2 tw-w-[34px] tw-h-8 tw-px-0 tw-py-0 tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200" onClick={copyLink}>
            {copied ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <LinkIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' />}
          </Button>
          <Tooltip label="⌘ + S">
            <Button className="tw-flex tw-justify-center tw-align-middle tw-ml-1 tw-w-24 tw-h-8 tw-bg-white tw-border-gray-400 tw-text-gray-800 hover:tw-bg-gray-200" onClick={manualSave}>
              {saving ? <Loading /> : <><SaveIcon className='tw-h-5 tw-inline tw-mr-1' />Save</>}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mr-10">
        <ExpandingTextarea className="tw-p-0.5 tw-w-full tw-max-w-5xl tw-resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Optional)" onBlur={updateDescription} />
      </div>
    </div>
  );
};

const MoreOptionsButton: React.FC<{ id: string; className?: string; showConfigureModal: () => void; showDeleteModal: () => void; }> = props => {
  const menuItem = 'tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded';
  return (
    <Menu as="div" className={classNames("tw-relative tw-inline", props.className)}>
      <Menu.Button onClick={(e: MouseEvent) => e.stopPropagation()} className='tw-z-0 tw-w-8 tw-h-8 tw-rounded-md tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200'>
        <EllipsisHorizontalIcon className='tw-inline tw-h-6' strokeWidth="2" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <Menu.Items className="tw-z-10 tw-absolute tw-origin-top-right tw-right-0 tw-top-10 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="tw-m-1">
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.showConfigureModal(); }} className={classNames(
                  active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                  menuItem
                )}>
                  Configure
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.showDeleteModal(); }} className={classNames(
                  active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                  menuItem
                )}>
                  Delete
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
