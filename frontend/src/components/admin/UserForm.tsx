'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/types/user.types';

const schema = z
  .object({
    nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 6, 'Mínimo 6 caracteres')
      .refine((v) => !v || /[A-Z]/.test(v), 'Debe contener al menos una mayúscula')
      .refine((v) => !v || /[0-9]/.test(v), 'Debe contener al menos un número'),
    confirmPassword: z.string().optional(),
    rolId: z.number().int().min(1, 'Selecciona un rol'),
    activo: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.password) return data.password === data.confirmPassword;
      return true;
    },
    { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] },
  );

type UserFormValues = z.infer<typeof schema>;

interface UserFormProps {
  initialValues?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ initialValues, onSuccess, onCancel }: UserFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { createUser, updateUser } = useUsers();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isEditing = !!initialValues;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset: resetForm,
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          nombreCompleto: initialValues.nombreCompleto,
          email: initialValues.email,
          rolId: initialValues.rolId,
          activo: initialValues.activo,
          password: '',
          confirmPassword: '',
        }
      : { activo: true, password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing) {
        const payload: Record<string, unknown> = {
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          rolId: data.rolId,
          activo: data.activo,
        };
        if (data.password) payload.password = data.password;
        await updateUser(initialValues.id, payload);
      } else {
        if (!data.password) {
          setError('password', { message: 'La contraseña es requerida' });
          return;
        }
        await createUser({
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          password: data.password,
          rolId: data.rolId,
          activo: data.activo,
        });
        resetForm();
      }
      onSuccess?.();
    } catch {
      setError('root', {
        message: `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario. Intenta de nuevo.`,
      });
    }
  };

  const handleLimpiar = () => {
    resetForm();
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sidebar-accent/60 focus:border-transparent';
  const errorClass = 'text-red-500 dark:text-red-400 text-xs mt-1';
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre completo */}
      <div>
        <label className={labelClass}>
          Nombre completo <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input {...register('nombreCompleto')} placeholder="Juan Pérez" className={inputClass} />
        {errors.nombreCompleto && <p className={errorClass}>{errors.nombreCompleto.message}</p>}
      </div>

      {/* Correo */}
      <div>
        <label className={labelClass}>
          Correo electrónico <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="juan@empresa.com"
          className={inputClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Contraseña {isEditing ? <span className="text-slate-400 dark:text-gray-500 font-normal">(opcional)</span> : <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder={isEditing ? 'Dejar vacío para no cambiar' : ''}
              className={inputClass + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Confirmar</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              className={inputClass + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
        </div>
      </div>
      {!isEditing && (
        <p className="text-slate-400 dark:text-gray-500 text-xs -mt-2">Mín. 6 caracteres, 1 mayúscula y 1 número</p>
      )}

      {/* Rol */}
      <div>
        <label className={labelClass}>
          Rol del usuario <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <select
          {...register('rolId', { valueAsNumber: true })}
          className={inputClass}
          disabled={rolesLoading}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.rolDescripcion}
            </option>
          ))}
        </select>
        {errors.rolId && <p className={errorClass}>{errors.rolId.message}</p>}
      </div>

      {/* Activo */}
      <div className="flex items-center gap-2">
        <input
          {...register('activo')}
          type="checkbox"
          id="usuarioActivo"
          className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-blue-600 dark:text-sidebar-accent focus:ring-blue-500 dark:focus:ring-sidebar-accent/60"
        />
        <label htmlFor="usuarioActivo" className="text-sm text-slate-700 dark:text-gray-300">
          Usuario activo
        </label>
      </div>

      {/* Error global */}
      {errors.root && (
        <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-transparent dark:border-red-800/40 px-3 py-2 rounded-lg">
          {errors.root.message}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLimpiar}
            className="px-4 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main transition-colors"
          >
            Limpiar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 dark:bg-sidebar-accent dark:text-sidebar-main text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-sidebar-accent/90 disabled:opacity-60 transition-colors"
        >
          {isSubmitting
            ? 'Guardando...'
            : isEditing
            ? '✓ Actualizar Usuario'
            : '✓ Crear Usuario'}
        </button>
      </div>
    </form>
  );
}
