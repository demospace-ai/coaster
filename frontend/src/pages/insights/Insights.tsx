import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { ChartBarIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { Fragment, MouseEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DivButton } from 'src/components/button/Button';
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
          <ul className='tw-relative tw-z-0 tw-list-none tw-p-0 tw-m-0 tw-pb-24'>
            {analyses.map((analysis, index) =>
              <li key={index} className='tw-relative tw-w-full tw-h-12 tw-border-b tw-border-solid tw-border-gray-200 tw-box-border tw-cursor-pointer tw-select-none tw-text-sm'>
                <DivButton className='tw-flex tw-w-full tw-h-full tw-py-3 tw-px-10 tw-items-center hover:tw-bg-gray-200' onClick={() => onClick(analysis)}>
                  {getAnalysisIcon(analysis.analysis_type)}
                  <div className='tw-mt-[1px]'>
                    {analysis.title ? analysis.title : `${getAnalysisDraftTitle(analysis.analysis_type)} ${analysis.id}`}
                  </div>
                </DivButton>
                <ReportOptionsButton triggerDelete={() => setAnalysisToDelete(analysis)} />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

const ReportOptionsButton: React.FC<{ triggerDelete: () => void; }> = props => {
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
      <div className='tw-w-96 tw-m-6'>
        <div>
          Are you sure you want to delete "<span className="tw-font-bold">{`${getAnalysisDraftTitle(analysisType)} ${analysisID}`}</span>"?
          <br /><br />Deleting an insight is permanent.
        </div>
        <div className='tw-mt-8 tw-flex'>
          <div className='tw-ml-auto'>
            <Button className='tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200 tw-border-0 tw-mr-3' onClick={props.close}>Cancel</Button>
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
      return <CommandLineIcon className="tw-h-4 tw-mr-2" />
        ;
    case AnalysisType.Funnel:
      return <ChartBarIcon className="tw-h-4 tw-mr-2" />;
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