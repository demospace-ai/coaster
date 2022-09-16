import { useEffect, useState } from "react";
import { ValidatedComboInput, ValidatedDropdownInput } from "src/components/input/Input";
import { getEvents } from "src/queries/queries";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, GetDataConnections, GetDatasets, GetEventSets, GetTables } from "src/rpc/api";

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
      }

      setLoading(false);
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
    getDisplayName={(connection: DataConnection) => connection.display_name}
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
      }

      setLoading(false);
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
  connectionID: number | null;
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
  useEffect(() => {
    if (!props.connectionID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    sendRequest(GetEventSets, { connectionID: props.connectionID }).then((results) => {
      if (!ignore) {
        setEventSetOptions(results.event_sets);
      }

      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID]);

  return <ValidatedDropdownInput
    by="id"
    className={props.className}
    selected={props.eventSet}
    setSelected={(eventSet: EventSet) => props.setEventSet(eventSet)}
    options={eventSetOptions}
    getDisplayName={(eventSet: EventSet) => eventSet.display_name}
    loading={loading}
    noOptionsString={props.noOptionsString ? props.noOptionsString : "No event sets available!"}
    placeholder={props.placeholder ? props.placeholder : "Choose event set"}
    validated={props.validated} />;
};

type EventSelectorProps = {
  connectionID: number | null;
  eventSet: EventSet | null;
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
    if (!props.connectionID || !props.eventSet) {
      return;
    }

    setLoading(true);
    let ignore = false;
    getEvents(props.connectionID, props.eventSet).then((results) => {
      if (!ignore) {
        setEventOptions(results);
      }

      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [props.connectionID, props.eventSet]);

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
