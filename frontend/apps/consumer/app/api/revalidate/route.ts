import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(_: NextRequest) {
  revalidatePath("/(pages)", "page");
}
