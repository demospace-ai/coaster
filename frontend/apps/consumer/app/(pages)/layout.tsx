import { AuthProvider } from "@coaster/components/provider/AuthProvider";
import {
  DynamicFooter,
  DynamicHeader,
  DynamicLoginModal,
  DynamicNotificationProvider,
} from "consumer/app/(pages)/client";

const PUBLIC_PATHS = [
  "/",
  "/activities/:activity",
  "/listings/:listingID",
  "/listings/operated/:category/:place",
  "/search",
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/about",
  "/sustainability",
  "/careers",
  "/reset-password",
  "/create-password",
  "/unauthorized",
  "/oauth-callback",
  "/blog",
  "/blog/:slug",
  "/tags/:slug",
];

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider publicPaths={PUBLIC_PATHS}>
      <DynamicNotificationProvider>
        <DynamicLoginModal />
        <div className="tw-flex tw-flex-grow tw-flex-col tw-items-center">
          <DynamicHeader />
          {children}
          <DynamicFooter />
        </div>
      </DynamicNotificationProvider>
    </AuthProvider>
  );
}
