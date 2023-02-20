import bigquery from "src/components/images/bigquery.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { ConnectionType } from "src/rpc/api";

export function getConnectionTypeImg(connectionType: ConnectionType): string {
  switch (connectionType) {
    case ConnectionType.BigQuery:
      return bigquery;
    case ConnectionType.Snowflake:
      return snowflake;
    case ConnectionType.Redshift:
      return redshift;
  }
}