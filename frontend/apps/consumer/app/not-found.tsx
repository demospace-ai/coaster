import { NotFound } from "@coaster/components/pages/NotFound";
import { AuthProvider } from "@coaster/components/provider/AuthProvider";
import { DynamicFooter, DynamicHeader } from "app/(pages)/client";

export default function NotFoundPage() {
  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-h-96">
      <AuthProvider publicPaths={[]} noRedirect>
        <DynamicHeader />
        <NotFound />
        <DynamicFooter />
      </AuthProvider>
    </div>
  );
}
