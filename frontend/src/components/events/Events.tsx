import { Transition } from "@headlessui/react";
import { FunnelIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DivButton } from "src/components/button/Button";
import { RightArrow } from "src/components/icons/Icons";
import { EventSelector, FilterSelector, PropertySelector, PropertyValueSelector } from "src/components/selector/Selector";
import { Event, EventFilter, EventInput, filtersMatch, FilterType, Property } from "src/rpc/api";
import { useAnalysis } from "src/rpc/data";

export type EventUpdates = {
  events?: EventInput[],
};

type EventsProps = {
  analysisID: string;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  setErrorMessage: (message: string | null) => void;
};

export const Events: React.FC<EventsProps> = props => {
  const { analysisID, connectionID, eventSetID, setErrorMessage } = props;
  const { analysis, updateAnalysis } = useAnalysis(analysisID);
  const events = useMemo(() => {
    return analysis?.events ? analysis.events : [];
  }, [analysis]);

  const onEventSelected = useCallback((value: string, index: number) => {
    if (events[index].name !== value) {
      setErrorMessage(null);
      const updatedEvents: EventInput[] = [...events];
      // Clear filters on event selected since they may no longer apply
      updatedEvents[index] = { name: value, filters: [] };
      updateAnalysis({ analysis_id: Number(analysisID), events: updatedEvents });
    }
  }, [analysisID, events, setErrorMessage, updateAnalysis]);

  const onEventRemoved = useCallback((index: number) => {
    setErrorMessage(null);
    const updatedEvents = events.filter((_, i) => i !== index);
    updateAnalysis({ analysis_id: Number(analysisID), events: updatedEvents });
  }, [analysisID, events, setErrorMessage, updateAnalysis]);

  const onEventAdded = useCallback((value: string) => {
    setErrorMessage(null);
    // New events, filters should be empty
    const updatedEvents: EventInput[] = [...events, { name: value, filters: [] }];
    updateAnalysis({ analysis_id: Number(analysisID), events: updatedEvents });
  }, [analysisID, events, setErrorMessage, updateAnalysis]);

  const setEventFilters = useCallback((filters: EventFilter[], eventIndex: number) => {
    if (!filtersMatch(events[eventIndex].filters, filters)) {
      setErrorMessage(null);
      const updatedEvents: Event[] = [...events];
      updatedEvents[eventIndex] = { ...events[eventIndex], filters: filters };
      updateAnalysis({ analysis_id: Number(analysisID), events: updatedEvents });
    }
  }, [analysisID, events, setErrorMessage, updateAnalysis]);

  return (
    <>
      <span className='tw-uppercase tw-font-bold tw-mb-3 tw-text-xs tw-select-none'>Events</span>
      <div id="events">
        {events.map((event, index) =>
          <EventComponent
            key={index}
            index={index}
            event={event}
            setEvent={(event) => onEventSelected(event, index)}
            removeEvent={() => onEventRemoved(index)}
            setEventFilters={(eventFilters) => setEventFilters(eventFilters, index)}
            connectionID={connectionID}
            eventSetID={eventSetID}
          />
        )}
        <NewEvent index={events.length} addEvent={onEventAdded} connectionID={connectionID} eventSetID={eventSetID} />
      </div>
    </>
  );
};

type EventProp = {
  index: number;
  event: Event;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  setEvent: (event: string) => void;
  removeEvent: () => void;
  setEventFilters: (filters: EventFilter[]) => void;
};

const EventComponent: React.FC<EventProp> = props => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { index, event, connectionID, eventSetID, setEvent, removeEvent, setEventFilters } = props;

  return (
    <div className='tw-flex tw-mb-4'>
      <div className='tw-w-full'>
        <div className='tw-flex tw-items-center'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-h-6 tw-w-6 tw-my-auto tw-border-[2px] tw-border-gray-300 tw-font-bold'>
            {index + 1}
          </div>
          <EventSelector className="hover:tw-bg-green-100" connectionID={connectionID} eventSetID={eventSetID} event={event?.name} setEvent={setEvent} />
          <DivButton className='tw-p-1 tw-ml-2 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className='tw-h-6 tw-stroke-[1.7]' />
            {event.filters.length > 0 &&
              <div className='tw-relative'>
                <span className="tw-absolute tw-bottom-[14px] tw-left-[14px] tw-flex tw-shrink-0 tw-items-center tw-rounded-full tw-border-2 tw-border-solid tw-border-white tw-bg-fabra-green-500 tw-h-[18px] tw-w-[18px] tw-justify-center tw-text-[10px] tw-text-white tw-font-bold">
                  {event.filters.length}
                </span>
              </div>
            }
          </DivButton>
          <DivButton className='tw-p-1 tw-ml-[1px] hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={removeEvent} >
            <TrashIcon className='tw-h-6 tw-stroke-[1.7]' />
          </DivButton>
        </div>
        <EventFilters show={showFilters} connectionID={connectionID} eventSetID={eventSetID} filters={event.filters} setEventFilters={setEventFilters} />
      </div>
    </div>
  );
};

