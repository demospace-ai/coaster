import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from "react";
import { useParams } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from 'src/components/button/Button';
import { Events } from 'src/components/events/Events';
import { ReportHeader } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { sendRequest } from 'src/rpc/ajax';
import { QueryResult, ResultRow, RunTrendQuery, Schema } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";

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
  const { analysis } = useAnalysis(id!);

  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<QueryResult | undefined>(undefined);
  const [trendData, setTrendData] = useState<TrendSeries[]>([]);

  const onSave = async () => {
    // Nothing to actually update here for now
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

      const breakdown = toBreakdown(response);
      setQueryResults(breakdown);
      setTrendData(convertData(breakdown));
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
  }, [id, analysis]);

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
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll">
        <ReportHeader id={id} onSave={onSave} />
        <div className='tw-mt-8 tw-mb-10'>
          <span className='tw-uppercase tw-font-bold -tw-mt-1 tw-select-none'>Series</span>
          <div id="events-panel" className='tw-flex tw-flex-1 tw-mt-2 tw-p-5 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md'>
            <div id='left-panel' className="tw-w-1/2 tw-min-w-1/2 tw-flex tw-flex-col tw-select-none tw-pr-10">
              <Events analysisID={id} connectionID={analysis.connection?.id} eventSetID={analysis.event_set?.id} setErrorMessage={setErrorMessage} />
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
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trendData} margin={{ top: 20, right: 50, left: 10, bottom: 10 }} >
                      <XAxis dataKey="date" height={30} allowDuplicatedCategory={false} minTickGap={30} dy={5} />
                      <YAxis dataKey="count" />
                      <RechartTooltip wrapperClassName='tw-rounded' labelClassName='tw-pb-1 tw-font-bold' />
                      {trendData.map((s) => (
                        <Line dataKey="count" data={s.data} name={s.name} key={s.name} connectNulls={false} stroke="#639f63" />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
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

const convertData = (breakdownResult: QueryResult): TrendSeries[] => {
  return breakdownResult.data.map(eventData => {
    const data: TrendResultData[] = [];
    // Start at index 1 since first column is the event name
    for (let i = 1; i < eventData.length; i++) {
      data.push({ date: breakdownResult.schema[i].name, count: eventData[i] as number });
    }

    // First column is the event name in the breakdown data
    const series: TrendSeries = { name: eventData[0] as string, data: data };

    return series;
  });
};

const toBreakdown = (results: QueryResult[]): QueryResult => {
  const { minDate, maxDate } = getDateRange(results);
  const range: Date[] = [];
  for (let d = new Date(minDate); d.getTime() <= maxDate.getTime(); d.setTime(d.getTime() + 86400000)) {
    range.push(new Date(d));
  }

  const schema: Schema = [{ name: "Event", type: "string" }, ...range.map(d => ({ name: getDateStringInUTC(d), type: "string" }))];
  const data = results.map(result => {
    const dataMap = new Map(result.data.map(row => {
      return [
        new Date(row[2]).getTime(),
        row[1] as number,
      ];
    }));

    // All the rows should have the event name as the first column
    const series: ResultRow = [result.data[0][0]];
    range.forEach(d => {
      series.push(dataMap.get(d.getTime()) || 0);
    });

    return series;
  });

  return { success: true, error_message: "", schema: schema, data: data };
};


type DateRange = {
  minDate: Date,
  maxDate: Date,
};

const getDateRange = (results: QueryResult[]): DateRange => {
  // Min and max dates per RFC: http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
  // TODO: use the date range specified in the query itself
  let minDate: Date = new Date(8640000000000000);
  let maxDate: Date = new Date(-8640000000000000);
  results.forEach(result => {
    result.data.forEach(row => {
      const date = new Date(row[2]);
      if (date < minDate) {
        minDate = date;
      }

      if (date > maxDate) {
        maxDate = date;
      }
    });
  });

  return { minDate, maxDate };
};

function getDateStringInUTC(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getUTCMonth()] + " " + d.getUTCDate() + " " + d.getUTCFullYear();
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