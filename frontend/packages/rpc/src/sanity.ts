import { createClient } from "@sanity/client";

export const SanityClient = createClient({
  apiVersion: "2023-10-31",
  projectId: "i0rftto5",
  dataset: "production",
  useCdn: true,
});
