import React, { ReactNode, useEffect } from 'react';
import {
  BrowserRouter, Navigate, Outlet, Route, Routes
} from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Header } from 'src/components/header/Header';
import { Loading } from 'src/components/loading/Loading';
import { NavigationBar } from 'src/components/navigationBar/NavigationBar';
import { Home } from 'src/pages/home/Home';
import { Login } from 'src/pages/login/Login';
import { NewQuestion } from 'src/pages/newquestion/NewQuestion';
import { NotFound } from 'src/pages/notfound/NotFound';
import { Question } from 'src/pages/question/Question';
import { SearchResults } from 'src/pages/search/Search';
import { useSelector } from 'src/root/model';
import styles from './app.m.css';

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const start = useStart();

  useEffect(() => {
    start();
  }, [start]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<RequireAuth element={<Home />} />} />
          <Route path='/question/:id' element={<RequireAuth element={<Question />} />} />
          <Route path='/search' element={<RequireAuth element={<SearchResults />} />} />
          <Route path='/new' element={<RequireAuth element={<NewQuestion />} />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

type AuthenticationProps = {
  element: ReactNode;
};

const RequireAuth: React.FC<AuthenticationProps> = props => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization); // no organization set means user still needs to do this
  return (
    <>
      {isAuthenticated && organization ? props.element : <Navigate to="/login" replace />}
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