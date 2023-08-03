import { isProd } from "src/utils/env";

export function getGcsImageUrl(storageID: string) {
  const bucketName = isProd() ? "user-images-bucket-us" : "dev-user-images-bucket";
  return `https://storage.googleapis.com/${bucketName}/${storageID}`;
}
