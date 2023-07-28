import { ConnectionImage } from "src/components/images/Connections";
import {
  ValidatedComboInput,
  ValidatedComboInputProps,
  ValidatedDropdownInput,
  ValidatedDropdownInputProps,
} from "src/components/input/Input";
import { useDestinations, useNamespaces, useTables } from "src/rpc/data";
import { AwsLocation, Connection, Destination, FieldType, GCPLocation } from "src/rpc/types";

type DestinationSelectorProps = Omit<
  Partial<ValidatedDropdownInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  destination: Destination | undefined;
  setDestination: (destination: Destination) => void;
  showLabel?: boolean;
  disabled?: boolean;
};

export const DestinationSelector: React.FC<DestinationSelectorProps> = (props) => {
  const {
    destination,
    setDestination,
    showLabel,
    className,
    noOptionsString,
    placeholder,
    validated,
    label,
    ...other
  } = props;
  const { destinations, loading } = useDestinations();
  const defaultLabel = label ? label : "Destination";

  return (
    <ValidatedDropdownInput
      className={className}
      selected={destination}
      setSelected={setDestination}
      getElementForDisplay={(destination: Destination) => (
        <div className="tw-flex tw-items-center tw-gap-x-2">
          <div>
            <ConnectionImage connectionType={destination.connection.connection_type} className="tw-h-4 tw-w-4" />
          </div>
          <div>{destination.display_name}</div>
        </div>
      )}
      options={destinations}
      loading={loading}
      noOptionsString={noOptionsString ? noOptionsString : "No destinations available!"}
      placeholder={placeholder ? placeholder : "Choose destination"}
      label={showLabel ? defaultLabel : undefined}
      validated={validated}
      {...other}
    />
  );
};

type NamespaceSelectorProps = Omit<
  Partial<ValidatedComboInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  connection: Connection | undefined;
  namespace: string | undefined;
  setNamespace: (namespace: string) => void;
  showLabel?: boolean;
};

export const NamespaceSelector: React.FC<NamespaceSelectorProps> = (props) => {
  const {
    connection,
    namespace,
    setNamespace,
    showLabel,
    className,
    noOptionsString,
    placeholder,
    validated,
    label,
    ...other
  } = props;
  const { namespaces, loading } = useNamespaces(connection?.id);
  const defaultLabel = label ? label : "Namespace";

  return (
    <ValidatedComboInput
      className={className}
      selected={namespace}
      setSelected={setNamespace}
      options={namespaces}
      loading={loading}
      noOptionsString={noOptionsString ? noOptionsString : "No namespaces available!"}
      placeholder={placeholder ? placeholder : "Choose namespace"}
      label={showLabel ? defaultLabel : undefined}
      validated={validated}
      {...other}
    />
  );
};

type TableSelectorProps = Omit<
  Partial<ValidatedComboInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  connection: Connection;
  namespace?: string | undefined;
  tableName: string | undefined;
  setTableName: (tableName: string) => void;
  showLabel?: boolean;
};

export const TableSelector: React.FC<TableSelectorProps> = (props) => {
  const {
    connection,
    namespace,
    tableName,
    setTableName,
    showLabel,
    className,
    noOptionsString,
    placeholder,
    validated,
    label,
    ...other
  } = props;
  const { tables, loading } = useTables({
    connectionID: connection.id,
    namespace,
    connectionType: connection.connection_type,
  });
  const defaultLabel = label ? label : "Table";

  return (
    <ValidatedComboInput
      className={className}
      selected={tableName}
      setSelected={setTableName}
      options={tables}
      loading={loading}
      noOptionsString={noOptionsString ? noOptionsString : "No tables available!"}
      placeholder={placeholder ? placeholder : "Choose table"}
      label={showLabel ? defaultLabel : undefined}
      validated={validated}
      {...other}
    />
  );
};

type FieldTypeSelectorProps = Omit<
  Partial<ValidatedComboInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  type: FieldType | undefined;
  setFieldType: (type: FieldType) => void;
};

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = (props) => {
  const { type, setFieldType, className, noOptionsString, placeholder, validated, label, ...other } = props;
  const fieldTypes = Object.values(FieldType);

  return (
    <ValidatedComboInput
      className={className}
      selected={type}
      setSelected={setFieldType}
      options={fieldTypes}
      getElementForDisplay={(propertyValue: string) => (propertyValue ? propertyValue : "<empty>")}
      loading={false}
      noOptionsString={noOptionsString ? noOptionsString : "No field types available!"}
      placeholder={placeholder ? placeholder : "Choose field type"}
      validated={validated}
      {...other}
    />
  );
};

