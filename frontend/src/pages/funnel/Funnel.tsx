import { Transition } from '@headlessui/react';
import { FunnelIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { Button, DivButton } from 'src/components/button/Button';
import { ReportHeader } from 'src/components/insight/InsightComponents';
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { ControlledEventSelector, ControlledPropertySelector, FilterSelector, PropertyValueSelector } from "src/components/selector/Selector";
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { getEvents, getProperties, runFunnelQuery } from 'src/queries/queries';
import { useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { AnalysisType, CreateAnalysis, CreateAnalysisRequest, DataConnection, EventSet, FilterType, FunnelStep, FunnelStepInput, GetAnalysis, Property, PropertyGroup, QueryResults, Schema, StepFilter, stepFiltersMatch, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { toEmptyList } from 'src/utils/undefined';

type FunnelParams = {
  id: string,
};

type FunnelUpdates = {
  steps?: FunnelStepInput[],
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
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const defaultConnectionID = useSelector(state => state.login.organization?.default_data_connection_id);
  const defaultEventSetID = useSelector(state => state.login.organization?.default_event_set_id);
  const [connection, setConnection] = useState<DataConnection | undefined>(undefined);
  const [eventSet, setEventSet] = useState<EventSet | undefined>(undefined);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | undefined>(undefined);
  const [queryResults, setQueryResults] = useState<QueryResults | undefined>(undefined);
  const [funnelData, setFunnelData] = useState<FunnelResult[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const connectionID = connection?.id;
  const eventSetID = eventSet?.id;

  // TODO: error out if organization does not have connection and event set configured
  const createNewFunnel = useCallback(async () => {
    setInitialLoading(true);
    const payload: CreateAnalysisRequest = {
      connection_id: defaultConnectionID,
      event_set_id: defaultEventSetID,
      analysis_type: AnalysisType.Funnel
    };

    try {
      const response = await sendRequest(CreateAnalysis, payload);
      navigate(`/funnel/${response.analysis.id}`);
    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, [navigate, defaultConnectionID, defaultEventSetID]);

  const loadSavedFunnel = useCallback(async (id: string) => {
    setInitialLoading(true);
    try {
      const response = await sendRequest(GetAnalysis, { analysisID: id });
      if (response.connection) {
        setConnection(response.connection);
      }
      if (response.event_set) {
        setEventSet(response.event_set);
      }
      if (response.analysis.funnel_steps) {
        setSteps(response.analysis.funnel_steps);
      }
    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, []);

  const updateFunnel = useCallback(async (id: number, updates: FunnelUpdates) => {
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.steps) {
      payload.funnel_steps = updates.steps;
    }

    try {
      const response = await sendRequest(UpdateAnalysis, payload);
      setSteps(toEmptyList(response.analysis.funnel_steps));
    } catch (e) {
      // TODO: handle error here
    }
  }, []);

  const updateAllProperties = async () => {
    setSaving(true);
    const updates: FunnelUpdates = {};
    if (steps) {
      updates.steps = steps;
    }

    await updateFunnel(Number(id), updates);
    setSaving(false);
  };

  useEffect(() => {
    // Reset state on new ID since data will be newly loaded
    setSteps([]);
    setSchema(undefined);
    setQueryResults(undefined);
    setFunnelData([]);

    if (id === "new") {
      createNewFunnel();
    } else if (id != null) {
      loadSavedFunnel(id);
    } else {
      // TODO: use bugsnag here to record bad state
    }
  }, [id, createNewFunnel, loadSavedFunnel]);

  const runQuery = useCallback(async () => {
    setQueryLoading(true);
    setErrorMessage(null);

    if (!connectionID) {
      setErrorMessage("Data source is not set!");
      setQueryLoading(false);
      return;
    }

    if (!eventSetID) {
      setErrorMessage("Event set is not set!");
      setQueryLoading(false);
      return;
    }

    if (steps.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await runFunnelQuery(connectionID, Number(id));
      if (response.success) {
        setSchema(response.schema);
        setQueryResults(response.query_results);
        setFunnelData(convertData(response.query_results));
      } else {
        setErrorMessage(response.error_message);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
    }

    setQueryLoading(false);
  }, [connectionID, eventSetID, id, steps.length]);

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  if (shouldRun) {
    runQuery();
    setShouldRun(false);
  }

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <>
      <ConfigureAnalysisModal analysisID={Number(id)} analysisType={AnalysisType.Funnel} connection={connection} setConnection={setConnection} eventSet={eventSet} setEventSet={setEventSet} show={showModal} close={() => setShowModal(false)} />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll">
        <ReportHeader copied={copied} saving={saving} copyLink={copyLink} save={updateAllProperties} showModal={() => setShowModal(true)} />
        <div className='tw-flex tw-flex-1 tw-pb-24 tw-mt-8'>
          <div id='left-panel' className="tw-w-[420px] tw-min-w-[20rem] tw-inline-block tw-select-none tw-pr-10 tw-h-full">
            <Steps id={Number(id)} connectionID={connectionID} eventSetID={eventSetID} steps={steps} setErrorMessage={setErrorMessage} updateFunnel={updateFunnel} />
            <Tooltip label={"⌘ + Enter"}>
              <Button className="tw-w-40 tw-h-8" onClick={runQuery}>{queryLoading ? "Stop" : "Run"}</Button>
            </Tooltip>
          </div>
          <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-2">
            <span className='tw-uppercase tw-font-bold tw-select-none'>Results</span>
            <div className='tw-flex tw-flex-col tw-flex-1 tw-mt-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-md'>
              <div className="tw-mb-5 tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
                {errorMessage &&
                  <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                    Error: {errorMessage}
                  </div>
                }
                <Transition show={!queryLoading && funnelData.length > 0}>
                  <div className='tw-overflow-scroll tw-mt-5 tw-border-b tw-border-gray-300 tw-border-solid '>
                    <ResponsiveContainer width={300 * funnelData.length} height={320}>
                      <BarChart data={funnelData} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                        <XAxis dataKey="name" height={30} />
                        <YAxis ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={tick => tick + "%"} domain={[0, 100]} allowDataOverflow={true} />
                        <RechartTooltip />
                        <Bar dataKey="percentage" barSize={200} fill="#639f63" background={{ fill: '#eee' }} radius={[5, 5, 0, 0]} />
                        <Bar dataKey="count" barSize={0} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Transition>
                <MemoizedResultsTable loading={queryLoading} schema={schema} results={queryResults} placeholder="Choose two or more steps to see results!" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type StepsProps = {
  id: number;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  steps: FunnelStep[];
  setErrorMessage: (message: string | null) => void;
  updateFunnel: (id: number, updates: FunnelUpdates) => void;
};

const Steps: React.FC<StepsProps> = props => {
  const { id, connectionID, eventSetID, steps, setErrorMessage, updateFunnel } = props;
  const [eventOptions, setEventOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const [eventPropertyOptions, setEventPropertyOptions] = useState<PropertyGroup[]>();
  const [propertiesLoading, setPropertiesLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!connectionID || !eventSetID) {
      return;
    }

    let ignore = false;

    setLoading(true);
    getEvents(connectionID, eventSetID).then((results) => {
      if (!ignore) {
        setEventOptions(results);
        setLoading(false);
      }
    });

    setPropertiesLoading(true);
    getProperties(connectionID, eventSetID).then((results) => {
      if (!ignore) {
        // TODO: support additional event property groups
        setEventPropertyOptions(results);
        setPropertiesLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [connectionID, eventSetID]);

  const onEventSelected = useCallback((value: string, index: number) => {
    if (steps[index].step_name !== value) {
      setErrorMessage(null);
      const updatedSteps: FunnelStepInput[] = [...steps];
      // Clear filters on event selected since they may no longer apply
      updatedSteps[index] = { step_name: value, filters: [] };
      updateFunnel(Number(id), { steps: updatedSteps });
    }
  }, [id, steps, setErrorMessage, updateFunnel]);

  const onEventRemoved = useCallback((index: number) => {
    setErrorMessage(null);
    const updatedSteps = steps.filter((_, i) => i !== index);
    updateFunnel(Number(id), { steps: updatedSteps });
  }, [id, steps, setErrorMessage, updateFunnel]);

  const onEventAdded = useCallback((value: string) => {
    setErrorMessage(null);
    // New events, filters should be empty
    const updatedSteps: FunnelStepInput[] = [...steps, { step_name: value, filters: [] }];
    updateFunnel(Number(id), { steps: updatedSteps });
  }, [id, steps, setErrorMessage, updateFunnel]);

  const setStepFilters = useCallback((filters: StepFilter[], stepIndex: number) => {
    if (!stepFiltersMatch(steps[stepIndex].filters, filters)) {
      setErrorMessage(null);
      const updatedSteps: FunnelStep[] = [...steps];
      updatedSteps[stepIndex] = { ...steps[stepIndex], filters: filters };
      updateFunnel(Number(id), { steps: updatedSteps });
    }
  }, [id, steps, setErrorMessage, updateFunnel]);

  return (
    <>
      <span className='tw-uppercase tw-font-bold'>Steps</span>
      <div id="steps" className='tw-mt-2'>
        {steps.map((step, index) =>
          <Step
            key={index}
            index={index}
            step={step}
            setEvent={(event) => onEventSelected(event, index)}
            eventOptions={eventOptions}
            eventPropertyOptions={eventPropertyOptions}
            loading={loading}
            propertiesLoading={propertiesLoading}
            removeEvent={() => onEventRemoved(index)}
            setStepFilters={(stepFilters) => setStepFilters(stepFilters, index)}
            connectionID={connectionID}
            eventSetID={eventSetID}
          />
        )}
        <NewStep index={steps.length} addEvent={onEventAdded} eventOptions={eventOptions} loading={loading} />
      </div>
    </>
  );
};

type StepProp = {
  index: number;
  step: FunnelStep;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  eventOptions: string[] | undefined;
  eventPropertyOptions: PropertyGroup[] | undefined;
  setEvent: (event: string) => void;
  removeEvent: () => void;
  setStepFilters: (filters: StepFilter[]) => void;
  loading: boolean;
  propertiesLoading: boolean;
};

const Step: React.FC<StepProp> = props => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { index, step, connectionID, eventSetID, eventOptions, eventPropertyOptions, setEvent, removeEvent, loading, propertiesLoading, setStepFilters } = props;

  return (
    <div className='tw-flex tw-mb-4'>
      <div className='tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-t-md tw-rounded-b-md'>
        <div className='tw-flex tw-items-center tw-p-2'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-bg-fabra-green-500 tw-text-white tw-h-6 tw-w-6 tw-my-auto'>
            {index + 1}
          </div>
          <ControlledEventSelector className="tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" event={step?.step_name} setEvent={setEvent} eventOptions={eventOptions} loading={loading} />
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
        <StepFilters show={showFilters} connectionID={connectionID} eventSetID={eventSetID} filters={step.filters} eventPropertyOptions={eventPropertyOptions} setStepFilters={setStepFilters} propertiesLoading={propertiesLoading} />
      </div>
    </div>
  );
};

type NewStepProps = {
  index: number;
  eventOptions: string[] | undefined;
  addEvent: (event: string) => void;
  loading: boolean;
};

const NewStep: React.FC<NewStepProps> = props => {
  return (
    <div className='tw-flex tw-mb-4'>
      <div className='tw-w-full tw-mt-[-1px] tw-border tw-border-solid tw-border-gray-300 tw-rounded-t-md tw-rounded-b-md'>
        <div className='tw-flex tw-items-center tw-p-2'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-bg-fabra-green-500 tw-text-white tw-h-6 tw-w-6 tw-my-auto'>
            {props.index + 1}
          </div>
          <ControlledEventSelector className="tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" event={undefined} setEvent={props.addEvent} eventOptions={props.eventOptions} loading={props.loading} />
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
  filters: StepFilter[];
  eventPropertyOptions: PropertyGroup[] | undefined;
  setStepFilters: (filters: StepFilter[]) => void;
  propertiesLoading: boolean;
};

const StepFilters: React.FC<StepFiltersProp> = props => {
  const { connectionID, eventSetID, filters, eventPropertyOptions, propertiesLoading, setStepFilters } = props;

  const updateFilter = (filter: StepFilter, index: number) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = filter;
    setStepFilters(updatedFilters);
  };

  const addFilter = (filter: StepFilter) => {
    const updatedFilters: StepFilter[] = [...filters, filter];
    setStepFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setStepFilters(updatedFilters);
  };

  return (
    <Transition show={props.show}>
      {filters.map((filter, i) =>
        <StepFilterComponent key={i} index={i} filter={filter} connectionID={connectionID} eventSetID={eventSetID} eventPropertyOptions={eventPropertyOptions} setStepFilter={(filter: StepFilter) => updateFilter(filter, i)} removeFilter={() => removeFilter(i)} propertiesLoading={propertiesLoading} />
      )}
      <StepFilterComponent index={filters.length} filter={undefined} connectionID={connectionID} eventSetID={eventSetID} eventPropertyOptions={eventPropertyOptions} setStepFilter={(filter: StepFilter) => addFilter(filter)} removeFilter={() => null} propertiesLoading={propertiesLoading} newFilter={true} />
    </Transition>
  );
};

type StepFilterProp = {
  index: number;
  filter: StepFilter | undefined;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  eventPropertyOptions: PropertyGroup[] | undefined;
  setStepFilter: (filter: StepFilter) => void;
  removeFilter: () => void;
  propertiesLoading: boolean;
  newFilter?: boolean;
};

const StepFilterComponent: React.FC<StepFilterProp> = props => {
  const { index, filter, connectionID, eventSetID, eventPropertyOptions, propertiesLoading, setStepFilter, removeFilter, newFilter } = props;
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
        <ControlledPropertySelector className="tw-inline tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" property={property} setProperty={onFilterPropertyChanged} propertyOptions={eventPropertyOptions} loading={propertiesLoading} />
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

const RightArrow: React.FC<{ className?: string; }> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 17 17" fill="none">
      <path d="M12.25 8.25L16 12M16 12L12.25 15.75M16 12H1V-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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