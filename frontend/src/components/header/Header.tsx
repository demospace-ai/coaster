import classNames from 'classnames';
import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { Logout } from 'src/rpc/api';
import styles from './header.m.css';

type HeaderProps = {
  searchBar?: boolean;
};

export const Header: React.FC<HeaderProps> = props => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const dispatch = useDispatch();
  const isHome = useMatch('/'); // Don't render search bar in header for home page
  const logout = async () => {
    await sendRequest(Logout);
    dispatch({
      type: 'login.logout',
    });
  };

  // No header whatsoever for login page
  if (!isAuthenticated) {
    return <></>;
  };

  return (
    <>
      <div className={styles.headerContainer}>
        <div>
          <Link className={classNames(styles.route, styles.padRight)} to={'/'}>Home</Link>
        </div>
        <div >
          <div className={styles.rightNavWrapper}>
            <div className={styles.route} onClick={logout}>Logout</div>
          </div>
        </div>
      </div>
    </>
  );
};