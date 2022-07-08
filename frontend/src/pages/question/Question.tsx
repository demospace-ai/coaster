import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackButton, Button } from 'src/components/button/Button';
import { Display, Editor } from 'src/components/editor/Editor';
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
    createAnswer(id!, answerDraft, setLoading, setQuestionResponse);
  };

  return (
    <div className={styles.questionContainer}>
      <div className="tw-flex">
        <BackButton />
        <QuestionDropdown />
      </div>
      <div className={styles.question}>
        <div className="tw-text-2xl tw-my-5">{questionResponse!.question.title}</div>
        <div>
          {questionResponse!.question.body &&
            // The question might not actually have a body
            <Display
              initialValue={JSON.parse(questionResponse!.question.body)}
            />}
        </div>
      </div>
      {questionResponse!.answers.length > 0 &&
        <div className={styles.answersContainer}>
          {questionResponse!.answers.length === 1 && <div className="tw-text-lg tw-font-bold"> 1 Answer</div>}
          {questionResponse!.answers.length > 1 && <div className="tw-text-lg tw-font-bold">{questionResponse!.answers.length} Answers</div>}
          <ul className={styles.answers}>
            {questionResponse!.answers.map((answer, index) => (
              <li key={index} className={styles.answer}>
                <Display
                  initialValue={JSON.parse(answer.body)}
                />
              </li>
            ))}
          </ul>
        </div>
      }
      <div>
        {/* TODO: provide a way to tag someone. */}
        <Editor
          className={styles.answerInput}
          onChange={(remirrorJson) => { setAnswerDraft(JSON.stringify(remirrorJson)); }}
          placeholder="Leave an answer..."
        />
        <Button className={styles.answerButton} onClick={onCreateAnswer}>Post your answer</Button>
      </div>
    </div >
  );
};

const QuestionDropdown: React.FC = () => {
  return (
    <Menu as="div" className="tw-relative tw-inline-block tw-text-left tw-ml-auto">
      <div>
        <Menu.Button>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="black" className="hover:tw-fill-primary-highlight" >
            <circle cx="2.5" cy="7.5" r="1.5" fill="inherit" />
            <circle cx="12.5" cy="7.5" r="1.5" fill="inherit" />
            <circle cx="7.5" cy="7.5" r="1.5" fill="inherit" />
          </svg>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="tw-origin-top-right tw-absolute tw-right-0 tw-mt-2 tw-w-30 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                    'tw-block tw-px-4 tw-py-2 tw-text-sm', "tw-cursor-pointer"
                  )}
                >
                  Delete
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
