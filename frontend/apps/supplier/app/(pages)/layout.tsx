import {
  ErrorBoundary,
  Footer,
  LoginModal,
  StoreProvider,
  SupplierHeader,
  ToastPortal,
} from "@coaster/components/client";
import { getUserServer } from "@coaster/rpc/server";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserServer();
  return (
    <StoreProvider initialUser={user}>
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
