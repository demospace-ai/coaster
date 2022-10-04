import classNames from "classnames";
import { useEffect, useState } from "react";
import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { getEvents } from "src/queries/queries";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, FilterType, GetDataConnections, GetDatasets, GetEventSets, GetTables, PropertyGroup } from "src/rpc/api";

type ConnectionSelectorProps = {
  connection: DataConnection | null;
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
    getElementForDisplay={(connection: DataConnection) => connection.display_name}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No data sources available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose data source"}
    validated={props.validated} />;
};

type DatasetSelectorProps = {
  connectionID: number | null;
  datasetID: string | null;
  setDatasetID: (datasetID: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const DatasetSelector: React.FC<DatasetSelectorProps> = props => {
  const [datasetOptions, setDatasetOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.connectionID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetDatasets, { connectionID: props.connectionID }).then((results) => {
      if (!ignore) {
        setDatasetOptions(results.datasets);
      }

      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID]);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.datasetID}
    setSelected={(datasetID: string) => props.setDatasetID(datasetID)}
    options={datasetOptions}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No datasets available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose dataset"}
    validated={props.validated} />;
};

type TableSelectorProps = {
  connectionID: number | null;
  datasetID: string | null;
  tableName: string | null;
  setTableName: (tableName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const TableSelector: React.FC<TableSelectorProps> = props => {
  const [tableOptions, setTableOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.connectionID || !props.datasetID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetTables, { connectionID: props.connectionID, datasetID: props.datasetID }).then((results) => {
      if (!ignore) {
        setTableOptions(results.tables);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID, props.datasetID]);

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
  connection: DataConnection | null;
  eventSet: EventSet | null;
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

type EventSelectorProps = {
  connectionID: number | null;
  eventSetID: number | null;
  event: string | null,
  setEvent: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const EventSelector: React.FC<EventSelectorProps> = props => {
  const [eventOptions, setEventOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.connectionID || !props.eventSetID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    getEvents(props.connectionID, props.eventSetID).then((results) => {
      if (!ignore) {
        setEventOptions(results);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID, props.eventSetID]);

  return <ValidatedComboInput
    className={props.className}
    selected={props.event}
    setSelected={(event: string) => props.setEvent(event)}
    options={eventOptions}
    loading={loading}
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

type ControlledEventSelectorProps = {
  event: string | null,
  setEvent: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  eventOptions?: string[];
  loading?: boolean;
};

export const ControlledEventSelector: React.FC<ControlledEventSelectorProps> = props => {
  return <ValidatedComboInput
    className={props.className}
    selected={props.event}
    setSelected={(event: string) => props.setEvent(event)}
    options={props.eventOptions}
    loading={Boolean(props.loading)}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No events available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event"}
    validated={props.validated} />;
};

type PropertySelectorProps = {
  property: string | null,
  setProperty: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  propertyOptions?: PropertyGroup[];
  loading?: boolean;
};

export const ControlledPropertySelector: React.FC<PropertySelectorProps> = props => {

  const propertyNames = props.propertyOptions && props.propertyOptions.length > 0 ? props.propertyOptions[0].properties : [];

  return <ValidatedComboInput
    className={props.className}
    selected={props.property}
    setSelected={(eventProperty: string) => props.setProperty(eventProperty)}
    options={propertyNames}
    loading={Boolean(props.loading)}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No event properties available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event property"}
    validated={props.validated} />;
};


type PropertyValueSelectorProps = {
  connectionID: number | null;
  eventSetID: number | null;
  propertyName: string | null;
  customPropertyGroupID?: number;
  propertyValue: string | null,
  setPropertyValue: (event: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  eventPropertyOptions?: PropertyGroup[];
  loading?: boolean;
};

export const PropertyValueSelector: React.FC<PropertyValueSelectorProps> = props => {
  const [propertyValues, setPropertyValues] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.connectionID || !props.eventSetID || !props.propertyName) {
      return;
    }

    setLoading(true);
    let ignore = false;
    getEvents(props.connectionID, props.eventSetID).then((results) => {
      if (!ignore) {
        setPropertyValues(results);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID, props.eventSetID, props.propertyName]);

  return <ValidatedComboInput
    className={props.className}
    selected={props.propertyValue}
    setSelected={(eventProperty: string) => props.setPropertyValue(eventProperty)}
    options={propertyValues}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No properties values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose property value"}
    validated={props.validated}
    allowCustom={true} />;
};