import { Footer, Header, ToastPortal } from "@coaster/components/client";
import { UserProvider } from "@coaster/components/server";
import { StoreProvider } from "@coaster/state";

import { DynamicLoginModal } from "consumer/app/(pages)/client";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <StoreProvider>
        <DynamicLoginModal />
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
