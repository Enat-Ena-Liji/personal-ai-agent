import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/gmail(.*)",
  "/api/auth(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!.+.[w]+$_|_next|static|public|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};