import { ErrorBoundary } from "@highlight-run/react";
import React, { useEffect, useState } from "react";
import { Outlet, Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { useStart } from "src/app/actions";
import { RequireAuth } from "src/components/auth/RequireAuth";
import { Footer } from "src/components/footer/Footer";
import { SupplierHeader } from "src/components/header/Header";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { Toast, getToastContentFromDetails } from "src/components/notifications/Notifications";
import { About } from "src/pages/about/About";
import { Hosting } from "src/pages/hosting/Hosting";
import { EditListing } from "src/pages/listing/EditListing";
import { NewListing } from "src/pages/listing/NewListing";
import { CreatePassword } from "src/pages/login/CreatePassword";
import { Invite } from "src/pages/login/Invite";
import { Login, Unauthorized } from "src/pages/login/Login";
import { ResetPassword } from "src/pages/login/ResetPassword";
import { NotFound } from "src/pages/notfound/NotFound";
import { Privacy } from "src/pages/privacy/Privacy";
import { Terms } from "src/pages/privacy/Terms";
import { Profile } from "src/pages/profile/Profile";
import { useDispatch, useSelector } from "src/root/model";

let needsInit = true;

const SupplierAppLayout: React.FC = () => {
  const start = useStart();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.app.loading);
  const forbidden = useSelector((state) => state.app.forbidden);
  const toast = useSelector((state) => state.app.toast);
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
      <div className="tw-z-20 tw-pointer-events-none tw-fixed tw-w-full tw-h-full">
        <Toast
          content={toastContent}
          show={!!toast}
          close={() => dispatch({ type: "toast", toast: undefined })}
          duration={toast?.duration}
        />
      </div>
      <div className="tw-flex tw-flex-col tw-flex-grow tw-bg-white">
        <SupplierHeader />
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

export const supplierRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<SupplierAppLayout />} errorElement={<ErrorBoundary showDialog />}>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login create />} />
      <Route path="/reset_password" element={<ResetPassword />} />
      <Route path="/create_password" element={<CreatePassword />} />
      <Route path="/invite" element={<RequireAuth element={<Invite />} />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/listings/:listingID/edit" element={<EditListing />} />
      <Route path="/listings/new" element={<RequireAuth element={<NewListing />} />} />
      <Route path="/hosting" element={<RequireAuth element={<Hosting />} />} />
      <Route path="/profile" element={<RequireAuth element={<Profile />} />} />
      <Route path="/" element={<RequireAuth element={<Hosting />} />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
