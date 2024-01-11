import { Footer } from "@coaster/components/footer/Footer";
import { SupplierHeader } from "@coaster/components/header/Header";
import { NotFound } from "@coaster/components/pages/NotFound";
import { AuthProvider } from "@coaster/components/provider/AuthProvider";

export default function NotFoundPage() {
  return (
    <div className="tw-flex tw-h-96 tw-flex-grow tw-flex-col tw-items-center">
      <AuthProvider publicPaths={[]} noRedirect>
        <SupplierHeader />
        <NotFound />
        <Footer />
      </AuthProvider>
    </div>
  );
}
