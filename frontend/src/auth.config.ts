import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname === '/login';
      const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        if (isAdminRoute && (auth?.user as any)?.rol_id !== 1) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard/overview', nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
