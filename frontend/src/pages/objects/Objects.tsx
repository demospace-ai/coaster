import { ObjectsListTable } from "src/components/ObjectsListTable";
import { SectionLayout } from "src/components/SectionLayout";
import { EmptyTable } from "src/components/table/Table";
import { useObjects } from "src/rpc/data";

export const ObjectsList: React.FC = () => {
  const { objects } = useObjects();
  return <SectionLayout>{objects ? <ObjectsListTable objects={objects} /> : <EmptyTable />}</SectionLayout>;
};
