import { ErrorBoundary, Footer, Header, LoginModal, StoreProvider, ToastPortal } from "@coaster/components/client";
import { getUserServer } from "@coaster/rpc/server";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserServer();

  return (
    <StoreProvider initialUser={user}>
      <ErrorBoundary>
        <LoginModal />
        <ToastPortal />
        <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
          <Header />
          {children}
          <Footer />
        </div>
      </ErrorBoundary>
    </StoreProvider>
  );
}
