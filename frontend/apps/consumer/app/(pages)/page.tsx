import { FeaturedPage } from "app/(pages)/server";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Coaster - Book guided outdoor adventures",
  description:
    "Discover local guides and plan your next adventure with Coaster. Book a unique adventure with expert local guides on Coaster for unforgettable memories.",
  alternates: {
    canonical: "https://www.trycoaster.com",
  },
};

export default async function Page() {
  return <FeaturedPage />;
}
