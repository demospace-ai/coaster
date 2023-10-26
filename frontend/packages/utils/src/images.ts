import { isProd } from "./env";

export function getGcsImageUrl(storageID: string) {
  const bucketName = isProd() ? "user-images-bucket-us" : "dev-user-images-bucket";
  // TODO: put images.trycoaster.com here for Prod to get CDN
  return `https://storage.googleapis.com/${bucketName}/${storageID}`;
}
