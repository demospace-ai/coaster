import { CheckIcon } from "@heroicons/react/24/outline";
import * as Checkbox from "@radix-ui/react-checkbox";
import classNames from "classnames";
import React, { useState } from "react";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { MemoizedResultsTable } from "src/components/queryResults/QueryResults";
import { ObjectSelector, SourceNamespaceSelector, SourceTableSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SetupSyncProps } from "src/connect/App";
import { sendLinkTokenRequest } from "src/rpc/ajax";
import { LinkGetPreview, LinkGetPreviewRequest, Object, ResultRow, Schema } from "src/rpc/api";

export const ObjectSetup: React.FC<SetupSyncProps> = (props) => {
  const setObject = (object: Object) => props.setState({ ...props.state, object: object });
  const setNamespace = (namespace: string) => props.setState({ ...props.state, namespace: namespace });
  const setTableName = (tableName: string) => props.setState({ ...props.state, tableName: tableName });
  const [limitPreview, setLimitPreview] = useState<boolean>(true);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ResultRow[] | undefined>(undefined);
  const [previewSchema, setPreviewSchema] = useState<Schema | undefined>(undefined);

  const runQuery = async () => {
    if (props.state.source === undefined) {
      return;
    }

    if (props.state.namespace === undefined) {
      return;
    }

    if (props.state.tableName === undefined) {
      return;
    }

    const payload: LinkGetPreviewRequest = {
      source_id: props.state.source!.id,
      namespace: props.state.namespace,
      table_name: props.state.tableName,
    };

    setPreviewLoading(true);
    try {
      const response = await sendLinkTokenRequest(LinkGetPreview, props.linkToken, payload);
      setPreviewData(response.data);
      setPreviewSchema(response.schema);
      setPreviewLoading(false);
    } catch (e) {
      // TODO: handle error
      setPreviewLoading(false);
    }
  };

  return (
    <div className="tw-w-full tw-px-20 tw-flex tw-flex-col tw-items-center">
      <div className="tw-text-center tw-mb-8 tw-text-2xl tw-font-bold">Define the data model to sync</div>
      <div className="tw-w-[50%] tw-min-w-[400px] tw-h-full">
        <div className="tw-text-base tw-font-semibold tw-mb-1">Select object to create</div>
        <div className="tw-text-slate-600">This is the object that will be created from the data you define in this sync configuration.</div>
        <ObjectSelector object={props.state.object} setObject={setObject} linkToken={props.linkToken} />
        <div className="tw-text-base tw-font-semibold tw-mt-8 tw-mb-1">Select a table to sync from</div>
        <div className="tw-text-slate-600">This is where the data will be pulled from in your own data warehouse.</div>
        <SourceNamespaceSelector namespace={props.state.namespace} setNamespace={setNamespace} linkToken={props.linkToken} source={props.state.source} dropdownHeight="tw-max-h-40" />
        <SourceTableSelector tableName={props.state.tableName} setTableName={setTableName} linkToken={props.linkToken} source={props.state.source} namespace={props.state.namespace} dropdownHeight="tw-max-h-40" />
        <div className="tw-flex tw-flex-row tw-mt-4 tw-items-center">
          <Button className="tw-h-10 tw-w-32" onClick={runQuery}>{previewLoading ? <Loading light /> : "Preview"}</Button>
          <Checkbox.Root checked={limitPreview} onCheckedChange={() => setLimitPreview(!limitPreview)} className={classNames("tw-ml-4 tw-mr-2 tw-h-5 tw-w-5 tw-bg-white tw-border-[1.2px] tw-border-slate-800 tw-rounded", limitPreview && "tw-bg-slate-100")}>
            <Checkbox.Indicator>
              <CheckIcon className="tw-stroke-[2]" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span>Limit preview to 100 records</span>
          <Tooltip place="right" label="Automatically add a LIMIT expression to the query to keep the number of rows fetched to 100.">
            <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
          </Tooltip>
        </div>
        {!previewData && !previewSchema && <div className="tw-pb-52"></div>}
      </div>
      {previewData && previewSchema &&
        <div className="tw-mt-10 tw-h-[400px] tw-max-h-[400px] tw-w-full tw-rounded-md tw-border tw-border-gray-200">
          <MemoizedResultsTable schema={previewSchema} results={previewData} />
          <div className="tw-pb-24"></div>
        </div>
      }
    </div >
  );
};