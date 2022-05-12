import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { sendRequest } from 'src/rpc/ajax';
import { Post, Search } from 'src/rpc/api';
import styles from './search.m.css';


export const SearchComponent: React.FC = () => {
  // TODO: no need for redux here
  const [results, setResults] = useState<Post[] | undefined>(undefined);

  return (
    <div className={styles.search}>
      <SearchBar setResults={setResults} />
      <SearchResults results={results} />
    </div>
  );
};

const search = async (query: string, setLoading: (loading: boolean) => void, setResults: (results: Post[]) => void) => {
  const payload = { 'search_query': query };
  try {
    setLoading(true);
    const response = await sendRequest(Search, payload);
    setResults(response.posts);
  } catch (e) {
  }
};

type SearchBarProps = {
  setResults: (results: Post[]) => void;
};

const SearchBar: React.FC<SearchBarProps> = props => {
  const [query, setQuery] = useState('');
  const [, setLoading] = useState(true);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await search(query, setLoading, props.setResults);
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
      />
    </form>
  );
};

type SearchResultsProps = {
  results?: Post[];
};

const SearchResults: React.FC<SearchResultsProps> = props => {
  const navigate = useNavigate();

  if (props.results === undefined) {
    return <></>;
  }

  return (
    <div>
      <h2>Results</h2>
      {props.results.length === 0 && <h3 className={styles.noResults}>No answers found!</h3>}
      <ul className={styles.results}>
        {props.results.map((result, index) => (
          <li key={index} className={styles.result}>
            <h3>
              <Link className={styles.postTitle} to={`/question/${result.id}`}>Q: {result.title}</Link>
            </h3>
            <div className={styles.postBody}>{result.body}</div>
          </li>
        ))}
      </ul>
      <div className={styles.newQuestionPrompt}>
        <h3>Not finding what you're looking for?</h3>
        <Button className={styles.newQuestionButton} onClick={() => { navigate('/new'); }}>Ask a question</Button>
      </div>
    </div>
  );
};

