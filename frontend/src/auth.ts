import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          },
        );

        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.nombreCompleto,
          rol_id: data.user.rol_id,
          backendToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol_id = (user as any).rol_id;
        token.backendToken = (user as any).backendToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).rol_id = token.rol_id;
        (session.user as any).id = token.userId;
      }
      (session as any).backendToken = token.backendToken;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
