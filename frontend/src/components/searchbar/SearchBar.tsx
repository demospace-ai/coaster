import React, { FormEvent, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './searchbar.m.css';

type SearchBarProps = {
};

export const SearchBar: React.FC<SearchBarProps> = props => {
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
          <path xmlns="http://www.w3.org/2000/svg" d="M16.5833 17.4791L11.1042 12C10.6875 12.3611 10.2014 12.6423 9.64583 12.8437C9.09028 13.0451 8.5 13.1458 7.875 13.1458C6.375 13.1458 5.10417 12.625 4.0625 11.5833C3.02083 10.5416 2.5 9.28468 2.5 7.81246C2.5 6.34024 3.02083 5.08329 4.0625 4.04163C5.10417 2.99996 6.36806 2.47913 7.85417 2.47913C9.32639 2.47913 10.5799 2.99996 11.6146 4.04163C12.6493 5.08329 13.1667 6.34024 13.1667 7.81246C13.1667 8.40968 13.0694 8.98607 12.875 9.54163C12.6806 10.0972 12.3889 10.618 12 11.1041L17.5 16.5625L16.5833 17.4791ZM7.85417 11.8958C8.97917 11.8958 9.9375 11.4965 10.7292 10.6979C11.5208 9.89926 11.9167 8.93746 11.9167 7.81246C11.9167 6.68746 11.5208 5.72565 10.7292 4.92704C9.9375 4.12843 8.97917 3.72913 7.85417 3.72913C6.71528 3.72913 5.74653 4.12843 4.94792 4.92704C4.14931 5.72565 3.75 6.68746 3.75 7.81246C3.75 8.93746 4.14931 9.89926 4.94792 10.6979C5.74653 11.4965 6.71528 11.8958 7.85417 11.8958Z" />
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
