import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(_: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  revalidatePath(`/tags/${slug}`);
  return Response.json({ revalidated: true, now: Date.now() });
}
