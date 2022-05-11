import React, { useState } from 'react';
import { useSelector } from 'src/root/model';
import { SearchComponent } from '../search/Search';
import styles from './home.m.css';

export const Home: React.FC = () => {
  const firstName = useSelector(state => state.login.firstName!);

  return (
    <div>
      <div className={styles.title}>
        Welcome, {firstName}!
      </div>
      <SearchComponent/>
    </div>
  );
}
