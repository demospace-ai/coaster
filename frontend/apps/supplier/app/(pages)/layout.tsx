import { Footer, SupplierHeader, ToastPortal } from "@coaster/components/client";
import { UserProvider } from "@coaster/components/server";
import { StoreProvider } from "@coaster/state";
import { DynamicLoginModal } from "supplier/app/(pages)/client";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <StoreProvider>
        <DynamicLoginModal />
        <ToastPortal />
        <div className="tw-flex tw-flex-col tw-flex-grow">
          <SupplierHeader />
          {children}
          <Footer />
        </div>
      </StoreProvider>
    </UserProvider>
  );
}
