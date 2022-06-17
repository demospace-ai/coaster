import React from 'react';
import { SearchBar } from 'src/components/searchbar/SearchBar';
import { useSelector } from 'src/root/model';
import styles from './header.m.css';

export const Header: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);
  const user = useSelector(state => state.login.user);

  // No header whatsoever for login and home page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.searchBarContainer}>
          <SearchBar />
        </div>
        <div className={styles.profileIcon}>{user!.first_name.charAt(0)}</div>
      </div>
    </>
  );
};