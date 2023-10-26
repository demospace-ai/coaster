import { Footer, Header, LoginModal, ToastPortal } from "@coaster/components/client";
import { UserProvider } from "@coaster/components/server";
import { StoreProvider } from "@coaster/state";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <StoreProvider>
        <LoginModal />
        <ToastPortal />
        <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
          <Header />
          {children}
          <Footer />
        </div>
      </StoreProvider>
    </UserProvider>
  );
}