type NewEventProps = {
  index: number;
  addEvent: (event: string) => void;
  connectionID: number | undefined;
  eventSetID: number | undefined;
};

const NewEvent: React.FC<NewEventProps> = props => {
  return (
    <div className='tw-flex tw-mb-4'>
      <div className='tw-w-full'>
        <div className='tw-flex tw-items-center'>
          <div className='tw-flex tw-mr-2 tw-items-center tw-justify-center tw-shrink-0 tw-rounded-full tw-h-6 tw-w-6 tw-my-auto tw-border-[2px] tw-border-gray-300 tw-font-bold'>
            {props.index + 1}
          </div>
          <EventSelector event={undefined} setEvent={props.addEvent} connectionID={props.connectionID} eventSetID={props.eventSetID} />
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

type EventFiltersProp = {
  show: boolean;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  filters: EventFilter[];
  setEventFilters: (filters: EventFilter[]) => void;
};

const EventFilters: React.FC<EventFiltersProp> = props => {
  const { connectionID, eventSetID, filters, setEventFilters } = props;

  const updateFilter = (filter: EventFilter, index: number) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = filter;
    setEventFilters(updatedFilters);
  };

  const addFilter = (filter: EventFilter) => {
    const updatedFilters: EventFilter[] = [...filters, filter];
    setEventFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setEventFilters(updatedFilters);
  };

  return (
    <Transition as="div" className="tw-mt-1" show={props.show}>
      {filters.map((filter, i) =>
        <EventFilterComponent key={i} index={i} filter={filter} connectionID={connectionID} eventSetID={eventSetID} setEventFilter={(filter: EventFilter) => updateFilter(filter, i)} removeFilter={() => removeFilter(i)} />
      )}
      <EventFilterComponent index={filters.length} filter={undefined} connectionID={connectionID} eventSetID={eventSetID} setEventFilter={(filter: EventFilter) => addFilter(filter)} removeFilter={() => null} newFilter={true} />
    </Transition>
  );
};

type EventFilterProp = {
  index: number;
  filter: EventFilter | undefined;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  setEventFilter: (filter: EventFilter) => void;
  removeFilter: () => void;
  newFilter?: boolean;
};

const EventFilterComponent: React.FC<EventFilterProp> = props => {
  const { index, filter, connectionID, eventSetID, setEventFilter, removeFilter, newFilter } = props;
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
      setEventFilter({ property: property, property_value: propertyValue, filter_type: filterType });
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
      setEventFilter({ property: property, property_value: valueString, filter_type: filterType });
    }
  };

  return (
    <>
      <div className='tw-p-2 tw-rounded-b-md tw-flex tw-items-center '>
        {getFilterPrefix(index)}
        <PropertySelector className="tw-inline tw-border-none tw-bg-gray-100 hover:tw-bg-green-100" property={property} setProperty={onFilterPropertyChanged} connectionID={connectionID} eventSetID={eventSetID} />
        <div className='tw-flex tw-shrink-0 tw-relative tw-ml-2 tw-w-8'>
          <div className='tw-absolute tw-top-2 tw-left-2 tw-p-1 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md' onClick={removeFilter}>
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
        <RightArrow className='tw-mt-[-4px] tw-ml-1 tw-h-6 tw-stroke-gray-400 tw-stroke-[1.2]' />
        <span className='tw-bg-orange-200 tw-rounded-md tw-ml-auto tw-px-2 tw-py-1 tw-uppercase tw-font-bold tw-text-xs'>where</span>
      </div>
    );
  }
};