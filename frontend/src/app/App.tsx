import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Header } from 'src/components/header/Header';
import { Loading } from 'src/components/loading/Loading';
import { NavigationBar } from 'src/components/navigationBar/NavigationBar';
import { CustomQuery } from 'src/pages/customquery/CustomQuery';
import { Funnel } from 'src/pages/funnel/Funnel';
import { Inbox } from 'src/pages/inbox/Inbox';
import { Insights } from 'src/pages/insights/Insights';
import { Login } from 'src/pages/login/Login';
import { NotFound } from 'src/pages/notfound/NotFound';
import { WorkspaceSettings } from 'src/pages/workspacesettings/WorkspaceSettings';
import { useSelector } from 'src/root/model';
import styles from './app.m.css';

let needsInit = true;

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const start = useStart();
  const [title, setTitle] = useState<string | undefined>(undefined);

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
        <Route element={<AppLayout title={title} />}>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<RequireAuth element={<Inbox />} />} />
          <Route path='/workspacesettings' element={<RequireAuth element={<WorkspaceSettings />} />} />
          <Route path='/customquery/:id' element={<RequireAuth element={<CustomQuery setHeaderTitle={setTitle} />} />} />
          <Route path='/funnel/:id' element={<RequireAuth element={<Funnel setHeaderTitle={setTitle} />} />} />
          <Route path='/insights' element={<RequireAuth element={<Insights />} />} />
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

const AppLayout: React.FC<{ title: string | undefined; }> = ({ title }) => {
  return (
    <>
      <NavigationBar />
      <div className={styles.content}>
        <Header title={title} />
        <Outlet />
      </div>
    </>
  );
};