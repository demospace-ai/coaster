import React, { useEffect } from 'react';
import {
  BrowserRouter, Outlet, Route, Routes
} from 'react-router-dom';
import { useStart } from 'src/components/app/actions';
import { Header } from 'src/components/header/Header';
import { Home } from 'src/components/home/Home';
import { NewQuestion } from 'src/components/newquestion/NewQuestion';
import { NotFound } from 'src/components/notfound/NotFound';
import { Question } from 'src/components/question/Question';
import { useSelector } from 'src/root/model';

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const start = useStart();

  useEffect(() => {
    start();
  }, [start]);

  if (loading) {
    return <div data-testid='loading' />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/question/:id' element={<Question />} />
          <Route path='/new' element={<NewQuestion />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const AppLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}