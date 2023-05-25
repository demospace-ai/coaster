import { useNavigate, useParams } from "react-router-dom";
import { NewObject } from "src/pages/objects/NewObject";
import { useDestination, useObject } from "src/rpc/data";

export const UpdateObject: React.FC = () => {
  const navigate = useNavigate();
  const { objectID } = useParams<{ objectID: string }>();
  const { object: initObj } = useObject(Number(objectID));
  const { destination } = useDestination(Number(initObj?.destination_id));
  return (
    <NewObject
      existingObject={initObj}
      existingDestination={destination}
      onComplete={() => {
        navigate(`/objects/${objectID}`);
      }}
    />
  );
};
