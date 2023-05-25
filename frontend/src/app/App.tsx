import { ReactNode, useEffect } from "react";
import { useSelector } from "src/root/model";
import { Navigate, Outlet, createBrowserRouter, createRoutesFromElements, Route, useLocation } from "react-router-dom";
import { Header } from "src/components/header/Header";
import { NavigationBar } from "src/components/navigationBar/NavigationBar";
import { ApiKey } from "src/pages/apikey/ApiKey";
import { Destination } from "src/pages/destinations/Destination";
import { Destinations } from "src/pages/destinations/Destinations";
import { Home } from "src/pages/home/Home";
import { Unauthorized } from "src/pages/login/Login";
import { NotFound } from "src/pages/notfound/NotFound";
import { Notifications } from "src/pages/notifications/Notifications";
import { ObjectsList } from "src/pages/objects/Objects";
import { Preview } from "src/pages/preview/Preview";
import { Sync } from "src/pages/syncs/Sync";
import { Team } from "src/pages/team/Team";
import { Login } from "src/pages/login/Login";
import { CreateObject } from "src/pages/objects/CreateObject";
import { Object } from "src/pages/objects/Object";
import { Syncs } from "src/pages/syncs/Syncs";
import { useStart } from "src/app/actions";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { ObjectsLayout } from "src/pages/objects/ObjectsLayout";
import { NewObject } from "src/pages/objects/NewObject";

type AuthenticationProps = {
  element: ReactNode;
};

const RequireAuth: React.FC<AuthenticationProps> = (props) => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  return <>{isAuthenticated ? props.element : <Navigate to="/login" replace />}</>;
};

let needsInit = true;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const loading = useSelector((state) => state.app.loading);
  const forbidden = useSelector((state) => state.app.forbidden);
  const start = useStart();

  useEffect(() => {
    window.Intercom("update");
  }, [location]);

  useEffect(() => {
    // Recommended way to run one-time initialization: https://beta.reactjs.org/learn/you-might-not-need-an-effect#initializing-the-application
    if (needsInit) {
      start();
      needsInit = false;
    }
  }, [start]);

  if (loading) {
    return <LogoLoading />;
  }

  if (forbidden) {
    return <></>;
  }

  return (
    <div className="tw-flex tw-flex-row tw-w-full tw-h-full">
      <NavigationBar />
      <div className="tw-flex tw-flex-col tw-h-full tw-w-full tw-bg-gray-10 tw-overflow-hidden">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login create />} />
      <Route path="/" element={<RequireAuth element={<Home />} />} />
      <Route path="/notifications" element={<RequireAuth element={<Notifications />} />} />
      <Route path="/apikey" element={<RequireAuth element={<ApiKey />} />} />
      <Route path="/preview" element={<RequireAuth element={<Preview />} />} />
      <Route path="/team" element={<RequireAuth element={<Team />} />} />
      <Route path="/destinations" element={<RequireAuth element={<Destinations />} />} />
      <Route path="/destination/:destinationID" element={<RequireAuth element={<Destination />} />} />
      <Route path="/objects" element={<RequireAuth element={<ObjectsLayout />} />}>
        <Route index element={<ObjectsList />} />
        <Route path="new" element={<NewObject />}>
          {/* <Route path="destination" element={<DestinationSetup />} /> */}
        </Route>
        <Route path=":objectID" element={<Object />} />
      </Route>
      <Route path="/syncs" element={<RequireAuth element={<Syncs />} />} />
      <Route path="/sync/:syncID" element={<RequireAuth element={<Sync />} />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
