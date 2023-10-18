import { ErrorBoundary } from "@highlight-run/react";
import React, { useEffect, useState } from "react";
import { Outlet, Route, ScrollRestoration, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { useCheckSession } from "src/app/actions";
import { RequireAuth } from "src/components/auth/RequireAuth";
import { Footer } from "src/components/footer/Footer";
import { SupplierHeader } from "src/components/header/Header";
import { LogoLoading } from "src/components/loading/LogoLoading";
import { ToastPortal } from "src/components/notifications/Notifications";
import { About } from "src/pages/about/About";
import { FinanceLayout } from "src/pages/finance";
import { PayoutMethods, Payouts } from "src/pages/finance/Payouts";
import { Hosting } from "src/pages/hosting/Hosting";
import { NewListing } from "src/pages/listing/NewListing";
import { YourListings } from "src/pages/listing/YourListings";
import { EditListingLayout } from "src/pages/listing/edit";
import { ListingDetails } from "src/pages/listing/edit/Details";
import { Images } from "src/pages/listing/edit/Images";
import { Includes } from "src/pages/listing/edit/Includes";
import { Availability } from "src/pages/listing/edit/availability/AvailabilityRules";
import { CreatePassword } from "src/pages/login/CreatePassword";
import { Invite } from "src/pages/login/Invite";
import { Login, Unauthorized } from "src/pages/login/Login";
import { ResetPassword } from "src/pages/login/ResetPassword";
import { NotFound } from "src/pages/notfound/NotFound";
import { Privacy } from "src/pages/privacy/Privacy";
import { Terms } from "src/pages/privacy/Terms";
import { Profile } from "src/pages/profile/Profile";
import { useSelector } from "src/root/model";

let needsInit = true;

const SupplierAppLayout: React.FC = () => {
  const start = useCheckSession();
  const loading = useSelector((state) => state.app.loading);
  const forbidden = useSelector((state) => state.app.forbidden);

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
      <div className="tw-flex tw-flex-col tw-flex-grow">
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create-password" element={<CreatePassword />} />
      <Route path="/reset_password" element={<ResetPassword />} /> {/** TODO: Remove in November */}
      <Route path="/create_password" element={<CreatePassword />} /> {/** TODO: Remove in November*/}
      <Route path="/invite" element={<RequireAuth element={<Invite />} />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/listings/:listingID/edit" element={<RequireAuth element={<EditListingLayout />} />}>
        <Route index element={<ListingDetails />} />
        <Route path="images" element={<Images />} />
        <Route path="includes" element={<Includes />} />
        <Route path="availability" element={<Availability />} />
      </Route>
      <Route path="/listings/new" element={<RequireAuth element={<NewListing />} />} />
      <Route path="/listings" element={<RequireAuth element={<YourListings />} />} />
      <Route path="/profile" element={<RequireAuth element={<Profile />} />} />
      <Route path="/finance" element={<RequireAuth element={<FinanceLayout />} />}>
        <Route index element={<Payouts />} />
        <Route path="payout-methods" element={<PayoutMethods />} />
      </Route>
      <Route path="/" element={<RequireAuth element={<Hosting />} />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
