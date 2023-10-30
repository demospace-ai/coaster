import { AuthProvider } from "@coaster/components/client";
import {
  DynamicFooter,
  DynamicHeader,
  DynamicLoginModal,
  DynamicNotificationProvider,
} from "consumer/app/(pages)/client";

const PUBLIC_PATHS = [
  "/",
  "/listings/:listingID",
  "/search",
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/about",
  "/reset-password",
  "/create-password",
  "/unauthorized",
  "/oauth-callback",
];

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider publicPaths={PUBLIC_PATHS}>
      <DynamicNotificationProvider>
        <DynamicLoginModal />
        <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
          <DynamicHeader />
          {children}
          <DynamicFooter />
        </div>
      </DynamicNotificationProvider>
    </AuthProvider>
  );
}
