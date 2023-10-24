import { ErrorBoundary, Footer, LoginModal, SupplierHeader, ToastPortal } from "@coaster/components/client";
import { StoreProvider } from "@coaster/state";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ErrorBoundary>
        <LoginModal />
        <ToastPortal />
        <div className="tw-flex tw-flex-col tw-flex-grow">
          <SupplierHeader />
          {children}
          <Footer />
        </div>
      </ErrorBoundary>
    </StoreProvider>
  );
}
