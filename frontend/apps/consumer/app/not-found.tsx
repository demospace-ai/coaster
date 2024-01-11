import { NotFound } from "@coaster/components/pages/NotFound";
import { AuthProvider } from "@coaster/components/provider/AuthProvider";
import { DynamicFooter, DynamicHeader } from "app/(pages)/client";

export default function NotFoundPage() {
  return (
    <div className="tw-flex tw-h-96 tw-flex-grow tw-flex-col tw-items-center">
      <AuthProvider publicPaths={[]} noRedirect>
        <DynamicHeader />
        <NotFound />
        <DynamicFooter />
      </AuthProvider>
    </div>
  );
}
