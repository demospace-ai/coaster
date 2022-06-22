import classNames from 'classnames';
import React, { useState } from 'react';
import { SearchBar } from 'src/components/searchbar/SearchBar';
import { useDispatch, useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { Logout } from 'src/rpc/api';
import styles from './header.m.css';

export const Header: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);
  const user = useSelector(state => state.login.user);
  const [dropdownActive, setDropdownActive] = useState(false);
  const dispatch = useDispatch();
  const logout = async () => {
    await sendRequest(Logout);
    dispatch({
      type: 'login.logout',
    });
    setDropdownActive(false);
  };

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
        <div className={styles.profileIcon} onClick={() => setDropdownActive(!dropdownActive)}>{user!.first_name.charAt(0)}</div>
        <div className={classNames(styles.profileDropdown, dropdownActive ? null : styles.hidden)}>
          <div className={styles.dropdownItem}>My Profile</div>
          <div className={styles.dropdownItem} onClick={logout}>Logout</div>
        </div>
      </div>
    </>
  );
};