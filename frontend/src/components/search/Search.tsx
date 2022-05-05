import React, { FormEvent, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { sendRequest } from "src/rpc/ajax";
import { Post, Search } from "src/rpc/api";
import styles from './search.m.css';


export const SearchComponent: React.FC = () => {
  // TODO: no need for redux here
  const [results, setResults] = useState<Post[] | undefined>(undefined);

  return (
    <div className={styles.search}>
      <SearchBar setResults={setResults}/>
      <SearchResults results={results}/>
    </div>
  )
}

const search = async (query: string, setLoading: (loading: boolean) => void, setResults: (results: Post[]) => void) => {
    const payload = {"search_query": query};
    try {
      setLoading(true);
      const response = await sendRequest(Search, payload);
      setResults(response.posts);
    } catch (e) {
    }
};

type SearchBarProps = {
  setResults: (results: Post[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = props => {
  const [ query, setQuery ] = useState("");
  const [loading, setLoading] = useState(true);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await search(query, setLoading, props.setResults);
  }

  return (
    <form className={styles.searchBar} onSubmit={onSubmit}>
        <input
            type="text"
            className={styles.searchInput}
            id="question-search"
            placeholder="Find an answer"
            onChange={e => setQuery(e.target.value)}
        />
        <button className={styles.searchButton} type="submit">Search</button>
    </form>
  )
};

type SearchResultsProps = {
  results?: Post[];
}

const SearchResults: React.FC<SearchResultsProps> = props => {
  const history = useHistory();

  if (props.results === undefined) {
    return <></>
  }

  return (
    <div>
      <h2>Results</h2>
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
        <button className={styles.newQuestionButton} onClick={() => {history.push("/new")}}>Ask a question</button>
      </div>
    </div>
  );
};
  
  