import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(_: NextRequest, { params }: { params: { listingID: string } }) {
  const listingID = params.listingID;
  revalidatePath(`/listings/${listingID}`);
  return Response.json({ revalidated: true, now: Date.now() });
}
