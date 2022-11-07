import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from "react";
import { useParams } from 'react-router-dom';
import { Line, LineChart, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from 'src/components/button/Button';
import { Events, EventUpdates } from 'src/components/events/Events';
import { ReportHeader } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { sendRequest } from 'src/rpc/ajax';
import { QueryResult, RunTrendQuery, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";
import { toEmptyList } from 'src/utils/undefined';

type TrendParams = {
  id: string,
};

type TrendSeries = {
  name: string,
  data: TrendResultData[],
};

type TrendResultData = {
  date: string,
  count: number,
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
  const { analysis, mutate } = useAnalysis(id!);

  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<QueryResult[] | undefined>(undefined);
  const [trendData, setTrendData] = useState<TrendSeries[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const updateSeries = useCallback(async (id: number, updates: EventUpdates) => {
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

    updateSeries(Number(id), updates);
    setTimeout(() => setSaving(false), 500);
  };

  const runQuery = useCallback(async () => {
    setQueryLoading(true);
    setErrorMessage(null);

    if (!analysis) {
      // TODO: handle this
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

    if (!analysis || !analysis.events) {
      setErrorMessage("Must have 1 or more events!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await sendRequest(RunTrendQuery, {
        'analysis_id': Number(id),
      });

      // TODO: if any of the queries failed, show the error message
      if (response[0].success) {
        setQueryResults(response);
        setTrendData(convertData(response));
      } else {
        setErrorMessage(response[0].error_message);
        rudderanalytics.track(`Trend Execution Failed`);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
      // TODO: log datadog event here
    }

    setQueryLoading(false);
  }, [id, analysis]);

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  if (shouldRun) {
    runQuery();
    setShouldRun(false);
  }

  if (!id) {
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
              <Events id={Number(id)} connectionID={analysis.connection?.id} eventSetID={analysis.event_set?.id} events={toEmptyList(analysis.events)} setErrorMessage={setErrorMessage} updateAnalysis={updateSeries} />
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
              {!queryLoading && trendData.length > 0 ?
                <div className='tw-overflow-scroll'>
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }} width={1200} height={320}>
                    <XAxis dataKey="date" height={30} allowDuplicatedCategory={false} />
                    <YAxis dataKey="count" />
                    <RechartTooltip />
                    {trendData.map((s) => (
                      <Line dataKey="count" data={s.data} name={s.name} key={s.name} connectNulls={false} />
                    ))}
                  </LineChart>
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
        {/* {!queryLoading && queryResults &&
          <div id="breakdown-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-20'>
            <span className='tw-uppercase tw-font-bold tw-select-none'>Breakdown</span>
            <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-overflow-hidden'>
              <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-max-h-64 tw-overflow-hidden">
                <MemoizedResultsTable schema={} results={resultData} />
              </div>
            </div>
          </div>
        } */}
      </div>
    </>
  );
};

const convertData = (results: QueryResult[]): TrendSeries[] => {
  // Min and max dates per RFC: http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
  // TODO: use the date range specified in the query itself
  let minDate: Date = new Date(8640000000000000);
  let maxDate: Date = new Date(-8640000000000000);
  results.forEach(result => {
    result.data.forEach(row => {
      const date = new Date(row[2] as string);
      if (date < minDate) {
        minDate = date;
      }

      if (date > maxDate) {
        maxDate = date;
      }
    });
  });

  return results.map(result => {
    const dataMap = new Map(result.data.map(row => {
      return [
        new Date(row[2] as string).getDate(),
        row[1] as number,
      ];
    }));

    // All the rows should have the event name as the first column
    const series: TrendSeries = { name: result.data[0][0] as string, data: [] };
    for (let d = new Date(minDate); d.getDate() <= maxDate.getDate(); d.setDate(d.getDate() + 1)) {
      series.data.push({ date: d.toDateString(), count: dataMap.get(d.getDate()) || 0 });
    }

    return series;
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