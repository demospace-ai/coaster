import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from "react";
import { useParams } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from 'src/components/button/Button';
import { Events } from 'src/components/events/Events';
import { TrendChart } from 'src/components/insight/Charts';
import { BreakdownSection, ReportHeader, useInitializeAnalysis } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { DateRangeSelector } from 'src/components/selector/Selector';
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { sendRequest } from 'src/rpc/ajax';
import { Analysis, AnalysisType, QueryResult, RunTrendQuery } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";
import { convertTrendData, toTrendBreakdown, TrendSeries } from 'src/utils/queryData';

type TrendParams = {
  id: string,
};

/*

TODO: tests

- updating connection should clear event set and steps
- updating event set should clear steps
- should request event set once when connection changes
- should request events once when event set or connection changes
- should not trigger update if the object changes but the ID does not
- should not trigger update on load

*/
export const Trend: React.FC = () => {
  const { id } = useParams<TrendParams>();
  const { analysis } = useAnalysis(id!);

  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [queryResults, setQueryResults] = useState<QueryResult | undefined>(undefined);
  const [trendData, setTrendData] = useState<TrendSeries[]>([]);
  const [dateRange, setDateRange] = useState<string | undefined>(undefined);

  const validateError = validateAnalysis(analysis);
  const runQuery = useCallback(async () => {
    setQueryLoading(true);
    setErrorMessage(null);

    if (validateError) {
      setErrorMessage(validateError);
      setQueryLoading(false);
      return;
    }

    try {
      const response = await sendRequest(RunTrendQuery, {
        'analysis_id': Number(id),
      });

      const breakdown = toTrendBreakdown(response);
      setQueryResults(breakdown);
      setTrendData(convertTrendData(breakdown));
      response.forEach(result => {
        if (!result.success) {
          // TODO: still show the successful results, just show a error toast
          setErrorMessage(result.error_message);
          rudderanalytics.track(`Trend Execution Failed`);
        }
      });
    } catch (e) {
      setErrorMessage((e as Error).message);
      // TODO: log datadog event here
    }

    setQueryLoading(false);
  }, [id, validateError]);

  useInitializeAnalysis(analysis, runQuery);

  if (!id) {
    return <Loading />;
  }

  if (!analysis) {
    return <Loading />;
  }

  return (
    <>
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-auto">
        <ReportHeader id={id} />
        <div className='tw-mt-8 tw-mb-10'>
          <span className='tw-uppercase tw-font-bold -tw-mt-1 tw-select-none'>Definition</span>
          <div id="events-panel" className='tw-flex tw-flex-1 tw-mt-2 tw-p-5 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md'>
            <div id='left-panel' className="tw-w-1/2 tw-min-w-1/2 tw-flex tw-flex-col tw-select-none tw-pr-5">
              <Events analysisID={id} connectionID={analysis.connection?.id} eventSetID={analysis.event_set?.id} setErrorMessage={setErrorMessage} />
              <Tooltip label={"⌘ + Enter"}>
                <Button className="tw-w-40 tw-h-8 tw-mt-4" onClick={runQuery}>{queryLoading ? "Stop" : "Run"}</Button>
              </Tooltip>
            </div>
            <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-2 tw-border-l tw-border-solid tw-border-gray-300">
              <div className='tw-ml-5'>
                <BreakdownSection analysisID={id} />
              </div>
            </div>
          </div>
        </div>
        <div id="trend-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-10'>
          <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-min-h-[400px] tw-max-h-[400px]'>
            <div className='tw-flex tw-flex-row tw-items-center tw-border-b tw-border-gray-300 tw-p-3'>
              <span className='tw-font-semibold tw-ml-2 tw-mr-4'>Date Range</span>
              <div>
                <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} className="tw-w-60" />
              </div>
              <Tooltip label={"⌘ + Enter"}>
                <div className="tw-ml-auto tw-w-fit tw-text-blue-600 tw-font-medium tw-cursor-pointer hover:tw-bg-blue-200 tw-px-2 tw-py-0.5 tw-rounded-md" onClick={runQuery}>Refresh</div>
              </Tooltip>
            </div>
            <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-none tw-p-5 tw-pt-1">
              {errorMessage &&
                <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                  Error: {errorMessage}
                </div>
              }
              {!queryLoading && trendData.length > 0 ?
                <TrendChart trendData={trendData} />
                :
                queryLoading ?
                  <Loading />
                  :
                  <div className='tw-flex tw-flex-col tw-flex-grow tw-justify-center tw-items-center tw-select-none'>
                    <PlusCircleIcon className='tw-h-12 tw-mb-1' />
                    <div className='tw-text-lg tw-font-medium'>
                      Choose two or more steps to see results!
                    </div>
                    <div className="tw-mt-1">
                      Add steps to your conversion funnel by selecting them in the Steps panel above.
                    </div>
                  </div>
              }
            </div>
          </div>
        </div>
        {!queryLoading && queryResults &&
          <div id="breakdown-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-20'>
            <span className='tw-uppercase tw-font-bold tw-select-none'>Breakdown</span>
            <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-overflow-hidden'>
              <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-max-h-64 tw-overflow-hidden">
                <MemoizedResultsTable schema={queryResults.schema} results={queryResults.data} />
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};

const validateAnalysis = (analysis: Analysis | undefined): string | undefined => {
  if (!analysis) {
    return "Missing analysis!";
  }

  if (analysis.analysis_type !== AnalysisType.Trend) {
    return "Wrong analysis type!";
  }

  if (!analysis.connection) {
    return "Data source is not set!";
  }

  if (!analysis.event_set) {
    return "Event set is not set!";
  }

  if (!analysis.events || analysis.events.length < 1) {
    return "Must have 1 or more events!";
  }
}

/*
const hasResults = Boolean(schema && queryResults);

<Tooltip label={hasResults ? '' : "You must run the query to fetch results before exporting."}>
  <CSVLink
    className={classNames(
      'tw-flex tw-rounded-md tw-font-bold tw-py-1 tw-tracking-wide tw-justify-center tw-align-middle tw-ml-2 tw-px-4 tw-h-8 tw-bg-white tw-border tw-border-solid tw-border-gray-400 tw-text-gray-800 hover:tw-bg-gray-200',
      hasResults ? null : 'tw-bg-gray-300 tw-text-gray-500 tw-border-0 tw-cursor-not-allowed hover:tw-bg-gray-300'
    )}
    data={toCsvData(schema, queryResults)}
    filename={`funnel_${id}_results.csv`} // TODO: use saved name
    onClick={() => hasResults} // prevent download if there are no results
  >
    <ArrowDownTrayIcon className='tw-h-5 tw-inline tw-mr-1' />
    Export CSV
  </CSVLink>
</Tooltip>
*/