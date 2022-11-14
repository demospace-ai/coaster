import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import React, { Fragment, MouseEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DivButton } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import { DeleteAnalysisModal } from 'src/components/modal/Modal';
import { sendRequest } from 'src/rpc/ajax';
import { Dashboard, DeleteDashboard } from 'src/rpc/api';
import { useDashboards } from "src/rpc/data";

export const Dashboards: React.FC = () => {
  const navigate = useNavigate();
  const { dashboards, mutate } = useDashboards();
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);

  const onClick = (dashboard: Dashboard) => {
    navigate(`/dashboard/${dashboard.id}`);
  };

  const deleteDashboard = useCallback(async (dashboardID: number) => {
    await sendRequest(DeleteDashboard, { dashboardID });
    const updatedDashboards = dashboards ? dashboards.filter(dashboard => dashboard.id !== dashboardID) : [];
    mutate({ dashboards: updatedDashboards });
  }, [dashboards, mutate]);

  return (
    <div className='tw-h-full tw-overflow-scroll'>
      <div className='tw-w-full'>
        {dashboardToDelete && <DeleteAnalysisModal analysisID={dashboardToDelete.id.toString()} show={true} deleteAnalysis={deleteDashboard} close={() => setDashboardToDelete(null)} />}
        {!dashboards ? <Loading className='tw-mx-auto tw-mt-32' /> : (
          <ul className='tw-relative tw-z-0 tw-list-none tw-p-0 tw-m-0 tw-pb-24'>
            {dashboards.map((dashboard, index) =>
              <li key={index} className='tw-relative tw-w-full tw-h-12 tw-border-b tw-border-solid tw-border-gray-200 tw-box-border tw-cursor-pointer tw-select-none tw-text-sm'>
                <DivButton className='tw-flex tw-w-full tw-h-full tw-py-3 tw-px-10 tw-items-center hover:tw-bg-gray-200' onClick={() => onClick(dashboard)}>
                  <div className='tw-mt-[1px]'>
                    {dashboard.title}
                  </div>
                </DivButton>
                <DashboardOptionsButton triggerDelete={() => setDashboardToDelete(dashboard)} />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

const DashboardOptionsButton: React.FC<{ triggerDelete: () => void; }> = props => {
  const menuItem = 'tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded';
  return (
    <Menu as="div" className='tw-absolute tw-right-11 tw-top-0 tw-bottom-0 tw-flex'>
      <Menu.Button onClick={(e: MouseEvent) => e.stopPropagation()} className='tw-m-0'>
        <div className='tw-rounded-md tw-p-[2px] hover:tw-bg-gray-300' >
          <EllipsisHorizontalIcon className='tw-inline tw-h-5' />
        </div>
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
        <Menu.Items className="tw-absolute tw-z-10 tw-right-0 tw-top-11 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="tw-m-1">
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.triggerDelete(); }} className={classNames(
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