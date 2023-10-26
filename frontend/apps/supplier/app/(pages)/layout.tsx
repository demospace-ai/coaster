import { Footer, LoginModal, SupplierHeader, ToastPortal } from "@coaster/components/client";
import { StoreProvider } from "@coaster/state";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <LoginModal />
      <ToastPortal />
      <div className="tw-flex tw-flex-col tw-flex-grow">
        <SupplierHeader />
        {children}
        <Footer />
      </div>
    </StoreProvider>
  );
}
