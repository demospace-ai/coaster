import { Footer } from "@coaster/components/footer/Footer";
import { SupplierHeader } from "@coaster/components/header/Header";
import { NotificationProvider } from "@coaster/components/notifications/Notifications";
import { AuthProvider } from "@coaster/components/provider/AuthProvider";
import { DynamicLoginModal } from "supplier/app/(pages)/client";

const PUBLIC_PATHS = [
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
      <NotificationProvider>
        <DynamicLoginModal />
        <div className="tw-flex tw-flex-grow tw-flex-col">
          <SupplierHeader />
          {children}
          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
