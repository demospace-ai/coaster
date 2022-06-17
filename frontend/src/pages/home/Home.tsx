import React from 'react';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const dateString = new Date().toLocaleDateString('en-us', { year: "numeric", month: "long", day: "numeric" });

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
    </div>
  );
};
