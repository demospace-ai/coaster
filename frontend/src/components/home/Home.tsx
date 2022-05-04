import React, { useState } from 'react';
import { Search } from '../search/Search';
import styles from './home.m.css';

export const Home: React.FC = () => {
  return (
    <div>
      <div className={styles.title}>
        Welcome to Fabra!
      </div>
      <Search/>
    </div>
  );
}
