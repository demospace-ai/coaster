import { FeaturedPage } from "app/(pages)/[category]/server";
import { Viewport } from "next";

export const dynamic = "force-static";

export const viewport: Viewport = {
  themeColor: "#efedea",
};

export default async function Page({ params }: { params: { category: string } }) {
  return <FeaturedPage category={params.category} />;
}
