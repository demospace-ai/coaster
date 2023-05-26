import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ReactNode, useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, useLocation } from "react-router-dom";
import { useStart } from "src/app/actions";
import { Header } from "src/components/header/Header";
import { UpgradeBanner } from "src/components/header/UpgradeBanner";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { NavigationBar } from "src/components/navigationBar/NavigationBar";
import { Toast } from "src/components/notifications/Notifications";
import { ApiKey } from "src/pages/apikey/ApiKey";
import { Destination } from "src/pages/destinations/Destination";
import { Destinations } from "src/pages/destinations/Destinations";
import { Home } from "src/pages/home/Home";
import { Login, Unauthorized } from "src/pages/login/Login";
import { NotFound } from "src/pages/notfound/NotFound";
import { Notifications } from "src/pages/notifications/Notifications";
import { NewObject } from "src/pages/objects/NewObject";
import { Object } from "src/pages/objects/Object";
import { ObjectsList } from "src/pages/objects/Objects";
import { ObjectsLayout } from "src/pages/objects/ObjectsLayout";
import { UpdateObject } from "src/pages/objects/UpdateObject";
import { Preview } from "src/pages/preview/Preview";
import { Sync } from "src/pages/syncs/Sync";
import { Syncs } from "src/pages/syncs/Syncs";
import { Team } from "src/pages/team/Team";
import { useDispatch, useSelector } from "src/root/model";

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
  const toast = useSelector((state) => state.app.toast);
  const dispatch = useDispatch();
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

  var toastContent = undefined;
  if (toast) {
    switch (toast.type) {
      case "error":
        toastContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <XCircleIcon className="tw-w-5 tw-h-5 tw-text-red-500 tw-stroke-2" />
            <p className="tw-ml-2 tw-text-sm tw-text-gray-900">{toast.content}</p>
          </div>
        );
        break;
      case "success":
        toastContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <CheckCircleIcon className="tw-w-5 tw-h-5 tw-text-green-500 tw-stroke-2" />
            <p className="tw-ml-2 tw-text-base tw-text-gray-900">{toast.content}</p>
          </div>
        );
        break;
      case "info":
        toastContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <InformationCircleIcon className="tw-w-5 tw-h-5 tw-text-yellow-500 tw-stroke-2" />
            <p className="tw-ml-2 tw-text-base tw-text-gray-900">{toast.content}</p>
          </div>
        );
        break;
    }
  }

  if (loading) {
    return <LogoLoading />;
  }

  if (forbidden) {
    return <></>;
  }

  return (
    <>
      <UpgradeBanner />
      <div className="tw-pointer-events-none tw-fixed tw-w-full tw-h-full">
        <Toast
          content={toastContent}
          show={!!toast}
          close={() => dispatch({ type: "toast", toast: undefined })}
          duration={toast?.duration}
        />
      </div>
      <div className="tw-flex tw-flex-row tw-w-full tw-h-full">
        <NavigationBar />
        <div className="tw-flex tw-flex-col tw-h-full tw-w-full tw-bg-gray-10 tw-overflow-hidden">
          <Header />
          <Outlet />
        </div>
      </div>
    </>
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
        <Route path=":objectID/update" element={<UpdateObject />} />
      </Route>
      <Route path="/syncs" element={<RequireAuth element={<Syncs />} />} />
      <Route path="/sync/:syncID" element={<RequireAuth element={<Sync />} />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
