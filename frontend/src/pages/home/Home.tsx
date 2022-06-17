import React from 'react';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const dateString = new Date().toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric" });

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
      </div>
    </div>
  );
};
