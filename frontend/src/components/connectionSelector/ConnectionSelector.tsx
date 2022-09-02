import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useEffect, useState } from "react";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, GetDataConnections } from "src/rpc/api";

type ConnectionSelectorProps = {
  connection: DataConnection | null;
  setConnection: (connection: DataConnection) => void;
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

  return (
    <Listbox value={props.connection} onChange={props.setConnection}>
      <div className="tw-relative mt-1">
        <Listbox.Button className="tw-relative tw-w-full tw-rounded-lg tw-bg-white tw-py-2 tw-pl-3 tw-pr-10 tw-text-left tw-shadow-md focus:tw-outline-none focus-visible:tw-border-indigo-500 focus-visible:tw-ring-2 focus-visible:tw-ring-white focus-visible:tw-ring-opacity-75 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-green-300 sm:tw-text-sm">
          <span className="tw-block tw-truncate">{props.connection ? props.connection.display_name : "Choose data source"}</span>
          <span className="tw-pointer-events-none tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center pr-2">
            <ChevronUpDownIcon
              className="tw-h-5 tw-w-5 tw-text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="tw-transition tw-ease-out tw-duration-100"
          enterFrom="tw-transform tw-opacity-0 tw-scale-95"
          enterTo="tw-transform tw-opacity-100 tw-scale-100"
          leave="tw-transition tw-ease-in tw-duration-75"
          leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
          leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        >
          <Listbox.Options className="tw-absolute tw-mt-1 tw-max-h-60 tw-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
            <ConnectionOptions loading={loading} connectionOptions={connectionOptions} />
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

const ConnectionOptions: React.FC<{ loading: boolean, connectionOptions: DataConnection[] | undefined; }> = props => {
  if (props.loading) {
    return (
      <div className="tw-p-2">
        <Loading className="tw-m-auto tw-block" />
      </div>
    );
  }

  if (props.connectionOptions && props.connectionOptions.length > 0) {
    return (
      <>
        {props.connectionOptions!.map((connectionOption: DataConnection, index: number) => (
          <Listbox.Option key={index} value={connectionOption} className={({ active }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-10 tw-pr-4 ${active ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span
                  className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'
                    }`}
                >
                  {connectionOption.display_name}
                </span>
                {selected ? (
                  <span className="tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3 tw-text-green-600">
                    <CheckIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </Listbox.Option>
        ))
        }
      </>
    );
  } else {
    return (
      <div className="tw-p-2">No connections available!</div>
    );
  }
};