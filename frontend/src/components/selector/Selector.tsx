import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { ColumnSchema, Connection, Destination, Object } from "src/rpc/api";
import { useColumnValues, useDestinations, useNamespaces, useObjects, useTables } from "src/rpc/data";

type DestinationSelectorProps = {
  destination: Destination | undefined;
  setDestination: (destination: Destination) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const DestinationSelector: React.FC<DestinationSelectorProps> = props => {
  const { destinations } = useDestinations();

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.destination}
    setSelected={props.setDestination}
    getElementForDisplay={(destination: Destination) => destination.display_name}
    options={destinations}
    loading={!destinations}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No destinations available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose destination"}
    label="Destination"
    validated={props.validated} />;
};

type NamespaceSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  setNamespace: (datasetName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const NamespaceSelector: React.FC<NamespaceSelectorProps> = props => {
  const { namespaces } = useNamespaces(props.connection?.id);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.namespace}
    setSelected={props.setNamespace}
    options={namespaces}
    loading={!namespaces}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No namespaces available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose namespace"}
    label="Namespace"
    validated={props.validated} />;
};

type TableSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  setTableName: (tableName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  allowCustom?: boolean;
};

export const TableSelector: React.FC<TableSelectorProps> = props => {
  const { tables } = useTables(props.connection?.id, props.namespace);

  return <ValidatedComboInput
    className={props.className}
    selected={props.tableName}
    setSelected={props.setTableName}
    options={tables}
    loading={!tables}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    label="Table"
    validated={props.validated}
    allowCustom={props.allowCustom} />;
};

type ObjectSelectorProps = {
  linkToken?: string;
  object: Object | undefined;
  setObject: (object: Object) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  allowCustom?: boolean;
};

export const ObjectSelector: React.FC<ObjectSelectorProps> = props => {
  const { objects } = useObjects(props.linkToken);

  return <ValidatedComboInput
    className={props.className}
    selected={props.object}
    setSelected={props.setObject}
    getElementForDisplay={(object: Object) => object.display_name}
    options={objects}
    loading={!objects}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No objects available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose object"}
    label="Object"
    validated={props.validated}
    allowCustom={props.allowCustom} />;
};

type ColumnValueSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  column: ColumnSchema | undefined;
  columnValue: string | number | null | undefined,
  setColumnValue: (columnName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  loading?: boolean;
};

export const ColumnValueSelector: React.FC<ColumnValueSelectorProps> = props => {
  const { columnValues } = useColumnValues(props.connection?.id, props.namespace, props.tableName, props.column?.name);

  return <ValidatedComboInput
    className={props.className}
    selected={props.columnValue}
    setSelected={props.setColumnValue}
    options={columnValues}
    getElementForDisplay={(propertyValue: string) => propertyValue ? propertyValue : "<empty>"}
    loading={!columnValues}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No column values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose column value"}
    validated={props.validated}
    allowCustom={true} />;
};

type DateRangeSelectorProps = {
  dateRange: string | undefined;
  setDateRange: (dateRange: string) => void;
  className?: string;
  placeholder?: string;
  validated?: boolean;
};

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = props => {
  return <ValidatedDropdownInput
    className={props.className}
    selected={props.dateRange}
    setSelected={props.setDateRange}
    options={["Today", "Last 7 days", "Last 14 days", "Last 30 days", "Last 60 days", "Last 90 days", "Last 365 days", "Year to date", "All time"]}
    loading={false}
    noOptionsString=""
    placeholder={props.placeholder ? props.placeholder : "Choose date range"}
    validated={props.validated}
  />;
};