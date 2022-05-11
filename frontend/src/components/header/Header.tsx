import classNames from 'classnames';
import React, { useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Login } from 'src/components/login/Login';
import { Modal } from 'src/components/modal/Modal';
import { useSelector } from 'src/root/model';
import styles from './header.m.css';

type HeaderProps = {
  searchBar?: boolean;
}

export const Header: React.FC<HeaderProps> = props => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const isHome = useMatch('/'); // don't render search bar in header for home page

  return (
    <>
      {isHome ? <div>Hello</div> : <div>Bye</div>}
      <div className={styles.headerContainer}>
        <div>
          <Link className={classNames(styles.route, styles.padRight)} to={'/'}>Home</Link>
        </div>
        <div >
          <div className={styles.rightNavWrapper}>
            {isAuthenticated ? (
              <div className={styles.route}>My Account</div>
            ) : (
              <Button onClick={() => setShowLoginModal(true)}>Login</Button>
            )}
          </div>
        </div>
      </div>
      <Modal show={showLoginModal} close={() => setShowLoginModal(false)}>
        <Login closeModal={() => setShowLoginModal(false)} />
      </Modal>
    </>
  );
};