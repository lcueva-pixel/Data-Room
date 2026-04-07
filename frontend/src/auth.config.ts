import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol_id = Number(user.rol_id);
        token.backendToken = user.backendToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.rol_id = Number(token.rol_id);
        session.user.id = token.userId as string;
      }
      (session as any).backendToken = token.backendToken;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname === '/login';
      const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        if (isAdminRoute && Number(auth?.user?.rol_id) !== 1) {
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
  session: {
    strategy: 'jwt',
  },
  providers: [],
};
