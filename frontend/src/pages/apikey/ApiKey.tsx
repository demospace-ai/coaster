import { PrivateKey } from "src/components/privateKey/PrivateKey";
import { useApiKey } from "src/rpc/data";

export const ApiKey: React.FC = () => {
  const { apiKey } = useApiKey();

  return (
    <div className="tw-py-5 tw-px-10">
      <div className="tw-flex tw-w-full tw-mt-2 tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">API Key</div>
      </div>
      <PrivateKey keyValue={apiKey} />
    </div>
  );
};
