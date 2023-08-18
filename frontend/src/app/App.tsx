import { ErrorBoundary } from "@highlight-run/react";
import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet, Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { useStart } from "src/app/actions";
import { Footer } from "src/components/footer/Footer";
import { Header } from "src/components/header/Header";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { Toast, getToastContentFromDetails } from "src/components/notifications/Notifications";
import { About } from "src/pages/about/About";
import { Home } from "src/pages/home/Home";
import { Hosting } from "src/pages/hosting/Hosting";
import { Listing } from "src/pages/listing/Listing";
import { NewListing } from "src/pages/listing/NewListing";
import { Login, Unauthorized } from "src/pages/login/Login";
import { NotFound } from "src/pages/notfound/NotFound";
import { Privacy } from "src/pages/privacy/Privacy";
import { Terms } from "src/pages/privacy/Terms";
import { Profile } from "src/pages/profile/Profile";
import { Search } from "src/pages/search/Search";
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
  const start = useStart();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.app.loading);
  const forbidden = useSelector((state) => state.app.forbidden);
  const toast = useSelector((state) => state.app.toast);
  const user = useSelector((state) => state.login.user);
  const toastContent = getToastContentFromDetails(toast);

  const error = useCatchGlobalError();
  if (error) {
    throw error;
  }

  useEffect(() => {
    // Recommended way to run one-time initialization: https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
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
    <>
      <div className="tw-pointer-events-none tw-fixed tw-w-full tw-h-full">
        <Toast
          content={toastContent}
          show={!!toast}
          close={() => dispatch({ type: "toast", toast: undefined })}
          duration={toast?.duration}
        />
      </div>
      <div className="tw-flex tw-flex-row tw-w-full tw-h-full">
        <div className="tw-flex tw-flex-col tw-h-full tw-w-full tw-bg-gray-10">
          <Header />
          <Outlet />
          <Footer />
        </div>
      </div>
    </>
  );
};

function useCatchGlobalError() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      setError(e.error);
      return true;
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return error;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />} errorElement={<ErrorBoundary showDialog />}>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login create />} />
      <Route path="/search" element={<Search />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/hosting" element={<Hosting />} />
      <Route path="/listings/:listingID" element={<Listing />} />
      <Route path="/listings/new" element={<RequireAuth element={<NewListing />} />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
