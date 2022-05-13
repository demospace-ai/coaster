import React, { FormEvent, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './search.m.css';

export const SearchBar: React.FC = () => {
  const [params, setSearchParams] = useSearchParams();
  const queryFromParams = params.get('q') ? params.get('q')! : '';
  const [query, setQuery] = useState(queryFromParams);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
    navigate({ pathname: '/search', search: createSearchParams({ 'q': query }).toString() });
  };

  return (
    <form className={styles.searchBar} onSubmit={onSubmit}>
      <span className={styles.searchIconContainer}>
        <svg className={styles.searchIcon}>
          <path d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'></path>
        </svg>
      </span>
      <input
        className={styles.searchInput}
        type='text'
        id='question-search'
        placeholder='Find an answer...'
        onChange={e => setQuery(e.target.value)}
        value={query}
      />
    </form>
  );
};
