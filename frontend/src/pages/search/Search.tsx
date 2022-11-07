import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useSearch, useSetResults } from "src/pages/search/actions";
import styles from "src/pages/search/search.m.css";
import { useSelector } from "src/root/model";
import { Analysis, AnalysisType } from "src/rpc/api";

export const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q');
  const results = useSelector(state => state.search.results);
  const search = useSearch();
  const setResults = useSetResults();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    // No query, no need to search
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    search(query).then(() => {
      if (!ignore) {
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [search, setResults, query]);

  if (loading) {
    return <Loading />;
  }

  const getAnalysisLink = (analysis: Analysis) => {
    switch (analysis.analysis_type) {
      case AnalysisType.CustomQuery:
        return `/customquery/${analysis.id}`;
      case AnalysisType.Funnel:
        return `/funnel/${analysis.id}`;
      case AnalysisType.Trend:
        return `/trend/${analysis.id}`;
    }
  };

  return (
    <div className="tw-overflow-scroll">
      <div className={styles.resultsContainer}>
        <div className={styles.resultsTitle}>Results for "{query}"</div>
        {results.length === 0 && <h3 className={styles.noResults}>No answers found!</h3>}
        <ul className={styles.results}>
          {results.map((result, index) => (
            <li key={index} className={styles.result} >
              <div className={styles.postTitleContainer}>
                <Link className="tw-text-left tw-block hover:tw-text-gray-800" to={getAnalysisLink(result)}>Q: {result.title}</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};