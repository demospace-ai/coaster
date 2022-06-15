import React from 'react';
import { SearchBar } from 'src/components/searchbar/SearchBar';
import { useSelector } from 'src/root/model';
import styles from './header.m.css';

export const Header: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const firstName = useSelector(state => state.login.firstName);

  // No header whatsoever for login and home page
  if (!isAuthenticated) {
    return <></>;
  };

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.searchBarContainer}>
          <SearchBar />
        </div>
        <div className={styles.profileIcon}>{firstName ? firstName.charAt(0) : null}</div>
      </div>
    </>
  );
};