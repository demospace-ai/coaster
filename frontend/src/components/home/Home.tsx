import React from 'react';
import styles from './home.m.css';

export const Home: React.FC = () => {
  return (
    <div>
      <div className={styles.title}>
        Welcome to Fabra!
      </div>
      <SearchBar/>
    </div>
  );
}

const SearchBar = () => (
  <div className={styles.body}>
    <form action="/" method="get">
        <input
            type="text"
            id="question-search"
            placeholder="Find an answer"
        />
        <button type="submit">Search</button>
    </form>
  </div>
);