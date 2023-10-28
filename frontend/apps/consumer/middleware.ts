import { NextRequest, NextResponse } from "next/server";
import { pathToRegexp } from "path-to-regexp";

const publicPaths = [
  "/",
  "/listings/:listingID",
  "/search",
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

export function middleware(request: NextRequest) {
  const isPublicRoute = createRouteMatcher(publicPaths);
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.includes("opengraph-image")) {
    return NextResponse.next();
  }

  if (!request.cookies.get("X-Session-Token")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export const createRouteMatcher = (routes: string[]) => {
  const matchers = routes.map((route) => pathToRegexp(route));
  return (req: NextRequest) => matchers.some((matcher) => matcher.test(req.nextUrl.pathname));
};
