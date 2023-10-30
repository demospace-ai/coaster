import { UserProvider } from "@coaster/components/server";
import { StoreProvider } from "@coaster/state";
import { DynamicFooter, DynamicHeader, DynamicLoginModal, DynamicToastPortal } from "consumer/app/(pages)/client";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <StoreProvider>
        <DynamicLoginModal />
        <DynamicToastPortal />
        <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
          <DynamicHeader />
          {children}
          <DynamicFooter />
        </div>
      </StoreProvider>
    </UserProvider>
  );
}
