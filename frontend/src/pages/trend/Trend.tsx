import { Transition } from '@headlessui/react';
import { FunnelIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { rudderanalytics } from 'src/app/rudder';
import { Button, DivButton } from 'src/components/button/Button';
import { RightArrow } from 'src/components/icons/Icons';
import { ReportHeader } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { EventSelector, FilterSelector, PropertySelector, PropertyValueSelector } from "src/components/selector/Selector";
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { runFunnelQuery } from 'src/queries/queries';
import { sendRequest } from 'src/rpc/ajax';
import { Event, EventFilter, EventInput, filtersMatch, FilterType, Property, QueryResults, Schema, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";
import { toEmptyList } from 'src/utils/undefined';

type TrendParams = {
  id: string,
};

type TrendUpdates = {
  series?: EventInput[],
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
export const Trend: React.FC = () => {
  const { id } = useParams<TrendParams>();
  const { analysis, mutate } = useAnalysis(id!);


  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | undefined>(undefined);
  const [queryResults, setQueryResults] = useState<QueryResults | undefined>(undefined);
  const [funnelData, setFunnelData] = useState<FunnelResult[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const updateSeries = useCallback(async (id: number, updates: TrendUpdates) => {
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.series) {
      payload.events = updates.series;
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
    const updates: TrendUpdates = {};
    if (analysis?.events) {
      updates.series = analysis.events;
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

    if (!analysis || !analysis.events || analysis.events.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await runFunnelQuery(Number(id));
      if (response.success) {
        setSchema(response.schema);
        setQueryResults(response.query_results);
        setFunnelData(convertData(response.query_results));
      } else {
        setErrorMessage(response.error_message);
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
              <Steps id={Number(id)} connectionID={analysis.connection?.id} eventSetID={analysis.event_set?.id} steps={toEmptyList(analysis.events)} setErrorMessage={setErrorMessage} updateFunnel={updateSeries} />
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
          <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-p-5 tw-min-h-[364px]'>
            <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
              {errorMessage &&
                <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                  Error: {errorMessage}
                </div>
              }
              {!queryLoading && funnelData.length ?
                <div className='tw-overflow-scroll'>
                  <ResponsiveContainer width={300 * funnelData.length} height={320}>
                    <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <XAxis dataKey="name" height={30} />
                      <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
                      <RechartTooltip />
                      <Bar dataKey="percentage" barSize={200} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
                      <Bar dataKey="count" barSize={0} />
                    </BarChart>
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
        {!queryLoading && schema && queryResults &&
          <div id="breakdown-panel" className='tw-flex tw-flex-col tw-flex-1 tw-mb-20'>
            <span className='tw-uppercase tw-font-bold tw-select-none'>Breakdown</span>
            <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-overflow-hidden'>
              <div className="tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-max-h-64 tw-overflow-hidden">
                <MemoizedResultsTable schema={schema} results={queryResults} />
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};

type StepsProps = {
  id: number;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  steps: Event[];
  setErrorMessage: (message: string | null) => void;
  updateFunnel: (id: number, updates: TrendUpdates) => void;
};

const Steps: React.FC<StepsProps> = props => {
  const { id, connectionID, eventSetID, steps, setErrorMessage, updateFunnel } = props;

  const onEventSelected = useCallback((value: string, index: number) => {
    if (steps[index].name !== value) {
      setErrorMessage(null);
      const updatedSteps: EventInput[] = [...steps];
      // Clear filters on event selected since they may no longer apply
      updatedSteps[index] = { name: value, filters: [] };
      updateFunnel(Number(id), { series: updatedSteps });
    }
  }, [id, steps, setErrorMessage, updateFunnel]);

  const onEventRemoved = useCallback((index: number) => {
    setErrorMessage(null);
    const updatedSteps = steps.filter((_, i) => i !== index);
    updateFunnel(Number(id), { series: updatedSteps });
  }, [id, steps, setErrorMessage, updateFunnel]);

  const onEventAdded = useCallback((value: string) => {
    setErrorMessage(null);
    // New events, filters should be empty
    const updatedSteps: EventInput[] = [...steps, { name: value, filters: [] }];
    updateFunnel(Number(id), { series: updatedSteps });
  }, [id, steps, setErrorMessage, updateFunnel]);

  const setStepFilters = useCallback((filters: EventFilter[], stepIndex: number) => {
    if (!filtersMatch(steps[stepIndex].filters, filters)) {
      setErrorMessage(null);
      const updatedSteps: Event[] = [...steps];
      updatedSteps[stepIndex] = { ...steps[stepIndex], filters: filters };
      updateFunnel(Number(id), { series: updatedSteps });
    }
  }, [id, steps, setErrorMessage, updateFunnel]);

  return (
    <div id="steps">
      {steps.map((step, index) =>
        <Step
          key={index}
          index={index}
          step={step}
          setEvent={(event) => onEventSelected(event, index)}
          removeEvent={() => onEventRemoved(index)}
          setStepFilters={(stepFilters) => setStepFilters(stepFilters, index)}
          connectionID={connectionID}
          eventSetID={eventSetID}
        />
      )}
      <NewStep index={steps.length} addEvent={onEventAdded} connectionID={connectionID} eventSetID={eventSetID} />
    </div>
  );
};

type StepProp = {
  index: number;
  step: Event;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  setEvent: (event: string) => void;
  removeEvent: () => void;
  setStepFilters: (filters: EventFilter[]) => void;
};

const Step: React.FC<StepProp> = props => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { index, step, connectionID, eventSetID, setEvent, removeEvent, setStepFilters } = props;

  return (
    <div className='tw-flex tw-mb-4 tw-max-w-md'>
      <div className='tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-md'>
        <div className='tw-flex tw-items-center tw-p-2'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-bg-fabra-green-500 tw-text-white tw-h-6 tw-w-6 tw-my-auto'>
            {index + 1}
          </div>
          <EventSelector className="tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" connectionID={connectionID} eventSetID={eventSetID} event={step?.name} setEvent={setEvent} />
          <DivButton className='tw-p-1 tw-ml-2 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className='tw-h-6 tw-stroke-[1.7]' />
            {step.filters.length > 0 &&
              <div className='tw-relative'>
                <span className="tw-absolute tw-bottom-[14px] tw-left-[14px] tw-flex tw-shrink-0 tw-items-center tw-rounded-full tw-border-2 tw-border-solid tw-border-white tw-bg-fabra-green-500 tw-h-[18px] tw-w-[18px] tw-justify-center tw-text-[10px] tw-text-white tw-font-bold">
                  {step.filters.length}
                </span>
              </div>
            }
          </DivButton>
          <DivButton className='tw-p-1 tw-ml-[1px] hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={removeEvent} >
            <TrashIcon className='tw-h-6 tw-stroke-[1.7]' />
          </DivButton>
        </div>
        <StepFilters show={showFilters} connectionID={connectionID} eventSetID={eventSetID} filters={step.filters} setStepFilters={setStepFilters} />
      </div>
    </div>
  );
};

type NewStepProps = {
  index: number;
  addEvent: (event: string) => void;
  connectionID: number | undefined;
  eventSetID: number | undefined;
};

const NewStep: React.FC<NewStepProps> = props => {
  return (
    <div className='tw-flex tw-mb-4 tw-max-w-md'>
      <div className='tw-w-full tw-mt-[-1px] tw-border tw-border-solid tw-border-gray-300 tw-rounded-t-md tw-rounded-b-md'>
        <div className='tw-flex tw-items-center tw-p-2'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-bg-fabra-green-500 tw-text-white tw-h-6 tw-w-6 tw-my-auto'>
            {props.index + 1}
          </div>
          <EventSelector className="tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" event={undefined} setEvent={props.addEvent} connectionID={props.connectionID} eventSetID={props.eventSetID} />
          <div className='tw-p-1 tw-ml-2 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md'>
            <FunnelIcon className='tw-h-6 tw-stroke-[1.7]' />
          </div>
          <div className='tw-p-1 tw-ml-[1px] hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md'>
            <TrashIcon className='tw-h-6 tw-stroke-[1.7]' />
          </div>
        </div>
      </div>
    </div>
  );
};

type StepFiltersProp = {
  show: boolean;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  filters: EventFilter[];
  setStepFilters: (filters: EventFilter[]) => void;
};

const StepFilters: React.FC<StepFiltersProp> = props => {
  const { connectionID, eventSetID, filters, setStepFilters } = props;

  const updateFilter = (filter: EventFilter, index: number) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = filter;
    setStepFilters(updatedFilters);
  };

  const addFilter = (filter: EventFilter) => {
    const updatedFilters: EventFilter[] = [...filters, filter];
    setStepFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setStepFilters(updatedFilters);
  };

  return (
    <Transition show={props.show}>
      {filters.map((filter, i) =>
        <StepFilterComponent key={i} index={i} filter={filter} connectionID={connectionID} eventSetID={eventSetID} setStepFilter={(filter: EventFilter) => updateFilter(filter, i)} removeFilter={() => removeFilter(i)} />
      )}
      <StepFilterComponent index={filters.length} filter={undefined} connectionID={connectionID} eventSetID={eventSetID} setStepFilter={(filter: EventFilter) => addFilter(filter)} removeFilter={() => null} newFilter={true} />
    </Transition>
  );
};

type StepFilterProp = {
  index: number;
  filter: EventFilter | undefined;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  setStepFilter: (filter: EventFilter) => void;
  removeFilter: () => void;
  newFilter?: boolean;
};

const StepFilterComponent: React.FC<StepFilterProp> = props => {
  const { index, filter, connectionID, eventSetID, setStepFilter, removeFilter, newFilter } = props;
  const [property, setProperty] = useState<Property | undefined>(filter ? filter.property : undefined);
  const [filterType, setFilterType] = useState<FilterType>(filter ? filter.filter_type : FilterType.Equal); // Equal is a good starting value for filter type
  const [propertyValue, setPropertyValue] = useState<string | null | undefined>(filter ? filter.property_value : undefined); // Null is a valid value

  useEffect(() => {
    if (filter) {
      setProperty(filter.property);
      setFilterType(filter.filter_type);
      setPropertyValue(filter.property_value);
    }
  }, [filter]);

  const onFilterPropertyChanged = (property: Property) => {
    // No need to save because updating the property clears the value which must be set again
    setProperty(property);
    setFilterType(FilterType.Equal);
    setPropertyValue(undefined);
  };

  const onFilterTypeChanged = (filterType: FilterType) => {
    setFilterType(filterType);

    if (property && propertyValue !== undefined) {
      if (newFilter) {
        setProperty(undefined);
        setFilterType(FilterType.Equal);
        setPropertyValue(undefined);
      }
      setStepFilter({ property: property, property_value: propertyValue, filter_type: filterType });
    }
  };

  const onFilterPropertyValueChanged = (propertyValue: string | null) => {
    // Coerce to string since it can be any arbitrary value
    const valueString: string | null = propertyValue ? String(propertyValue) : null;
    setPropertyValue(valueString);
    if (property && propertyValue !== undefined) {
      if (newFilter) {
        setProperty(undefined);
        setFilterType(FilterType.Equal);
        setPropertyValue(undefined);
      }
      setStepFilter({ property: property, property_value: valueString, filter_type: filterType });
    }
  };

  return (
    <>
      <div className='tw-border-t tw-border-solid tw-border-gray-300 tw-p-2 tw-rounded-b-md tw-flex tw-items-center '>
        {getFilterPrefix(index)}
        <PropertySelector className="tw-inline tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" property={property} setProperty={onFilterPropertyChanged} connectionID={connectionID} eventSetID={eventSetID} />
        <div className='tw-flex tw-shrink-0 tw-relative tw-ml-2 tw-w-8'>
          <div className='tw-absolute tw-top-2 tw-p-1 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={removeFilter}>
            <TrashIcon className='tw-h-6 tw-stroke-[1.7]' />
          </div>
        </div>
      </div>
      <div className='tw-px-2 tw-pb-2 tw-rounded-b-md tw-flex tw-items-center'>
        <div className='tw-flex tw-w-24 tw-shrink-0 tw-mr-2'>
          <div className='tw-relative tw-w-full'>
            <FilterSelector className="tw-inline tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" filterType={filterType} setFilterType={onFilterTypeChanged} />
          </div>
        </div>
        <PropertyValueSelector connectionID={connectionID} eventSetID={eventSetID} property={property} className="tw-inline tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" propertyValue={propertyValue} setPropertyValue={onFilterPropertyValueChanged} />
        <div className='tw-flex tw-shrink-0 tw-p-1 tw-ml-2 tw-w-8' />
      </div>
    </>
  );
};

function getFilterPrefix(index: number): React.ReactNode {
  if (index > 0) {
    return (
      <div className='tw-flex tw-justify-end tw-w-24 tw-shrink-0 tw-mr-2'>
        <span className='tw-ml-auto tw-bg-orange-200 tw-rounded-md tw-px-2 tw-py-1 tw-uppercase tw-font-bold tw-text-xs'>and</span>
      </div>
    );
  } else {
    return (
      <div className='tw-flex tw-shrink-0 tw-w-24 tw-mr-2'>
        <RightArrow className='tw-mt-[-4px] tw-ml-2 tw-h-6 tw-stroke-gray-400 tw-stroke-[1.2]' />
        <span className='tw-bg-orange-200 tw-rounded-md tw-ml-auto tw-px-2 tw-py-1 tw-uppercase tw-font-bold tw-text-xs'>where</span>
      </div>
    );
  }
};

const convertData = (results: QueryResults): FunnelResult[] => {
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