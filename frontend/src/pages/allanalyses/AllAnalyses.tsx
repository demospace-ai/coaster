import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from 'src/components/loading/Loading';
import { sendRequest } from 'src/rpc/ajax';
import { Analysis, AnalysisType, GetAllAnalyses } from 'src/rpc/api';

export const AllAnalyses: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    let ignore = false;
    sendRequest(GetAllAnalyses).then((results) => {
      if (!ignore) {
        setAnalyses(results.analyses);
      }

      setLoading(false);
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

  return (
    <div className='tw-h-full tw-overflow-scroll'>
      <div className='tw-mt-8 tw-mb-5 tw-mx-5'>
        <div className='tw-inline tw-mr-5'>Created</div>
      </div>
      <div className='tw-border-t tw-border-solid tw-border-gray-200 tw-w-full'>
        {loading ? <Loading className='tw-mx-auto tw-mt-32' /> : (
          <ul className='tw-list-none tw-p-0 tw-m-0 tw-pb-24'>
            {analyses.map((analysis, index) =>
              <li
                key={index}
                className='tw-w-full tw-border-t tw-border-solid tw-border-gray-200 tw-box-border tw-py-4 tw-px-8 tw-cursor-pointer tw-flex tw-select-none tw-text-sm hover:tw-bg-gray-100'
                onClick={() => onClick(analysis)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '10px', marginTop: "2px" }}>
                  <path d="M9.04168 14.6876L13.8125 9.91675L13 9.10425L9.04168 13.0626L6.89584 10.9167L6.08334 11.7292L9.04168 14.6876ZM4.58334 18.3334C4.25001 18.3334 3.95834 18.2084 3.70834 17.9584C3.45834 17.7084 3.33334 17.4167 3.33334 17.0834V2.91675C3.33334 2.58341 3.45834 2.29175 3.70834 2.04175C3.95834 1.79175 4.25001 1.66675 4.58334 1.66675H12.1042L16.6667 6.22925V17.0834C16.6667 17.4167 16.5417 17.7084 16.2917 17.9584C16.0417 18.2084 15.75 18.3334 15.4167 18.3334H4.58334ZM11.4792 6.79175V2.91675H4.58334V17.0834H15.4167V6.79175H11.4792ZM4.58334 2.91675V6.79175V2.91675V17.0834V2.91675Z" fill="black" />
                </svg>
                <div className='tw-inline tw-mt-[2px]'>
                  {analysis.title ? analysis.title : `Analysis ${analysis.id}`}
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
