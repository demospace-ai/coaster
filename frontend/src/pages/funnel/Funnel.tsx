import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from "react";
import { useParams } from 'react-router-dom';
import { Bar, BarChart, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from 'src/components/button/Button';
import { Events, EventUpdates } from 'src/components/events/Events';
import { ReportHeader } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { sendRequest } from 'src/rpc/ajax';
import { QueryResult, ResultRow, RunFunnelQuery, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";
import { toEmptyList } from 'src/utils/undefined';

type FunnelParams = {
  id: string,
};

type FunnelResult = {
  name: string,
  count: number,
  percentage: number,
  conversionFromPrevious?: number,
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
export const Funnel: React.FC = () => {
  const { id } = useParams<FunnelParams>();
  const { analysis, mutate } = useAnalysis(id);

  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResult | undefined>(undefined);
  const [funnelData, setFunnelData] = useState<FunnelResult[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const updateSteps = useCallback(async (id: number, updates: EventUpdates) => {
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.events) {
      payload.events = updates.events;
    }

    mutate(() => {
      return sendRequest(UpdateAnalysis, payload);
    }, {
      rollbackOnError: true,
      revalidate: false,
    });
  }, [mutate]);

  const updateFunnel = () => {
    setSaving(true);
    const updates: EventUpdates = {};
    if (analysis?.events) {
      updates.events = analysis.events;
    }

    updateSteps(Number(id), updates);
    setTimeout(() => setSaving(false), 500);
  };

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  const runQuery = useCallback(async () => {
    setQueryLoading(true);
    setErrorMessage(null);

    if (!analysis) {
      return;
    }

    if (!analysis.connection) {
      setErrorMessage("Data source is not set!");
      setQueryLoading(false);
      return;
    }

    if (!analysis.event_set) {
      setErrorMessage("Event set is not set!");
      setQueryLoading(false);
      return;
    }

    if (!analysis.events || analysis.events.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await sendRequest(RunFunnelQuery, {
        'analysis_id': Number(id),
      });
      if (response.success) {
        setQueryResult(response);
        setFunnelData(convertData(response.data));
      } else {
        setErrorMessage(response.error_message);
        rudderanalytics.track(`Funnel Execution Failed`);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
      // TODO: log datadog event here
    }

    setQueryLoading(false);
  }, [id, analysis]);

  if (shouldRun) {
    runQuery();
    setShouldRun(false);
  }

  if (!id) {
    // This should never happen
    return <Loading />;
  }

  if (!analysis) {
    return <Loading />;
  }

  return (
    <>
      <ConfigureAnalysisModal analysisID={id} show={showModal} close={() => setShowModal(false)} />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll">
        <ReportHeader title={analysis.title} description={analysis.description} copied={copied} saving={saving} copyLink={copyLink} save={updateFunnel} showModal={() => setShowModal(true)} />
        <div className='tw-mt-8 tw-mb-10'>
          <span className='tw-uppercase tw-font-bold -tw-mt-1'>Steps</span>
          <div id="steps-panel" className='tw-flex tw-flex-1 tw-mt-2 tw-p-5 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md'>
            <div id='left-panel' className="tw-w-1/2 tw-min-w-1/2 tw-flex tw-flex-col tw-select-none tw-pr-10">
              <Events id={Number(id)} connectionID={analysis.connection?.id} eventSetID={analysis.event_set?.id} events={toEmptyList(analysis.events)} setErrorMessage={setErrorMessage} updateAnalysis={updateSteps} />
              <Tooltip label={"⌘ + Enter"}>
                <Button className="tw-w-40 tw-h-8" onClick={runQuery}>{queryLoading ? "Stop" : "Run"}</Button>
              </Tooltip>
            </div>
            <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-2 tw-border-l tw-border-solid tw-border-gray-300">
              {/*todo*/}
            </div>
          </div>
        </div>
        <div id="funnel-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-10'>
          <span className='tw-uppercase tw-font-bold tw-select-none'>Results</span>
          <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-p-5 tw-min-h-[364px] tw-max-h-[364px]'>
            <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
              {errorMessage &&
                <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                  Error: {errorMessage}
                </div>
              }
              {!queryLoading && funnelData.length ?
                <div className='tw-overflow-scroll'>
                  <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }} width={300 * funnelData.length} height={320}>
                    <XAxis dataKey="name" height={30} />
                    <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
                    <RechartTooltip />
                    <Bar dataKey="percentage" barSize={200} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
                    <Bar dataKey="count" barSize={0} />
                  </BarChart>
                </div>
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
        {!queryLoading && queryResult &&
          <div id="breakdown-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-20'>
            <span className='tw-uppercase tw-font-bold tw-select-none'>Breakdown</span>
            <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-overflow-hidden'>
              <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-max-h-64 tw-overflow-hidden">
                <MemoizedResultsTable schema={queryResult.schema} results={queryResult.data} />
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};

const convertData = (results: ResultRow[]): FunnelResult[] => {
  return results.map(result => {
    return {
      name: result[1] as string,
      count: result[0] as number,
      percentage: +((result[2] as number) * 100).toFixed(2),
    };
  });
};

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