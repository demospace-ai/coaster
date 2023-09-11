import { Image } from "src/rpc/types";
import { isProd } from "src/utils/env";

export function getGcsImageUrl(image: Image) {
  const bucketName = isProd() ? "user-images-bucket-us" : "dev-user-images-bucket";
  // TODO: put images.trycoaster.com here for Prod to get CDN
  return `https://storage.googleapis.com/${bucketName}/${image.storage_id}`;
}
