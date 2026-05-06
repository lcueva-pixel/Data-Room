import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol_id = Number(user.rol_id);
        token.backendToken = user.backendToken;
        token.userId = user.id;
        token.backendTokenExp = user.backendTokenExp;
      }
      // Detectar expiración real del JWT del backend en cada verificación de sesión
      if (token.backendTokenExp && Date.now() > token.backendTokenExp * 1000) {
        return { ...token, error: 'RefreshAccessTokenError' };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.rol_id = Number(token.rol_id);
        session.user.id = token.userId as string;
      }
      (session as any).backendToken = token.backendToken;
      session.error = token.error;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const hasSessionError = (auth as any)?.error === 'RefreshAccessTokenError';
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname === '/login';
      const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

      if (isOnDashboard) {
        // Sesión expirada: denegar acceso al dashboard sin crear bucle
        if (!isLoggedIn || hasSessionError) return false;
        if (isAdminRoute && Number(auth?.user?.rol_id) !== 1) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      // Solo redirigir al dashboard desde login si la sesión es válida (sin error)
      if (isOnLogin && isLoggedIn && !hasSessionError) {
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
