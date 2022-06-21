import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { Editor } from "src/components/editor/Editor";
import { Loading } from "src/components/loading/Loading";
import { useSearch, useSetResults } from "src/pages/search/actions";
import styles from "src/pages/search/search.m.css";
import { useSelector } from "src/root/model";

const doSearch = async (query: string, setLoading: (loading: boolean) => void, search: (query: string) => Promise<void>) => {
  await search(query);
  setLoading(false);
};

export const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q');
  const results = useSelector(state => state.search.results);
  const search = useSearch();
  const setResults = useSetResults();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // No query, no need to search
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    doSearch(query, setLoading, search);
  }, [search, setResults, query]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.resultsContainer}>
      <h1 className={styles.resultsTitle}>Results for "{query}"</h1>
      {results.length === 0 && <h3 className={styles.noResults}>No answers found!</h3>}
      <ul className={styles.results}>
        {results.map((result, index) => (
          <li key={index} className={styles.result}>
            <h3>
              <Link className={styles.postTitle} to={`/question/${result.id}`}>Q: {result.title}</Link>
            </h3>
            <div className={styles.postBody}>
              <Editor
                readonly={true}
                onChange={() => undefined}
                initialValue={JSON.parse(result.body)}
              />
            </div>
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
