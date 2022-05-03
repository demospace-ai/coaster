import classNames from 'classnames';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'src/root/model';
import { Login } from '../login/Login';
import { Modal } from '../modal/Modal';
import styles from "./header.m.css";

export const Header: React.FC = () => {
  const [ showLoginModal, setShowLoginModal ] = useState(false);
  const isAuthenticated = useSelector(state => state.login.authenticated);

  return (
    <>
    <div className={styles.headerContainer}>
      <div>
        <Link className={classNames(styles.route, styles.padRight)} to={"/"}>Home</Link>
      </div>
      <div >
        <div className={styles.rightNavWrapper}>
          {isAuthenticated ? (
            <h1>Account</h1>
          ): (
            <button type="button" className={styles.loginButton} onClick={()=>setShowLoginModal(true)}>Login</button>
          )}
        </div>
      </div>
    </div>
    <Modal show={showLoginModal} close={()=>setShowLoginModal(false)}>
        <Login closeModal={()=>setShowLoginModal(false)}/>
    </Modal>
  </>
  );
};