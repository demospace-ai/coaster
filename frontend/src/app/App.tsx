import { ErrorBoundary } from "@highlight-run/react";
import { useEffect, useState } from "react";
import {
  Outlet,
  Route,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
} from "react-router-dom";
import { useStart } from "src/app/actions";
import { RequireAuth } from "src/components/auth/RequireAuth";
import { Footer } from "src/components/footer/Footer";
import { Header } from "src/components/header/Header";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { ToastPortal } from "src/components/notifications/Notifications";
import { About } from "src/pages/about/About";
import { Home } from "src/pages/home/Home";
import { Listing } from "src/pages/listing/Listing";
import { CreatePassword } from "src/pages/login/CreatePassword";
import { Invite } from "src/pages/login/Invite";
import { Login, Unauthorized } from "src/pages/login/Login";
import { ResetPassword } from "src/pages/login/ResetPassword";
import { NotFound } from "src/pages/notfound/NotFound";
import { Privacy } from "src/pages/privacy/Privacy";
import { Terms } from "src/pages/privacy/Terms";
import { Profile } from "src/pages/profile/Profile";
import { Search } from "src/pages/search/Search";
import { useSelector } from "src/root/model";

let needsInit = true;

const AppLayout: React.FC = () => {
  const start = useStart();
  const loading = useSelector((state) => state.app.loading);
  const forbidden = useSelector((state) => state.app.forbidden);
  const location = useLocation();
  const isHome = location.pathname === "/";

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
      <ToastPortal />
      <ScrollRestoration />
      <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
        <Header />
        <Outlet />
        <Footer />
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create-password" element={<CreatePassword />} />
      <Route path="/reset_password" element={<ResetPassword />} /> {/** TODO: Remove in November */}
      <Route path="/create_password" element={<CreatePassword />} /> {/** TODO: Remove in November*/}
      <Route path="/invite" element={<RequireAuth element={<Invite />} />} />
      <Route path="/search" element={<Search />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/listings/:listingID" element={<Listing />} />
      <Route path="/profile" element={<RequireAuth element={<Profile />} />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
