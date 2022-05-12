import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Editor } from 'src/components/editor/Editor';
import { Loading } from 'src/components/loading/Loading';
import { sendRequest } from 'src/rpc/ajax';
import { CreateAnswer, GetQuestion, GetQuestionResponse } from 'src/rpc/api';
import styles from './question.m.css';


type QuestionParams = {
  id: string;
};

const getQuestion = async (id: string, setLoading: (loading: boolean) => void, setQuestionResponse: (question: GetQuestionResponse) => void) => {
  const payload = { 'questionID': id };
  try {
    const getQuestionResponse = await sendRequest(GetQuestion, payload);
    setQuestionResponse(getQuestionResponse);
    setLoading(false);
  } catch (e) {
  }
};

const createAnswer = async (questionID: string, answerBody: string, setLoading: (loading: boolean) => void, setQuestionResponse: (question: GetQuestionResponse) => void) => {
  setLoading(true);
  const payload = { 'question_id': parseInt(questionID, 10), 'answer_body': answerBody };
  try {
    const getQuestionResponse = await sendRequest(CreateAnswer, payload);
    setQuestionResponse(getQuestionResponse);
    setLoading(false);
  } catch (e) {
  }
};

export const Question: React.FC = () => {
  const { id } = useParams<QuestionParams>();
  const [loading, setLoading] = useState(true);
  const [questionResponse, setQuestionResponse] = useState<GetQuestionResponse | undefined>(undefined);
  const [answerDraft, setAnswerDraft] = useState<string>('');
  useEffect(() => {
    getQuestion(id!, setLoading, setQuestionResponse);
  }, [id]);

  if (loading) {
    return (
      <Loading />
    );
  }

  const onCreateAnswer = () => {
    setAnswerDraft('');
    createAnswer(id!, answerDraft, setLoading, setQuestionResponse);
  };

  return (
    <div className={styles.questionContainer}>
      <div className={styles.question}>
        <h1>{questionResponse!.question.title}</h1>
        <div>{questionResponse!.question.body}</div>
      </div>
      {questionResponse!.answers.length > 0 &&
        <div className={styles.answersContainer}>
          {questionResponse!.answers.length === 1 && <h3> 1 Answer</h3>}
          {questionResponse!.answers.length > 1 && <h3>{questionResponse!.answers.length} Answers</h3>}
          <ul className={styles.answers}>
            {questionResponse!.answers.map((answer, index) => (
              <li key={index} className={styles.answer}>
                {answer.body}
              </li>
            ))}
          </ul>
        </div>
      }
      <div>
        {/* TODO: actually provide a way to tag someone. */}
        <div style={{ paddingBottom: '20px' }}>Know someone who can answer? Tag them here!</div>
        <Editor
          className={styles.answerInput}
          onChange={value => { setAnswerDraft(JSON.stringify(value)); }}
        />
        <Button className={styles.answerButton} onClick={onCreateAnswer}>Post your answer</Button>
      </div>
    </div >
  );
};