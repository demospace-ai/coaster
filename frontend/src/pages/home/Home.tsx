import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from 'src/components/search/Search';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const firstName = useSelector(state => state.login.firstName);
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  });

  return (
    <div className={styles.home}>
      <div className={styles.title}>
        Welcome, {firstName}!
      </div>
      <div className={styles.searchContainer}>
        <SearchBar />
      </div>
    </div>
  );
};
