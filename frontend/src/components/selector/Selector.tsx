import classNames from "classnames";
import { useEffect, useState } from "react";
import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { getPropertyValues } from "src/queries/queries";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, FilterType, GetDataConnections, GetDatasets, GetEvents, GetEventSets, GetEventsRequest, GetEventsResponse, GetProperties, GetPropertiesRequest, GetPropertiesResponse, GetTables, Property, PropertyGroup } from "src/rpc/api";
import useSWR, { Fetcher } from "swr";

type ConnectionSelectorProps = {
  connection: DataConnection | undefined;
  setConnection: (connection: DataConnection) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const ConnectionSelector: React.FC<ConnectionSelectorProps> = props => {
  const [connectionOptions, setConnectionOptions] = useState<DataConnection[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    let ignore = false;
    sendRequest(GetDataConnections).then((results) => {
      if (!ignore) {
        setConnectionOptions(results.data_connections);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return <ValidatedDropdownInput
    by="id"
    className={props.className}
    selected={props.connection}
    setSelected={(connection: DataConnection) => props.setConnection(connection)}
    options={connectionOptions}
    getElementForDisplay={(connection: DataConnection | undefined) => connection ? connection.display_name : ""}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No data sources available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose data source"}
    validated={props.validated} />;
};

type DatasetSelectorProps = {
  connection: DataConnection | undefined;
  datasetName: string | undefined;
  setDatasetName: (datasetName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const DatasetSelector: React.FC<DatasetSelectorProps> = props => {
  const [datasetOptions, setDatasetOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const connectionID = props.connection?.id;
  useEffect(() => {
    if (!connectionID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetDatasets, { connectionID: connectionID }).then((results) => {
      if (!ignore) {
        setDatasetOptions(results.datasets);
      }

      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [connectionID]);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.datasetName}
    setSelected={(datasetName: string) => props.setDatasetName(datasetName)}
    options={datasetOptions}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No datasets available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose dataset"}
    validated={props.validated} />;
};

type TableSelectorProps = {
  connection: DataConnection | undefined;
  datasetName: string | undefined;
  tableName: string | undefined;
  setTableName: (tableName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const TableSelector: React.FC<TableSelectorProps> = props => {
  const [tableOptions, setTableOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const connectionID = props.connection?.id;
  useEffect(() => {
    if (!connectionID || !props.datasetName) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetTables, { connectionID: connectionID, datasetID: props.datasetName }).then((results) => {
      if (!ignore) {
        setTableOptions(results.tables);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [connectionID, props.datasetName]);

  return <ValidatedComboInput
    className={props.className}
    selected={props.tableName}
    setSelected={(tableName: string) => props.setTableName(tableName)}
    options={tableOptions}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    validated={props.validated} />;
};

type EventSetSelectorProps = {
  connection: DataConnection | undefined;
  eventSet: EventSet | undefined;
  setEventSet: (eventSet: EventSet) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const EventSetSelector: React.FC<EventSetSelectorProps> = props => {
  const [eventSetOptions, setEventSetOptions] = useState<EventSet[]>();
  const [loading, setLoading] = useState(false);
  const connectionID = props.connection ? props.connection.id : undefined;
  useEffect(() => {
    if (!connectionID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetEventSets, { connectionID: connectionID }).then((results) => {
      if (!ignore) {
        setEventSetOptions(results.event_sets);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [connectionID]);

  return <ValidatedDropdownInput
    by="id"
    className={props.className}
    selected={props.eventSet}
    setSelected={(eventSet: EventSet) => props.setEventSet(eventSet)}
    options={eventSetOptions}
    getElementForDisplay={(eventSet: EventSet) => eventSet.display_name}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No event sets available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event set"}
    validated={props.validated} />;
};

export function useEvents(connectionID: number | undefined, eventSetID: number | undefined) {
  const fetcher: Fetcher<GetEventsResponse, GetEventsRequest> = (payload: GetEventsRequest) => sendRequest(GetEvents, payload);
  const shouldFetch = connectionID && eventSetID;
  const { data, error } = useSWR(() => shouldFetch ? { GetEvents, connectionID, eventSetID } : { data: { events: [] } }, fetcher);
  return { events: data?.events, error };
}

type EventSelectorProps = {
  connectionID: number | undefined;
  eventSetID: number | undefined;
  event: string | undefined,
  setEvent: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const EventSelector: React.FC<EventSelectorProps> = props => {
  const { events } = useEvents(props.connectionID, props.eventSetID);
  return <ValidatedComboInput
    className={props.className}
    selected={props.event}
    setSelected={(event: string) => props.setEvent(event)}
    options={events}
    loading={!events}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No events available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event"}
    validated={props.validated} />;
};

type FilterSelectorProps = {
  filterType: FilterType,
  setFilterType: (filterType: FilterType) => void;
  className?: string;
  placeholder?: string;
  validated?: boolean;
};

export const FilterSelector: React.FC<FilterSelectorProps> = props => {

  const getElementForDisplay = (filterType: FilterType) => {
    switch (filterType) {
      case (FilterType.Equal):
        return "=";
      case (FilterType.NotEqual):
        return "≠";
      case (FilterType.GreaterThan):
        return ">";
      case (FilterType.LessThan):
        return "<";
      case (FilterType.Contains):
        return "∋";
      case (FilterType.NotContains):
        return "∌";
    }
  };


  const getElementForDropdown = (filterType: FilterType) => {
    switch (filterType) {
      case (FilterType.Equal):
        return "= equals";
      case (FilterType.NotEqual):
        return "≠ not equals";
      case (FilterType.GreaterThan):
        return "> greater than";
      case (FilterType.LessThan):
        return "< less than";
      case (FilterType.Contains):
        return "∋ contains";
      case (FilterType.NotContains):
        return "∌ doesn't contain";
    }
  };

  return <ValidatedDropdownInput
    className={classNames(props.className, "tw-text-center tw-text-[16px]")}
    selected={props.filterType}
    setSelected={(filterType: FilterType) => props.setFilterType(filterType)}
    options={Object.values(FilterType)}
    getElementForDisplay={getElementForDisplay}
    getElementForDropdown={getElementForDropdown}
    loading={false}
    noOptionsString={"No filter types available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose filter type"}
    validated={props.validated}
    noCaret={true} />;
};


export function useEventProperties(connectionID: number | undefined, eventSetID: number | undefined) {
  const fetcher: Fetcher<GetPropertiesResponse, GetPropertiesRequest> = (payload: GetPropertiesRequest) => sendRequest(GetProperties, payload);
  const shouldFetch = connectionID && eventSetID;
  const { data, error } = useSWR(() => shouldFetch ? { GetProperties, connectionID, eventSetID } : { data: { property_groups: [] } }, fetcher);
  return { properties: data?.property_groups, error };
}

type PropertySelectorProps = {
  property: Property | undefined,
  setProperty: (property: Property) => void;
  connectionID: number | undefined;
  eventSetID: number | undefined;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const PropertySelector: React.FC<PropertySelectorProps> = props => {
  const { properties } = useEventProperties(props.connectionID, props.eventSetID);
  const propertyNames = properties && properties.length > 0 ? properties[0].properties : [];

  return <ValidatedComboInput
    className={props.className}
    selected={props.property}
    setSelected={(property: Property) => props.setProperty(property)}
    getElementForDisplay={(property: Property) => property.name}
    options={propertyNames}
    loading={!properties}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No event properties available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event property"}
    validated={props.validated} />;
};

type PropertyValueSelectorProps = {
  connectionID: number | undefined;
  eventSetID: number | undefined;
  property: Property | undefined;
  customPropertyGroupID?: number;
  propertyValue: string | number | null | undefined,
  setPropertyValue: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  eventPropertyOptions?: PropertyGroup[];
  loading?: boolean;
};

export const PropertyValueSelector: React.FC<PropertyValueSelectorProps> = props => {
  const [propertyValues, setPropertyValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.connectionID || !props.eventSetID || !props.property?.name) {
      return;
    }

    setLoading(true);
    let ignore = false;
    getPropertyValues(props.connectionID, props.eventSetID, props.property.name).then((results) => {
      if (!ignore) {
        setPropertyValues(results);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID, props.eventSetID, props.property?.name]);

  return <ValidatedComboInput
    className={props.className}
    selected={props.propertyValue}
    setSelected={(eventProperty: string) => props.setPropertyValue(eventProperty)}
    options={propertyValues}
    getElementForDisplay={(propertyValue: string) => propertyValue ? propertyValue : "<empty>"}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No properties values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose property value"}
    validated={props.validated}
    allowCustom={true} />;
};