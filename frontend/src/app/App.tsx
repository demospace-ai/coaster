import React, { useEffect } from 'react';
import {
  BrowserRouter, Outlet, Route, Routes
} from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Header } from 'src/components/header/Header';
import { Loading } from 'src/components/loading/Loading';
import { Home } from 'src/pages/home/Home';
import { Login } from 'src/pages/login/Login';
import { NewQuestion } from 'src/pages/newquestion/NewQuestion';
import { NotFound } from 'src/pages/notfound/NotFound';
import { Question } from 'src/pages/question/Question';
import { SearchResults } from 'src/pages/search/Search';
import { useSelector } from 'src/root/model';

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
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/question/:id' element={<Question />} />
          <Route path='/search' element={<SearchResults />} />
          <Route path='/new' element={<NewQuestion />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const AppLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};