import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Header } from 'src/components/header/Header';
import { Loading } from 'src/components/loading/Loading';
import { NavigationBar } from 'src/components/navigationBar/NavigationBar';
import { Inbox } from 'src/pages/inbox/Inbox';
import { Login } from 'src/pages/login/Login';
import { NotFound } from 'src/pages/notfound/NotFound';
import { Team } from 'src/pages/team/Team';
import { useSelector } from 'src/root/model';
import styles from './app.m.css';

let needsInit = true;

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const start = useStart();

  useEffect(() => {
    // Recommended way to run one-time initialization: https://beta.reactjs.org/learn/you-might-not-need-an-effect#initializing-the-application
    if (needsInit) {
      start();
      needsInit = false;
    }
  }, [start]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<RequireAuth element={<Inbox />} />} />
          <Route path='/team' element={<RequireAuth element={<Team />} />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

type AuthenticationProps = {
  element: ReactNode;
};

const RequireAuth: React.FC<AuthenticationProps> = props => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  return (
    <>
      {isAuthenticated ? props.element : <Navigate to="/login" replace />}
    </>
  );
};

const AppLayout: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <div className={styles.content}>
        <Header />
        <Outlet />
      </div>
    </>
  );
};