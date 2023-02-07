import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { ColumnSchema, DataConnection } from "src/rpc/api";
import { useColumnValues, useDataConnections, useDatasets, useTables } from "src/rpc/data";

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
    setSelected={props.setConnection}
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
    setSelected={props.setDatasetName}
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
    setSelected={props.setTableName}
    options={tables}
    loading={!tables}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    validated={props.validated}
    allowCustom={props.allowCustom} />;
};

type PropertyValueSelectorProps = {
  connectionID: number | undefined;
  eventSetID: number | undefined;
  column: ColumnSchema | undefined;
  customPropertyGroupID?: number;
  columnValue: string | number | null | undefined,
  setColumnValue: (columnName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  loading?: boolean;
};

export const ColumnValueSelector: React.FC<PropertyValueSelectorProps> = props => {
  const { columnValues } = useColumnValues(props.connectionID, props.eventSetID, props.column?.name);

  return <ValidatedComboInput
    className={props.className}
    selected={props.columnValue}
    setSelected={props.setColumnValue}
    options={columnValues}
    getElementForDisplay={(propertyValue: string) => propertyValue ? propertyValue : "<empty>"}
    loading={!columnValues}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No properties values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose property value"}
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