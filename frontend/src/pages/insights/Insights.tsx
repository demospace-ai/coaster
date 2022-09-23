import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { ChartBarIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { Fragment, MouseEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import { Modal } from 'src/components/modal/Modal';
import { sendRequest } from 'src/rpc/ajax';
import { Analysis, AnalysisType, DeleteAnalysis, GetAllAnalyses } from 'src/rpc/api';

export const Insights: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<Analysis | null>(null);
  useEffect(() => {
    setLoading(true);
    let ignore = false;
    sendRequest(GetAllAnalyses).then((results) => {
      if (!ignore) {
        setAnalyses(results.analyses);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const onClick = (analysis: Analysis) => {
    switch (analysis.analysis_type) {
      case AnalysisType.CustomQuery:
        navigate(`/customquery/${analysis.id}`);
        break;
      case AnalysisType.Funnel:
        navigate(`/funnel/${analysis.id}`);
        break;
    }
  };


  const deleteAnalysis = useCallback(async (analysisID: number) => {
    await sendRequest(DeleteAnalysis, { analysisID: analysisID });
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== analysisID);
    setAnalyses(updatedAnalyses);
  }, [analyses]);

  return (
    <div className='tw-h-full tw-overflow-scroll'>
      <div className='tw-w-full'>
        <DeleteModal analysisToDelete={analysisToDelete} deleteAnalysis={deleteAnalysis} close={() => setAnalysisToDelete(null)} />
        {loading ? <Loading className='tw-mx-auto tw-mt-32' /> : (
          <ul className='tw-list-none tw-p-0 tw-m-0 tw-pb-24'>
            {analyses.map((analysis, index) =>
              <li
                key={index}
                className='tw-w-full tw-border-b tw-border-solid tw-border-gray-200 tw-box-border tw-py-4 tw-px-8 tw-cursor-pointer tw-flex tw-select-none tw-text-sm hover:tw-bg-gray-100'
                onClick={() => onClick(analysis)}
              >
                {getAnalysisIcon(analysis.analysis_type)}
                <div className='tw-inline tw-mt-[2px] tw-leading-6'>
                  {analysis.title ? analysis.title : `${getAnalysisDraftTitle(analysis.analysis_type)} ${analysis.id}`}
                </div>
                <MoreOptionsButton className='tw-ml-auto tw-mr-3' triggerDelete={() => setAnalysisToDelete(analysis)} />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

const MoreOptionsButton: React.FC<{ className?: string; triggerDelete: () => void; }> = props => {
  return (
    <Menu as="div" className={classNames("tw-relative tw-inline", props.className)}>
      <Menu.Button onClick={(e: MouseEvent) => e.stopPropagation()} className='tw-z-0'>
        <div className='tw-border tw-border-solid tw-bg-white tw-border-gray-200 tw-rounded-md tw-p-[1px] hover:tw-bg-gray-200' >
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
        <Menu.Items className="tw-z-10 tw-absolute tw-origin-top-right tw-right-0 tw-top-8 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.triggerDelete(); }} className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
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

type DeleteModalProps = {
  deleteAnalysis: (analysisID: number) => Promise<void>;
  analysisToDelete: Analysis | null;
  close: () => void;
};

const DeleteModal: React.FC<DeleteModalProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const analysisType = props.analysisToDelete ? props.analysisToDelete.analysis_type : null;
  const analysisID = props.analysisToDelete ? props.analysisToDelete.id : null;
  const deleteAnalysis = async (analysisID: number | null) => {
    if (analysisID === null) {
      return;
    }

    setLoading(true);
    await props.deleteAnalysis(analysisID);
    props.close();
    setLoading(false);
  };

  return (
    <Modal show={props.analysisToDelete !== null} close={props.close} title="Delete Insight" titleStyle='tw-font-bold tw-text-xl'>
      <div className='tw-w-80 tw-m-6'>
        <div>
          Are you sure you want to delete "<span className="tw-font-bold">{`${getAnalysisDraftTitle(analysisType)} ${analysisID}`}</span>"?
          <br /><br />Deleting insights is permanent.
        </div>
        <div className='tw-mt-8 tw-flex'>
          <div className='tw-ml-auto'>
            <Button className='tw-bg-white tw-text-primary-text hover:tw-bg-gray-200 tw-border-0 tw-mr-3' onClick={props.close}>Cancel</Button>
            <Button className='tw-w-24 tw-bg-red-600 hover:tw-bg-red-800 tw-border-0' onClick={() => deleteAnalysis(analysisID)}>{loading ? <Loading className='tw-inline' /> : "Delete"}</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

function getAnalysisIcon(analysisType: AnalysisType): ReactNode {
  switch (analysisType) {
    case AnalysisType.CustomQuery:
      return <CommandLineIcon className="tw-inline-block tw-h-4 tw-mr-2 tw-mt-[6px]" />
        ;
    case AnalysisType.Funnel:
      return <ChartBarIcon className="tw-inline-block tw-h-4 tw-mr-2 tw-mt-1 tw-scale-x-[-1]" />;
    default:
      return <></>;
  }
}

function getAnalysisDraftTitle(analysisType: AnalysisType | null): string {
  switch (analysisType) {
    case AnalysisType.CustomQuery:
      return "Custom Query";
    case AnalysisType.Funnel:
      return "Funnel";
    default:
      return "Insight";
  }
}