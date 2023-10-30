import { Footer, LoginProvider, NotificationProvider, SupplierHeader, UserProvider } from "@coaster/components/client";
import { DynamicLoginModal } from "supplier/app/(pages)/client";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LoginProvider>
        <NotificationProvider>
          <DynamicLoginModal />
          <div className="tw-flex tw-flex-col tw-flex-grow">
            <SupplierHeader />
            {children}
            <Footer />
          </div>
        </NotificationProvider>
      </LoginProvider>
    </UserProvider>
  );
}
