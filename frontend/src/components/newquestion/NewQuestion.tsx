import MDEditor, { codeEdit, codePreview } from "@uiw/react-md-editor";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { CreateQuestion, CreateQuestionResponse } from "src/rpc/api";
import { sendRequest } from "src/rpc/ajax";
import styles from "./newquestion.m.css";


const createQuestion = async (questionTitle: string, questionBody: string, setLoading: (loading: boolean) => void, setCreateQuestionResponse: (question: CreateQuestionResponse) => void) => {
  setLoading(true);
  const payload = {"question_title": questionTitle, "question_body": questionBody};
  try {
    const createQuestionResponse = await sendRequest(CreateQuestion, payload);
    setCreateQuestionResponse(createQuestionResponse);
  } catch (e) {
  }
}

export const NewQuestion: React.FC = () => {
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const [createQuestionResponse, setCreateQuestionResponse] = useState<CreateQuestionResponse | undefined>(undefined);
  const [titleDraft, setTitleDraft] = useState<string>('');
  const [bodyDraft, setBodyDraft] = useState<string>('');

  if (createQuestionResponse) {
    history.replace("/question/" + createQuestionResponse.question.id);
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}/>
      </div>
    )
  }

  const onCreateQuestion = () => {
    createQuestion(titleDraft, bodyDraft, setLoading, setCreateQuestionResponse);
  }

  return (
    <div className={styles.questionContainer}>
      <div style={{paddingBottom: "20px"}}>Question Title</div>
      <div className={styles.titleContainer}>
        <MDEditor
          value={titleDraft}
          onChange={(value) => {setTitleDraft(value!)}}
          extraCommands={[codeEdit, codePreview]}
          preview={'edit'}
          overflow={false}
          enableScroll={false}
          hideToolbar={true}
          height={70}
          textareaProps={{className: styles.noResize}}
        />
      </div>
      <div style={{paddingBottom: "20px"}}>Question Content</div>
      <div className={styles.bodyContainer}>
        <MDEditor
          value={bodyDraft}
          onChange={(value) => {setBodyDraft(value!)}}
          extraCommands={[codeEdit, codePreview]}
          preview={'edit'}
          height={300}
          textareaProps={{className: styles.noResize}}
        />
      </div>
      <button className={styles.submitAnswerButton} onClick={onCreateQuestion}>Ask your question</button>
    </div>
  )
}