import { Footer } from "@coaster/components/footer/Footer";
import { SupplierHeader } from "@coaster/components/header/Header";
import { NotFound } from "@coaster/components/pages/NotFound";
import { AuthProvider } from "@coaster/components/provider/AuthProvider";

export default function NotFoundPage() {
  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-h-96">
      <AuthProvider publicPaths={[]} noRedirect>
        <SupplierHeader />
        <NotFound />
        <Footer />
      </AuthProvider>
    </div>
  );
}
