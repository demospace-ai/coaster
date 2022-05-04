import { useParams } from "react-router-dom";

type QuestionParams = {
  id: string;
};


export const Question: React.FC = () => {
  const { id } = useParams<QuestionParams>();

  return (
    <h1>{id}</h1>
  )
}