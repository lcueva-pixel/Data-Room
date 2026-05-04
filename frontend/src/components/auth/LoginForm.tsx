'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas. Intenta de nuevo.');
      } else {
        router.push('/dashboard/overview');
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-sidebar-main flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-sidebar-hover rounded-2xl shadow-xl dark:shadow-black/40 dark:border dark:border-white/10 px-8 py-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/cex_logo.png"
              alt="Logo"
              className="w-14 h-14 rounded-xl object-contain mb-4 shadow-md"
            />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">
              Data Room
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Portal de Reportes</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-sidebar-main text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sidebar-accent/60 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-sidebar-main text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sidebar-accent/60 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-4 py-3">
                <span className="text-red-600 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-900 dark:bg-sidebar-accent dark:text-sidebar-main hover:bg-blue-800 dark:hover:bg-sidebar-accent/90 disabled:bg-blue-900/60 dark:disabled:bg-sidebar-accent/60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-8">
            © {new Date().getFullYear()} Data Room — Acceso restringido
          </p>
        </div>
      </div>
    </div>
  );
}
