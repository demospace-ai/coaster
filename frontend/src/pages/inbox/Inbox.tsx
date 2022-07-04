import React from 'react';
import { useSelector } from 'src/root/model';
import styles from './inbox.m.css';

export const Inbox: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const dateString = new Date().toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className={styles.home}>
      <div className={styles.pageTitle}>
        Inbox
      </div>
      <div className={styles.date}>
        {dateString}
      </div>
      <div className={styles.title}>
        Welcome, {user!.first_name}!
      </div>
      <div className={styles.inboxBody}>
        No unread notifications
      </div>
    </div>
  );
};
