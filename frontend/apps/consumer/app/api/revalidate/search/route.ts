import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  revalidatePath(`/search?${params}`);
}
