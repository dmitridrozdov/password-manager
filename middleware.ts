// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/'])

// export default clerkMiddleware(async (auth, req) => {
//   if (!isPublicRoute(req)) {
//     const { userId } = await auth();
    
//     if (!userId) {
//       return Response.redirect(new URL('/sign-in', req.url));
//     }
//   }
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  
  // If user is signed in and on landing page, redirect to dashboard
  if (userId && url.pathname === '/') {
    return Response.redirect(new URL('/setup', req.url));
  }
  
  // If user is signed in and trying to access sign-in/sign-up pages, redirect to dashboard
  if (userId && (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up'))) {
    return Response.redirect(new URL('/setup', req.url));
  }
  
  // If user is not signed in and trying to access protected routes, redirect to sign-in
  if (!isPublicRoute(req) && !userId && url.pathname !== '/') {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};