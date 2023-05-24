import { WrenchIcon } from "@heroicons/react/20/solid";

export const Notifications: React.FC = () => {
  //   const navigate = useNavigate();
  //   const { objectID } = useParams<{ objectID: string }>();
  //   const { object } = useObject(Number(objectID));

  //   if (!object) {
  //     return <Loading />;
  //   }

  return (
    <div className="tw-h-full tw-flex tw-justify-center">
      <div className="tw-mt-48 tw-max-w-sm">
        <div className="tw-flex tw-items-center tw-gap-x-1">
          <h2 className="tw-text-lg tw-font-bold">Coming soon!</h2>
          <WrenchIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
        </div>
        <div>Here, you'll be able to set up Slack and email notifications for your syncs.</div>
      </div>
    </div>
  );
};
