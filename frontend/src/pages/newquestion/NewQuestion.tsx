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
    if (titleDraft.length === 0) {
      // TODO: show toast here
      return;
    }

    createQuestion(titleDraft, questionDraft, assignee, setLoading, setCreateQuestionResponse);
  };

  return (
    <>
      <div className={styles.questionContainer}>
        <input
          className={styles.titleContainer}
          onChange={e => { setTitleDraft(e.target.value); }}
          placeholder={"Question Title"}
          autoFocus
        />
        <Editor
          className={styles.bodyContainer}
          onChange={(remirrorJson) => setQuestionDraft(JSON.stringify(remirrorJson))}
          placeholder="Add description..."
        />
        <AssigneeInput setAssignee={setAssignee} />
      </div>
      <div className={styles.submitContainer}>
        <Button className={styles.submitQuestionButton} onClick={onCreateQuestion}>Submit</Button>
      </div>
    </>
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
          width: "160px",
          "& .MuiAutocomplete-input": {
            background: "none",
            outline: "none",
            border: "none",
            height: "100%",
            width: "100%",
            fontSize: "14px",
            "box-sizing": "border-box",
            "padding-left": "5px",
            cursor: "pointer",
          },
          "& .MuiAutocomplete-input:focus": {
            cursor: "text",
          },
          "& .MuiAutocomplete-input::placeholder": {
            marginTop: "-1px",
            fontSize: "14px",
            color: "#696969",
          },
        }}
        inputValue={inputValue}
        onInputChange={(_event, newValue, _reason) => setInputValue(newValue)}
        onChange={(_event, value, _reason) => {
          if (value) {
            props.setAssignee(value);
          }
        }}
        renderInput={(props) => (
          <div className={styles.assigneeContainer} ref={props.InputProps.ref}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: "auto", marginLeft: "5px" }}>
              <path d="M9.99996 1.66663C5.39996 1.66663 1.66663 5.39996 1.66663 9.99996C1.66663 14.6 5.39996 18.3333 9.99996 18.3333C14.6 18.3333 18.3333 14.6 18.3333 9.99996C18.3333 5.39996 14.6 1.66663 9.99996 1.66663ZM6.12496 15.4166C7.21663 14.6333 8.54996 14.1666 9.99996 14.1666C11.45 14.1666 12.7833 14.6333 13.875 15.4166C12.7833 16.2 11.45 16.6666 9.99996 16.6666C8.54996 16.6666 7.21663 16.2 6.12496 15.4166ZM15.1166 14.2666C13.7083 13.1666 11.9333 12.5 9.99996 12.5C8.06663 12.5 6.29163 13.1666 4.88329 14.2666C3.91663 13.1083 3.33329 11.625 3.33329 9.99996C3.33329 6.31663 6.31663 3.33329 9.99996 3.33329C13.6833 3.33329 16.6666 6.31663 16.6666 9.99996C16.6666 11.625 16.0833 13.1083 15.1166 14.2666Z" fill="#696969" />
              <path d="M9.99992 5C8.39159 5 7.08325 6.30833 7.08325 7.91667C7.08325 9.525 8.39159 10.8333 9.99992 10.8333C11.6083 10.8333 12.9166 9.525 12.9166 7.91667C12.9166 6.30833 11.6083 5 9.99992 5ZM9.99992 9.16667C9.30825 9.16667 8.74992 8.60833 8.74992 7.91667C8.74992 7.225 9.30825 6.66667 9.99992 6.66667C10.6916 6.66667 11.2499 7.225 11.2499 7.91667C11.2499 8.60833 10.6916 9.16667 9.99992 9.16667Z" fill="#696969" />
            </svg>
            <input type="text" {...props.inputProps} placeholder="Assigned owner" />
          </div>
        )}
      />
    </>
  );
};