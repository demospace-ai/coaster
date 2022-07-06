import React from 'react';
import styles from './inbox.m.css';

export const Inbox: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.inboxList}>
      </div>
      <div className={styles.inboxBody}>
        <div className={styles.inboxBodyPlaceholder}>
          No unread notifications
        </div>
      </div>
    </div>
  );
};
