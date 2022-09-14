import React, { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Header } from 'src/components/header/Header';
import { Loading } from 'src/components/loading/Loading';
import { Modal } from 'src/components/modal/Modal';
import { NavigationBar } from 'src/components/navigationBar/NavigationBar';
import { AllQuestions } from 'src/pages/allquestions/AllQuestions';
import { Inbox } from 'src/pages/inbox/Inbox';
import { Login } from 'src/pages/login/Login';
import { MyTasks } from 'src/pages/mytasks/MyTasks';
import { NewConnection } from 'src/pages/newconnection/NewConnection';
import { NewEventDataset } from 'src/pages/neweventdataset/NewEventDataset';
import { NewQuery } from 'src/pages/newquery/NewQuery';
import { NewQuestion } from 'src/pages/newquestion/NewQuestion';
import { NotFound } from 'src/pages/notfound/NotFound';
import { Question } from 'src/pages/question/Question';
import { SearchResults } from 'src/pages/search/Search';
import { Settings } from 'src/pages/settings/Settings';
import { useSelector } from 'src/root/model';
import styles from './app.m.css';

let needsInit = true;

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const showNewQuestionModal = useSelector(state => state.app.showNewQuestionModal);
  const start = useStart();
  const dispatch = useDispatch();
  const closeNewQuestionModal = () => {
    dispatch({ type: 'showNewQuestionModal', showNewQuestionModal: false });
  };

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
      <Modal show={showNewQuestionModal} close={closeNewQuestionModal} title="New Question">
        <NewQuestion visible={showNewQuestionModal} />
      </Modal>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<RequireAuth element={<Inbox />} />} />
          <Route path='/tasks' element={<RequireAuth element={<MyTasks />} />} />
          <Route path='/allquestions' element={<RequireAuth element={<AllQuestions />} />} />
          <Route path='/question/:id' element={<RequireAuth element={<Question />} />} />
          <Route path='/search' element={<RequireAuth element={<SearchResults />} />} />
          <Route path='/newconnection' element={<RequireAuth element={<NewConnection />} />} />
          <Route path='/settings' element={<RequireAuth element={<Settings />} />} />
          <Route path='/newquery' element={<RequireAuth element={<NewQuery />} />} />
          <Route path='/neweventdataset' element={<RequireAuth element={<NewEventDataset />} />} />
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