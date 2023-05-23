import { PencilIcon } from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";
import { InfoIcon } from "src/components/icons/Icons";
import { ConnectionImage } from "src/components/images/Connections";
import { Loading } from "src/components/loading/Loading";
import { PrivateKey } from "src/components/privateKey/PrivateKey";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { ConnectionType, getConnectionType } from "src/rpc/api";
import { useDestination } from "src/rpc/data";

export const Destination: React.FC = () => {
  const { destinationID } = useParams<{ destinationID: string }>();
  const { destination } = useDestination(Number(destinationID));

  if (!destination) {
    return <Loading />;
  }

  return (
    <div className="tw-py-5 tw-px-10 tw-h-full tw-overflow-scroll">
      <div className="tw-flex tw-w-full tw-mb-1 tw-mt-2">
        <div className="tw-flex tw-flex-row tw-items-center tw-font-bold tw-text-lg">
          {destination.display_name}
          <div className="hover:tw-bg-slate-200 tw-p-1 tw-rounded tw-ml-1 tw-cursor-pointer">
            <PencilIcon className="tw-h-4" />
          </div>
        </div>
      </div>
      <div className="tw-flex tw-items-center">
        <ConnectionImage connectionType={destination.connection.connection_type} className="tw-h-6 -tw-ml-1 tw-mr-1" />
        {getConnectionType(destination.connection.connection_type)}
      </div>
      <div className="tw-font-bold tw-text-lg tw-mt-8">Configuration</div>
      {destination.connection.connection_type === ConnectionType.Webhook && (
        <>
          <div className="tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-2">
            <span>Webhook Signing Key</span>
            <Tooltip
              placement="right"
              label="Use this signing key to verify the signature of incoming webhook requests from Fabra."
              interactive
              maxWidth={500}
            >
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </div>
          <PrivateKey keyValue={destination.webhook_signing_key} />
        </>
      )}
    </div>
  );
};
