import { Image } from "@coaster/rpc/common";
import { isProd } from "@coaster/utils";

export function getGcsImageUrl(image: Image) {
  const bucketName = isProd() ? "user-images-bucket-us" : "dev-user-images-bucket";
  // TODO: put images.trycoaster.com here for Prod to get CDN
  return `https://storage.googleapis.com/${bucketName}/${image.storage_id}`;
}
