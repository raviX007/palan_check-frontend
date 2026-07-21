import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/documents(.*)",
  "/reports(.*)",
  "/compare(.*)",
  "/eval(.*)",
  "/dev-token(.*)",
]);

/** Eval Suite is internal tooling — customers must never reach it. */
const isAdminRoute = createRouteMatcher(["/eval(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  await auth.protect();

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
