import { useEffect, useState } from "react";
import { ValidatedDropdownInput } from "src/components/input/Input";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, GetDataConnections } from "src/rpc/api";

type ConnectionSelectorProps = {
  connectionID: number | null;
  setConnectionID: (connection: number) => void;
  className?: string;
  validated?: boolean;
};

export const ConnectionSelector: React.FC<ConnectionSelectorProps> = props => {
  const [connectionOptions, setConnectionOptions] = useState<DataConnection[]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
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

  const getConnection = (connectionID: number): DataConnection | undefined => {
    return connectionOptions?.find(connection => {
      return connection.id = connectionID;
    });
  };
  const selected = props.connectionID ? getConnection(props.connectionID) : undefined;

  return <ValidatedDropdownInput
    className={props.className}
    selected={selected}
    setSelected={(connection: DataConnection) => props.setConnectionID(connection.id)}
    options={connectionOptions}
    getDisplayName={(connection: DataConnection) => connection.display_name}
    loading={loading}
    noOptionsString="No connections available!"
    placeholder="Choose data source"
    validated={props.validated} />;
};