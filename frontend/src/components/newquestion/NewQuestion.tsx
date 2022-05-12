import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Editor } from 'src/components/editor/Editor';
import { Loading } from 'src/components/loading/Loading';
import { sendRequest } from 'src/rpc/ajax';
import { CreateQuestion, CreateQuestionResponse } from 'src/rpc/api';
import styles from './newquestion.m.css';


const createQuestion = async (
  questionTitle: string,
  questionBody: string,
  setLoading: (loading: boolean) => void,
  setCreateQuestionResponse: (question: CreateQuestionResponse) => void
) => {
  setLoading(true);
  const payload = { 'question_title': questionTitle, 'question_body': questionBody };
  try {
    const createQuestionResponse = await sendRequest(CreateQuestion, payload);
    setCreateQuestionResponse(createQuestionResponse);
  } catch (e) {
  }
};

export const NewQuestion: React.FC = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createQuestionResponse, setCreateQuestionResponse] = useState<CreateQuestionResponse | undefined>(undefined);
  const [titleDraft, setTitleDraft] = useState<string>('');
  const [bodyDraft, setBodyDraft] = useState<string>('');

  useEffect(() => {
    if (createQuestionResponse) {
      navigate('/question/' + createQuestionResponse.question.id);
    }
  });

  if (loading) {
    return (
      <Loading />
    );
  }

  const onCreateQuestion = () => {
    createQuestion(titleDraft, bodyDraft, setLoading, setCreateQuestionResponse);
  };

  return (
    <div className={styles.questionContainer}>
      <div style={{ paddingBottom: '20px' }}>Question Title</div>
      <input
        className={styles.titleContainer}
        onChange={e => { setTitleDraft(e.target.value); }}
      />
      <div style={{ paddingBottom: '20px' }}>Question Content</div>
      <Editor
        className={styles.bodyContainer}
        onChange={value => { setBodyDraft(JSON.stringify(value)); }}
      />
      <Button className={styles.submitQuestionButton} onClick={onCreateQuestion}>Ask your question</Button>
    </div>
  );
};