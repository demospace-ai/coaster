import classNames from "classnames";
import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { DataConnection, EventSet, FilterType, Property, PropertyGroup } from "src/rpc/api";
import { useDataConnections, useDatasets, useEventProperties, useEvents, useEventSets, usePropertyValues, useTables } from "src/rpc/data";

type ConnectionSelectorProps = {
  connection: DataConnection | undefined;
  setConnection: (connection: DataConnection) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const ConnectionSelector: React.FC<ConnectionSelectorProps> = props => {
  const { connections } = useDataConnections();

  return <ValidatedDropdownInput
    by="id"
    className={props.className}
    selected={props.connection}
    setSelected={(connection: DataConnection) => props.setConnection(connection)}
    options={connections}
    getElementForDisplay={(connection: DataConnection) => connection.display_name}
    loading={!connections}
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
  const { datasets } = useDatasets(props.connection?.id);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.datasetName}
    setSelected={(datasetName: string) => props.setDatasetName(datasetName)}
    options={datasets}
    loading={!datasets}
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
  allowCustom?: boolean;
};

export const TableSelector: React.FC<TableSelectorProps> = props => {
  const { tables } = useTables(props.connection?.id, props.datasetName);

  return <ValidatedComboInput
    className={props.className}
    selected={props.tableName}
    setSelected={(tableName: string) => props.setTableName(tableName)}
    options={tables}
    loading={!tables}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    validated={props.validated}
    allowCustom={props.allowCustom} />;
};

type EventSetSelectorProps = {
  connection: DataConnection | undefined; // TODO: unused, but in the future should use an API that scopes to only event sets for a specific connection
  eventSet: EventSet | undefined;
  setEventSet: (eventSet: EventSet) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const EventSetSelector: React.FC<EventSetSelectorProps> = props => {
  const { eventSets } = useEventSets();

  return <ValidatedDropdownInput
    by="id"
    className={props.className}
    selected={props.eventSet}
    setSelected={(eventSet: EventSet) => props.setEventSet(eventSet)}
    options={eventSets}
    getElementForDisplay={(eventSet: EventSet) => eventSet.display_name}
    loading={!eventSets}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No event sets available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event set"}
    validated={props.validated} />;
};

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
  const { propertyValues } = usePropertyValues(props.connectionID, props.eventSetID, props.property?.name);

  return <ValidatedComboInput
    className={props.className}
    selected={props.propertyValue}
    setSelected={(eventProperty: string) => props.setPropertyValue(eventProperty)}
    options={propertyValues}
    getElementForDisplay={(propertyValue: string) => propertyValue ? propertyValue : "<empty>"}
    loading={!propertyValues}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No properties values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose property value"}
    validated={props.validated}
    allowCustom={true} />;
};