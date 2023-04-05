import React, { ReactNode, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useStart } from "src/app/actions";
import { Header } from "src/components/header/Header";
import { Loading } from "src/components/loading/Loading";
import { NavigationBar } from "src/components/navigationBar/NavigationBar";
import { ApiKey } from "src/pages/apikey/ApiKey";
import { Destination } from "src/pages/destinations/Destination";
import { Destinations } from "src/pages/destinations/Destinations";
import { Home } from "src/pages/home/Home";
import { Login } from "src/pages/login/Login";
import { NotFound } from "src/pages/notfound/NotFound";
import { Objects } from "src/pages/objects/Objects";
import { Sync } from "src/pages/syncs/Sync";
import { Syncs } from "src/pages/syncs/Syncs";
import { Team } from "src/pages/team/Team";
import { useSelector } from "src/root/model";

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
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth element={<Home />} />} />
          <Route path="/apikey" element={<RequireAuth element={<ApiKey />} />} />
          <Route path="/team" element={<RequireAuth element={<Team />} />} />
          <Route path="/destinations" element={<RequireAuth element={<Destinations />} />} />
          <Route path="/destination/:destinationID" element={<RequireAuth element={<Destination />} />} />
          <Route path="/objects" element={<RequireAuth element={<Objects />} />} />
          <Route path="/syncs" element={<RequireAuth element={<Syncs />} />} />
          <Route path="/sync/:syncID" element={<RequireAuth element={<Sync />} />} />
          <Route path="*" element={<NotFound />} />
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
      <div className="tw-flex tw-flex-col tw-h-full tw-w-full tw-bg-gray-10 tw-overflow-hidden">
        <Header />
        <Outlet />
      </div>
    </>
  );
};