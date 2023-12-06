import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const decodedParams = decodeURI(params);
  revalidatePath(`/listings?${decodedParams}`);
  return Response.json({ revalidated: true, now: Date.now(), params: decodedParams });
}
