import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar Sesión — Construex',
};

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
