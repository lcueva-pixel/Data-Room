import 'next-auth';

declare module 'next-auth' {
  interface User {
    rol_id: number;
    backendToken: string;
  }

  interface Session {
    backendToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      rol_id: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol_id: number;
    backendToken: string;
    userId: string;
  }
}
