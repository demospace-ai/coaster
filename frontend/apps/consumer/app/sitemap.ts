import { GetAllListingMetadata, sendRequest } from "@coaster/rpc/common";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingMetadataList = await sendRequest(GetAllListingMetadata);
  const listingPages = listingMetadataList.map((metadata) => ({
    url: `https://trycoaster.com/listings/${metadata.id}`,
    lastModified: metadata.updated_at,
  }));

  return [
    {
      url: "https://trycoaster.com",
      lastModified: new Date(),
    },
    {
      url: "https://trycoaster.com/about",
      lastModified: new Date(2023, 9, 1),
    },
    {
      url: "https://trycoaster.com/terms",
      lastModified: new Date(2023, 9, 1),
    },
    {
      url: "https://trycoaster.com/privacy",
      lastModified: new Date(2023, 9, 1),
    },
    ...listingPages,
  ];
}
