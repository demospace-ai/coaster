import { FeaturedPage } from "app/(pages)/[category]/server";
import { Metadata, Viewport } from "next";

export const dynamic = "force-static";

export const viewport: Viewport = {
  themeColor: "#efedea",
};

export const metadata: Metadata = {
  title: "Coaster - Book guided outdoor adventures",
  description:
    "Discover local guides and plan your next adventure with Coaster. Book a unique adventure with expert local guides on Coaster for unforgettable memories.",
};

export default async function Page() {
  return <FeaturedPage />;
}
