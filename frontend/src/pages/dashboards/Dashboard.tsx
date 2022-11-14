import { useParams } from "react-router-dom";
import { DashboardHeader } from "src/components/dashboard/DashboardComponents";
import { Loading } from "src/components/loading/Loading";
import { useDashboard } from "src/rpc/data";


export const Dashboard: React.FC = () => {
  const { id } = useParams<{ id: string; }>();
  const { dashboard } = useDashboard(id!);

  if (!id) {
    return <Loading />;
  }

  if (!dashboard) {
    return <Loading />;
  }

  return (
    <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll">
      <DashboardHeader id={id} onSave={() => Promise.resolve()} />
    </div>
  );
};