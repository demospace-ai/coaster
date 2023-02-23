import React, { ReactNode, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useStart } from 'src/app/actions';
import { Loading } from 'src/components/loading/Loading';
import { useSelector } from 'src/root/model';

let needsInit = true;

export const Connect: React.FC = () => {
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
        <Route path='/' element={<RequireAuth element={<div>hi</div>} />} />
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