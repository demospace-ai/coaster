import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sendRequest } from "src/rpc/ajax";
import { GetQuestion, GetQuestionResponse } from "src/rpc/api";
import styles from "./question.m.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type QuestionParams = {
  id: string;
};

const getQuestion = async (id: string, setLoading: (loading: boolean) => void, setQuestionResponse: (question: GetQuestionResponse) => void) => {
  const payload = {"questionID": id};
  try {
    const getQuestionResponse = await sendRequest(GetQuestion, payload);
    setQuestionResponse(getQuestionResponse);
    setLoading(false);
  } catch (e) {
  }
}

export const Question: React.FC = () => {
  const { id } = useParams<QuestionParams>();
  const [loading, setLoading] = useState(true);
  const [questionResponse, setQuestionResponse] = useState<GetQuestionResponse | undefined>(undefined);
  const [answerDraft, setAnswerDraft] = useState('');
  useEffect(() => {
    getQuestion(id, setLoading, setQuestionResponse);
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}/>
      </div>
    )
  }

  console.log(questionResponse);

  return (
    <div className={styles.questionContainer}>
      <div className={styles.question}>
        <h1>{questionResponse?.question.title}</h1>
        <div>{questionResponse?.question.body}</div>
      </div>
      <div>
        {/* TODO: actually provide a way to tag someone. */}
        <div style={{paddingBottom: "20px"}}>Know someone who can answer? Tag them here!</div>
        <ReactQuill className={styles.answerInput} theme="snow" value={answerDraft} onChange={setAnswerDraft}/>
        <button className={styles.submitAnswerButton}>Post your answer</button>
      </div>
    </div>
  )
}