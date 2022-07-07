import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from 'src/components/loading/Loading';
import { sendRequest } from 'src/rpc/ajax';
import { GetAllQuestions, Post } from 'src/rpc/api';
import styles from './allquestions.m.css';

const fetchQuestions = async (setQuestions: (questions: Post[]) => void, setLoading: (loading: boolean) => void) => {
  const results = await sendRequest(GetAllQuestions);
  setQuestions(results.questions);
  setLoading(false);
};

export const AllQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Post[]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchQuestions(setQuestions, setLoading);
  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.contentContainer}>
        {loading ? <Loading className={styles.loading} /> : (
          <ul className={styles.questionList}>
            {questions!.map((question, index) =>
              <li key={index} className={styles.questionListItem} onClick={() => navigate(`/question/${question.id}`)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '10px' }}>
                  <path d="M9.04168 14.6876L13.8125 9.91675L13 9.10425L9.04168 13.0626L6.89584 10.9167L6.08334 11.7292L9.04168 14.6876ZM4.58334 18.3334C4.25001 18.3334 3.95834 18.2084 3.70834 17.9584C3.45834 17.7084 3.33334 17.4167 3.33334 17.0834V2.91675C3.33334 2.58341 3.45834 2.29175 3.70834 2.04175C3.95834 1.79175 4.25001 1.66675 4.58334 1.66675H12.1042L16.6667 6.22925V17.0834C16.6667 17.4167 16.5417 17.7084 16.2917 17.9584C16.0417 18.2084 15.75 18.3334 15.4167 18.3334H4.58334ZM11.4792 6.79175V2.91675H4.58334V17.0834H15.4167V6.79175H11.4792ZM4.58334 2.91675V6.79175V2.91675V17.0834V2.91675Z" fill="black" />
                </svg>
                <div className={styles.questionTitle}>
                  {question.title}
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
