import React from 'react';
import { SearchComponent } from 'src/components/search/Search';
import { useSelector } from 'src/root/model';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const firstName = useSelector(state => state.login.firstName!);

  return (
    <div>
      <div className={styles.title}>
        Welcome, {firstName}!
      </div>
      <SearchComponent />
    </div>
  );
}
