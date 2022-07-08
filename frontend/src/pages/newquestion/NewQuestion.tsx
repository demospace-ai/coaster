import { Combobox, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Editor } from 'src/components/editor/Editor';
import { Loading } from 'src/components/loading/Loading';
import { useDispatch, useSelector } from 'src/root/model';
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

type NewQuestionState = {
  loading: boolean;
  createQuestionResponse?: CreateQuestionResponse;
  titleDraft: string;
  questionDraft: string;
  assignee?: User;
};

export const NewQuestion: React.FC = () => {
  let navigate = useNavigate();
  const [state, setState] = useState<NewQuestionState>({
    loading: false,
    titleDraft: "",
    questionDraft: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (state.createQuestionResponse) {
      navigate('/question/' + state.createQuestionResponse.question.id);
      dispatch({ type: 'showNewQuestionModal', showNewQuestionModal: false });
      setState({
        loading: false,
        titleDraft: "",
        questionDraft: "",
      });
    }
  }, [dispatch, navigate, state, setState]);

  if (state.loading) {
    return (
      <div style={{ width: "200px", height: "100px" }}>
        <Loading style={{ position: "inherit", margin: "auto", marginTop: "20px" }} />
      </div>
    );
  }

  const onCreateQuestion = () => {
    if (!state.titleDraft || state.titleDraft.length === 0) {
      // TODO: show toast here
      return;
    }

    const setLoading = (loading: boolean) => {
      setState({ ...state, loading });
    };

    const setCreateQuestionResponse = (createQuestionResponse: CreateQuestionResponse) => {
      setState({ ...state, createQuestionResponse });
    };

    createQuestion(state.titleDraft, state.questionDraft, state.assignee, setLoading, setCreateQuestionResponse);
  };

  return (
    <>
      <div className={styles.questionContainer}>
        <input
          className={styles.titleContainer}
          onChange={e => { setState({ ...state, titleDraft: e.target.value }); }}
          placeholder={"Question Title"}
          autoFocus
        />
        <Editor
          className={styles.bodyContainer}
          onChange={(remirrorJson) => setState({ ...state, questionDraft: JSON.stringify(remirrorJson) })}
          placeholder="Add description..."
        />
        <AssigneeInput assignee={state.assignee} setAssignee={(assignee: User) => { setState({ ...state, assignee: assignee }); }} />
      </div>
      <div className={styles.submitContainer}>
        <Button className={styles.submitQuestionButton} onClick={onCreateQuestion}>Submit</Button>
      </div>
    </>
  );
};

type AssigneeInputProps = {
  assignee: User | undefined,
  setAssignee: (user: User) => void;
};

const AssigneeInput: React.FC<AssigneeInputProps> = props => {
  const [inputValue, setInputValue] = useState('');
  const users = useSelector(state => state.login.users);
  const usersList = users ? users : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredUsers =
    inputValue === ''
      ? usersList
      : usersList.filter((user) =>
        (user.first_name + ' ' + user.last_name)
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(inputValue.toLowerCase().replace(/\s+/g, ''))
      );

  return (
    <div className="tw-top-10 tw-w-fit">
      <Combobox value={props.assignee} onChange={props.setAssignee} nullable>
        <div className="tw-relative tw-mt-1">
          <Combobox.Button as="div" className="tw-relative tw-w-full tw-cursor-default tw-overflow-hidden tw-rounded-lg tw-bg-hover tw-text-left sm:tw-text-sm tw-flex hover:tw-bg-dark-hover focus-within:tw-bg-dark-hover">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="tw-m-auto tw-ml-2">
              <path d="M9.99996 1.66663C5.39996 1.66663 1.66663 5.39996 1.66663 9.99996C1.66663 14.6 5.39996 18.3333 9.99996 18.3333C14.6 18.3333 18.3333 14.6 18.3333 9.99996C18.3333 5.39996 14.6 1.66663 9.99996 1.66663ZM6.12496 15.4166C7.21663 14.6333 8.54996 14.1666 9.99996 14.1666C11.45 14.1666 12.7833 14.6333 13.875 15.4166C12.7833 16.2 11.45 16.6666 9.99996 16.6666C8.54996 16.6666 7.21663 16.2 6.12496 15.4166ZM15.1166 14.2666C13.7083 13.1666 11.9333 12.5 9.99996 12.5C8.06663 12.5 6.29163 13.1666 4.88329 14.2666C3.91663 13.1083 3.33329 11.625 3.33329 9.99996C3.33329 6.31663 6.31663 3.33329 9.99996 3.33329C13.6833 3.33329 16.6666 6.31663 16.6666 9.99996C16.6666 11.625 16.0833 13.1083 15.1166 14.2666Z" fill="#696969" />
              <path d="M9.99992 5C8.39159 5 7.08325 6.30833 7.08325 7.91667C7.08325 9.525 8.39159 10.8333 9.99992 10.8333C11.6083 10.8333 12.9166 9.525 12.9166 7.91667C12.9166 6.30833 11.6083 5 9.99992 5ZM9.99992 9.16667C9.30825 9.16667 8.74992 8.60833 8.74992 7.91667C8.74992 7.225 9.30825 6.66667 9.99992 6.66667C10.6916 6.66667 11.2499 7.225 11.2499 7.91667C11.2499 8.60833 10.6916 9.16667 9.99992 9.16667Z" fill="#696969" />
            </svg>
            <Combobox.Input
              ref={inputRef}
              className="tw-w-36 tw-border-none tw-py-1 tw-pl-2 tw-pr-0 tw-text-sm tw-leading-5 tw-text-dark-text focus:tw-outline-none tw-bg-transparent placeholder:tw-text-dark-text"
              displayValue={(user: User) => user ? user.first_name + ' ' + user.last_name : ""}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Assigned owner"
            />
          </Combobox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              setInputValue('');
              if (inputRef.current) {
                inputRef.current.blur();
              }
            }}
          >
            <Combobox.Options className="tw-absolute tw-mt-1 tw-max-h-60 tw-w-48 tw-shadow-md tw-overflow-auto tw-rounded-md tw-bg-white">
              <Combobox.Option
                key={-1}
                className={({ active }) =>
                  `tw-relative tw-cursor-default tw-select-none tw-py-1 tw-px-4 ${active ? ' tw-bg-hover' : ''}`
                }
                value={undefined}
              >
                <span className="tw-block tw-truncate">
                  Unassigned
                </span>
              </Combobox.Option >
              {
                filteredUsers.map((user) => (
                  <Combobox.Option
                    key={user.id}
                    className={({ active }) =>
                      `tw-relative tw-cursor-default tw-select-none tw-py-1 tw-px-4 ${active ? ' tw-bg-hover' : ''}`
                    }
                    value={user}
                  >
                    <span className="tw-block tw-truncate">
                      {user ? user.first_name + ' ' + user.last_name : "Unassigned"}
                    </span>
                  </Combobox.Option >
                ))
              }
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox >
    </div >
  );
};