import React from 'react';
import styles from './notfound.m.css';

export const NotFound: React.FC = () => {
  return (
    <>
      <div className={styles.title}>
        <div>Not Found!</div>
      </div>
      <div className={styles.body}>
      </div>
    </>
  );
};