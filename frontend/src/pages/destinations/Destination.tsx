import { PencilIcon } from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";
import { getConnectionTypeImg } from "src/components/images/connections";
import { Loading } from "src/components/loading/Loading";
import { getConnectionType } from "src/rpc/api";
import { useDestination } from "src/rpc/data";


export const Destination: React.FC = () => {
  const { destinationID } = useParams<{ destinationID: string; }>();
  const { destination } = useDestination(Number(destinationID));

  if (!destination) {
    return <Loading />;
  }

  return (
    <div className='tw-py-5 tw-px-10 tw-h-full tw-overflow-scroll'>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-row tw-items-center tw-font-bold tw-text-lg">
          {destination.display_name}
          <div className="hover:tw-bg-slate-200 tw-p-1 tw-rounded tw-ml-1 tw-cursor-pointer"><PencilIcon className="tw-h-4" /></div>
        </div>
      </div>
      <div className="tw-flex tw-items-center">
        <img src={getConnectionTypeImg(destination.connection.connection_type)} alt="data source logo" className="tw-h-6 -tw-ml-1 tw-mr-1" />
        {getConnectionType(destination.connection.connection_type)}
      </div>
      <div className="tw-mt-10 tw-font-medium">
        Configuration
      </div>
    </div>
  );
};
