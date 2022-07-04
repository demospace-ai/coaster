import React from 'react';
import { Link } from 'react-router-dom';
import { Loading } from 'src/components/loading/Loading';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const assignedQuestions = useSelector(state => state.login.assignedQuestions);
  const dateString = new Date().toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric" });

  const loading = assignedQuestions === undefined;

  return (
    <div className={styles.home}>
      <div className={styles.pageTitle}>
        Home
      </div>
      <div className={styles.date}>
        {dateString}
      </div>
      <div className={styles.title}>
        Welcome, {user!.first_name}!
      </div>
      <div className={styles.tasksContainer}>
        <div className={styles.tasksHeaderContainer}>
          <div className={styles.tasksTitle}>My Tasks</div>
          <div>
            <div className={styles.tasksSubtitle}>Upcoming</div>
            <div className={styles.tasksSubtitle}>Overdue</div>
            <div className={styles.tasksSubtitle}>Completed</div>
          </div>
        </div>
        <div className={styles.tasksContentContainer}>
          {loading ? <Loading className={styles.loading} /> : (
            <ul>
              {assignedQuestions.map((question, index) =>
                <li key={index} className={styles.questionListItem}>
                  <Link className={styles.questionLink} to={`/question/${question.id}`}>{question.title}</Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
