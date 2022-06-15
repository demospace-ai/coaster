import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const firstName = useSelector(state => state.login.firstName);
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const navigate = useNavigate();

  const dateString = new Date().toLocaleDateString('en-us', { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  });

  return (
    <div className={styles.home}>
      <div className={styles.pageTitle}>
        Home
      </div>
      <div className={styles.date}>
        {dateString}
      </div>
      <div className={styles.title}>
        Welcome, {firstName}!
      </div>
    </div>
  );
};
