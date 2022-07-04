import React from 'react';
import styles from './notfound.m.css';

export const NotFound: React.FC = () => {
  return (
    <>
      <div className={styles.title}>
        <h1>Not Found!</h1>
      </div>
      <div className={styles.body}>
      </div>
    </>
  );
};