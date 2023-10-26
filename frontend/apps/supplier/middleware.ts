import { getUserServer } from "@coaster/rpc/server";
import { NextRequest, NextResponse } from "next/server";
import { pathToRegexp } from "path-to-regexp";

const publicPaths = [
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/about",
  "/reset-password",
  "/create-password",
  "/unauthorized",
  "/oauth-callback",
];

export async function middleware(request: NextRequest) {
  const isPublicRoute = createRouteMatcher(publicPaths);
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const user = await getUserServer();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export const createRouteMatcher = (routes: string[]) => {
  const matchers = routes.map((route) => {
    const reg = pathToRegexp(route);
    console.log(reg);
    return reg;
  });
  return (req: NextRequest) => matchers.some((matcher) => matcher.test(req.nextUrl.pathname));
};