type DateRangeSelectorProps = Omit<
  Partial<ValidatedDropdownInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  dateRange: string | undefined;
  setDateRange: (dateRange: string) => void;
};

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = (props) => {
  const { dateRange, setDateRange, className, noOptionsString, placeholder, validated, label, ...other } = props;
  return (
    <ValidatedDropdownInput
      className={className}
      selected={dateRange}
      setSelected={setDateRange}
      options={[
        "Today",
        "Last 7 days",
        "Last 14 days",
        "Last 30 days",
        "Last 60 days",
        "Last 90 days",
        "Last 365 days",
        "Year to date",
        "All time",
      ]}
      loading={false}
      noOptionsString=""
      placeholder={placeholder ? placeholder : "Choose date range"}
      validated={validated}
      {...other}
    />
  );
};

type GoogleLocationSelectorProps = Omit<
  Partial<ValidatedDropdownInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  location: GCPLocation | undefined;
  setLocation: (location: GCPLocation) => void;
};

export const GoogleLocationSelector: React.FC<GoogleLocationSelectorProps> = (props) => {
  const { location, setLocation, className, noOptionsString, placeholder, validated, label, ...other } = props;
  const locations: GCPLocation[] = [
    { name: "United States (us)", code: "us" },
    { name: "European Union (eu)", code: "eu" },
    { name: "South Carolina (us-east1)", code: "us-east1" },
    { name: "Northern Virginia (us-east4)", code: "us-east4" },
    { name: "Iowa (us-central1)", code: "us-central1" },
    { name: "Oregon (us-west1)", code: "us-west1" },
    { name: "Los Angeles (us-west2)", code: "us-west2" },
    { name: "Salt Lake City (us-west3)", code: "us-west3" },
    { name: "Las Vegas (us-west4)", code: "us-west4" },
    { name: "Taiwan (asia-east1)", code: "asia-east1" },
    { name: "Tokyo (asia-northeast1)", code: "asia-northeast1" },
  ];

  return (
    <ValidatedDropdownInput
      className={className}
      selected={location}
      setSelected={setLocation}
      options={locations}
      getElementForDisplay={(location: GCPLocation) => location.name}
      loading={false}
      noOptionsString=""
      placeholder={placeholder ? placeholder : "Choose date range"}
      validated={validated}
      {...other}
    />
  );
};

type AwsLocationSelectorProps = Omit<
  Partial<ValidatedDropdownInputProps>,
  "selected" | "setSelected" | "getElementForDisplay" | "loading"
> & {
  location: AwsLocation | undefined;
  setLocation: (location: AwsLocation) => void;
};

export const AwsLocationSelector: React.FC<AwsLocationSelectorProps> = (props) => {
  const { location, setLocation, className, noOptionsString, placeholder, validated, label, ...other } = props;
  const locations: AwsLocation[] = [
    { name: "US East 1 (N. Virginia)", code: "us-east-1" },
    { name: "US East 2 (Ohio)", code: "us-east-2" },
    { name: "US West 1 (N. California)", code: "us-west-1" },
    { name: "US West 2 (Oregon)", code: "us-west-2" },
    { name: "Africa South 1 (Cape Town)", code: "af-south-1" },
    { name: "Asia Pacific East 1 (Hong Kong)", code: "ap-east-1" },
    { name: "Asia Pacific South 1(Mumbai)", code: "ap-south-1" },
    { name: "Asia Pacific Northeast 3 (Osaka-Local)", code: "ap-northeast-3" },
    { name: "Asia Pacific Northeast 2 (Seoul)", code: "ap-northeast-2" },
    { name: "Asia Pacific Southeast 1 (Singapore)", code: "ap-southeast-1" },
    { name: "Asia Pacific Southeast 2 (Sydney)", code: "ap-southeast-2" },
  ];

  return (
    <ValidatedDropdownInput
      className={className}
      selected={location}
      setSelected={setLocation}
      options={locations}
      getElementForDisplay={(location: AwsLocation) => location.name}
      loading={false}
      noOptionsString=""
      placeholder={placeholder ? placeholder : "Choose date range"}
      validated={validated}
      {...other}
    />
  );
};
