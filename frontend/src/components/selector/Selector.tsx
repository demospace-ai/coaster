import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { Connection, Destination, Field, Object, Source } from "src/rpc/api";
import { useDestinations, useFieldValues, useLinkNamespaces, useLinkSchema, useLinkSources, useLinkTables, useNamespaces, useObjects, useSchema, useTables } from "src/rpc/data";

type DestinationSelectorProps = {
  destination: Destination | undefined;
  setDestination: (destination: Destination) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const DestinationSelector: React.FC<DestinationSelectorProps> = props => {
  const { destinations, loading } = useDestinations();

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.destination}
    setSelected={props.setDestination}
    getElementForDisplay={(destination: Destination) => destination.display_name}
    options={destinations}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No destinations available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose destination"}
    label="Destination"
    validated={props.validated} />;
};

type NamespaceSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  setNamespace: (namespace: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const NamespaceSelector: React.FC<NamespaceSelectorProps> = props => {
  const { namespaces, loading } = useNamespaces(props.connection?.id);

  return <ValidatedComboInput
    className={props.className}
    selected={props.namespace}
    setSelected={props.setNamespace}
    options={namespaces}
    loading={loading}
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
};

export const TableSelector: React.FC<TableSelectorProps> = props => {
  const { tables, loading } = useTables(props.connection?.id, props.namespace);

  return <ValidatedComboInput
    className={props.className}
    selected={props.tableName}
    setSelected={props.setTableName}
    options={tables}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    label="Table"
    validated={props.validated}
  />;
};

type SourceSelectorProps = {
  source: Source | undefined;
  setSource: (source: Source) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  linkToken: string;
  dropdownHeight?: string;
};

export const SourceSelector: React.FC<SourceSelectorProps> = props => {
  const { sources, loading } = useLinkSources(props.linkToken);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.source}
    setSelected={props.setSource}
    getElementForDisplay={(source: Source) => source.display_name}
    options={sources}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No sources available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose source"}
    label="Source"
    validated={props.validated}
    dropdownHeight={props.dropdownHeight}
  />;
};

type SourceNamespaceSelectorProps = {
  source: Source | undefined;
  namespace: string | undefined;
  setNamespace: (namespace: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  linkToken: string;
  dropdownHeight?: string;
};

export const SourceNamespaceSelector: React.FC<SourceNamespaceSelectorProps> = props => {
  const { namespaces, loading } = useLinkNamespaces(props.source?.id, props.linkToken);

  return <ValidatedComboInput
    className={props.className}
    selected={props.namespace}
    setSelected={props.setNamespace}
    options={namespaces}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No namespaces available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose namespace"}
    label="Namespace"
    validated={props.validated}
    dropdownHeight={props.dropdownHeight}
  />;
};

type SourceTableSelectorProps = {
  source: Source | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  setTableName: (tableName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
  linkToken: string;
  dropdownHeight?: string;
};

export const SourceTableSelector: React.FC<SourceTableSelectorProps> = props => {
  const { tables, loading } = useLinkTables(props.source?.id, props.namespace, props.linkToken);

  return <ValidatedComboInput
    className={props.className}
    selected={props.tableName}
    setSelected={props.setTableName}
    options={tables}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No tables available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose table"}
    label="Table"
    validated={props.validated}
    dropdownHeight={props.dropdownHeight}
  />;
};

type ObjectSelectorProps = {
  object: Object | undefined;
  setObject: (object: Object) => void;
  className?: string;
  noOptionsString?: string;
  label?: string;
  placeholder?: string;
  validated?: boolean;
  linkToken?: string;
};

export const ObjectSelector: React.FC<ObjectSelectorProps> = props => {
  const { objects, loading } = useObjects(props.linkToken);

  return <ValidatedDropdownInput
    className={props.className}
    selected={props.object}
    setSelected={props.setObject}
    getElementForDisplay={(object: Object) => object.display_name}
    options={objects}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No objects available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose object"}
    label={props.label ? props.label : "Object"}
    validated={props.validated}
  />;
};

type LinkFieldSelectorProps = {
  source: Source | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  field: Field | undefined;
  setField: (field: Field) => void;
  className?: string;
  noOptionsString?: string;
  label?: string;
  placeholder?: string;
  validated?: boolean;
  linkToken: string;
};

export const LinkFieldSelector: React.FC<LinkFieldSelectorProps> = props => {
  const { schema, loading } = useLinkSchema(props.source?.id, props.namespace, props.tableName, props.linkToken);

  return <ValidatedComboInput
    className={props.className}
    options={schema}
    selected={props.field}
    setSelected={props.setField}
    getElementForDisplay={(value: Field) => value.name}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No field available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose field"}
    label={props.label}
    loading={loading}
    validated={props.validated}
  />;
};

type FieldSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  field: Field | undefined;
  setField: (field: Field) => void;
  className?: string;
  noOptionsString?: string;
  label?: string;
  placeholder?: string;
  validated?: boolean;
};

export const FieldSelector: React.FC<FieldSelectorProps> = props => {
  const { schema, loading } = useSchema(props.connection?.id, props.namespace, props.tableName);

  return <ValidatedComboInput
    className={props.className}
    options={schema}
    selected={props.field}
    setSelected={props.setField}
    getElementForDisplay={(value: Field) => value.name}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No field available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose field"}
    label={props.label ? props.label : "Field"}
    loading={loading}
    validated={props.validated}
  />;
};

type FieldValueSelectorProps = {
  connection: Connection | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  field: Field | undefined;
  fieldValue: string | number | null | undefined,
  setFieldValue: (fieldName: string) => void;
  className?: string;
  noOptionsString?: string;
  placeholder?: string;
  validated?: boolean;
};

export const FieldValueSelector: React.FC<FieldValueSelectorProps> = props => {
  const { fieldValues, loading } = useFieldValues(props.connection?.id, props.namespace, props.tableName, props.field?.name);

  return <ValidatedComboInput
    className={props.className}
    selected={props.fieldValue}
    setSelected={props.setFieldValue}
    options={fieldValues}
    getElementForDisplay={(propertyValue: string) => propertyValue ? propertyValue : "<empty>"}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No field values available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose field value"}
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