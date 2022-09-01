import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";
import { Button } from "src/components/button/Button";
import { Display } from "src/components/editor/Editor";
import { Loading } from "src/components/loading/Loading";
import { useSearch, useSetResults } from "src/pages/search/actions";
import styles from "src/pages/search/search.m.css";
import { useDispatch, useSelector } from "src/root/model";

export const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q');
  const results = useSelector(state => state.search.results);
  const search = useSearch();
  const setResults = useSetResults();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const showNewQuestionModal = () => {
    dispatch({ type: "showNewQuestionModal", showNewQuestionModal: true });
  };

  useEffect(() => {
    // No query, no need to search
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    search(query).then(() => {
      setLoading(false);
    });
  }, [search, setResults, query]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="tw-overflow-scroll">
      <div className={styles.resultsContainer}>
        <div className={styles.resultsTitle}>Results for "{query}"</div>
        {results.length === 0 && <h3 className={styles.noResults}>No answers found!</h3>}
        <ul className={styles.results}>
          {results.map((result, index) => (
            <li key={index} className={styles.result} >
              <div className={styles.postTitleContainer}>
                <Link className={styles.postTitle} to={`/question/${result.id}`}>Q: {result.title}</Link>
              </div>
              {result.body &&
                <div className={styles.postBody}>
                  <Display
                    value={toPlaintext(JSON.parse(result.body)).trim()}
                  />
                </div>
              }
            </li>
          ))}
        </ul>
        <div className={styles.newQuestionPrompt}>
          <div className="tw-text-lg tw-my-auto tw-font-semibold">Not finding what you're looking for?</div>
          <Button className={styles.newQuestionButton} onClick={showNewQuestionModal}>Ask a question</Button>
        </div>
      </div>
    </div>
  );
};

const toPlaintext = (json: RemirrorJSON) => {
  let plaintext = '';

  if (['paragraph', 'heading'].includes(json.type)) {
    plaintext += ' ';
  }

  if (json.content) {
    plaintext += json.content?.map((innerJson) => {
      let innerPlaintext = '';
      if (innerJson.text) {
        innerPlaintext += innerJson.text;
      }

      if (innerJson.content) {
        innerPlaintext += toPlaintext(innerJson);
      }

      return innerPlaintext;
    }).join('');
  }

  return plaintext;
};
