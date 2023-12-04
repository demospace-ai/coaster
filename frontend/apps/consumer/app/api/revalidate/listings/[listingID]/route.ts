import { revalidatePath } from "next/cache";

export async function POST({ params }: { params: { listingID: string } }) {
  const listingID = params.listingID;
  revalidatePath(`/listings/${listingID}`);
}
