import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
])

export default clerkMiddleware(async(auth,req) => {
  const { userId, redirectToSignIn } = await auth();
  if(!userId && isProtectedRoute(req)){
    // const {redirectToSignIn} =await auth()
    return redirectToSignIn();
  }
  return NextResponse.next();
});

// // export const config = {
// //   matcher: [
// //     // Skip Next.js internals and all static files, unless found in search params
// //     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
// //     // Always run for API routes
// //     '/(api|trpc)(.*)',
// //   ],
// // };

// // middleware.ts
// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// // Tell Next.js which routes should run this middleware
// export const config = {
//   matcher: [
//     // Run Clerk middleware on all routes except static files and Next internals
//     "/((?!_next|.*\\..*).*)",
//   ],
// };

// import { clerkMiddleware } from '@clerk/nextjs/server';



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};