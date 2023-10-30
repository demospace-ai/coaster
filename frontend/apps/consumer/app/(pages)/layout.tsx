import { LoginProvider, UserProvider } from "@coaster/components/client";
import {
  DynamicFooter,
  DynamicHeader,
  DynamicLoginModal,
  DynamicNotificationProvider,
} from "consumer/app/(pages)/client";

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LoginProvider>
        <DynamicNotificationProvider>
          <DynamicLoginModal />
          <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center">
            <DynamicHeader />
            {children}
            <DynamicFooter />
          </div>
        </DynamicNotificationProvider>
      </LoginProvider>
    </UserProvider>
  );
}
