import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Editor } from 'src/components/editor/Editor';
import { Loading } from 'src/components/loading/Loading';
import { useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { CreateQuestion, CreateQuestionRequest, CreateQuestionResponse, User } from 'src/rpc/api';
import styles from './newquestion.m.css';



const createQuestion = async (
  questionTitle: string,
  questionBody: string,
  assignee: User | undefined,
  setLoading: (loading: boolean) => void,
  setCreateQuestionResponse: (question: CreateQuestionResponse) => void,
) => {
  setLoading(true);
  const payload: CreateQuestionRequest = { 'question_title': questionTitle, 'question_body': questionBody };
  if (assignee) {
    payload.assigned_user_id = assignee.id;
  }

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
  const [questionDraft, setQuestionDraft] = useState<string>('');
  const [assignee, setAssignee] = useState<User>();

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
    createQuestion(titleDraft, questionDraft, assignee, setLoading, setCreateQuestionResponse);
  };

  return (
    <div className={styles.questionContainer}>
      <div style={{ paddingBottom: '20px' }}>Question Title</div>
      <input
        className={styles.titleContainer}
        onChange={e => { setTitleDraft(e.target.value); }}
        autoFocus
      />
      <div style={{ paddingBottom: '20px' }}>Question Content</div>
      <Editor
        className={styles.bodyContainer}
        onChange={(remirrorJson) => setQuestionDraft(JSON.stringify(remirrorJson))}
      />
      <div style={{ paddingBottom: '20px' }}>Assigned Owner</div>
      <AssigneeInput setAssignee={setAssignee} />
      <Button className={styles.submitQuestionButton} onClick={onCreateQuestion}>Submit</Button>
    </div>
  );
};

type AssigneeInputProps = {
  setAssignee: (user: User) => void;
};

const AssigneeInput: React.FC<AssigneeInputProps> = props => {
  const [inputValue, setInputValue] = useState('');
  const users = useSelector(state => state.login.users);

  return (
    <>
      <Autocomplete
        options={users ? users : []}
        getOptionLabel={(user: User) => user.first_name + ' ' + user.last_name}
        id="auto-highlight"
        autoHighlight
        sx={{
          height: "40px",
          width: "100%",
          "& .MuiAutocomplete-input": {
            background: "none",
            outline: "none",
            border: "none",
            height: "100%",
            width: "100%",
            "box-sizing": "border-box",
            "padding-left": "10px",
          },
        }}
        onMouseDownCapture={(e) => { if (inputValue.length === 0) { e.stopPropagation(); } }}
        inputValue={inputValue}
        onInputChange={(_event, newValue, _reason) => setInputValue(newValue)}
        onChange={(_event, value, _reason) => {
          if (value) {
            props.setAssignee(value);
          }
        }}
        renderInput={(props) => (
          <div className={styles.assigneeContainer} ref={props.InputProps.ref}>
            <input type="text" {...props.inputProps} />
          </div>
        )}
      />
    </>
  );
};