'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoles } from '@/hooks/useRoles';
import { useAdminReports } from '@/hooks/useAdminReports';
import { ChildReportsSection } from '@/components/admin/ChildReportsSection';
import { UserAccessSelector } from '@/components/admin/UserAccessSelector';
import type { Report } from '@/types/report.types';

const reportSchema = z.object({
  titulo: z.string().min(1, 'El nombre del reporte es obligatorio').max(100),
  urlIframe: z
    .string()
    .min(1, 'La URL es obligatoria')
    .startsWith('https://', 'La URL debe comenzar con https://'),
  descripcion: z.string().max(500).optional(),
  rolesIds: z.array(z.number().int()).min(1, 'Selecciona al menos un rol'),
  usuariosIds: z.array(z.number().int()),
  activo: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: Report;
  lockedParentId?: number;
}

export function ReportForm({ onSuccess, onCancel, initialValues, lockedParentId }: ReportFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { createReport, updateReport } = useAdminReports();
  const isEditing = !!initialValues;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: isEditing
      ? {
          titulo: initialValues.titulo,
          urlIframe: initialValues.urlIframe,
          descripcion: initialValues.descripcion ?? '',
          rolesIds: initialValues.reportesRoles.map((r) => r.rolId),
          usuariosIds: initialValues.reportesUsuarios?.map((ru) => ru.usuarioId) ?? [],
          activo: initialValues.activo,
        }
      : { activo: true, rolesIds: [] as number[], usuariosIds: [] as number[] },
  });

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const payload = {
        ...data,
        ...(lockedParentId != null && { padreId: lockedParentId }),
      };

      if (isEditing) {
        await updateReport(initialValues.id, payload);
      } else {
        await createReport(payload);
      }
      window.dispatchEvent(new Event('refresh-reports'));
      onSuccess();
    } catch {
      setError('root', { message: `Error al ${isEditing ? 'actualizar' : 'crear'} el reporte. Intenta de nuevo.` });
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60 focus:border-transparent';
  const errorClass = 'text-red-500 text-xs mt-1';
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1';

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Título */}
      <div>
        <label className={labelClass}>
          Nombre del botón <span className="text-red-500">*</span>
        </label>
        <input
          {...register('titulo')}
          placeholder="Ej: Reporte de Ventas Q1"
          className={inputClass}
        />
        {errors.titulo && <p className={errorClass}>{errors.titulo.message}</p>}
      </div>

      {/* URL */}
      <div>
        <label className={labelClass}>
          URL de Looker Studio <span className="text-red-500">*</span>
        </label>
        <input
          {...register('urlIframe')}
          placeholder="https://lookerstudio.google.com/..."
          className={inputClass}
        />
        {errors.urlIframe && <p className={errorClass}>{errors.urlIframe.message}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción (opcional)</label>
        <textarea {...register('descripcion')} rows={2} className={inputClass} />
        {errors.descripcion && <p className={errorClass}>{errors.descripcion.message}</p>}
      </div>

      {/* Roles — checkboxes multi-select */}
      <div>
        <label className={labelClass}>
          Roles con acceso <span className="text-red-500">*</span>
        </label>
        {rolesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Controller
            name="rolesIds"
            control={control}
            render={({ field }) => (
              <div className="space-y-2 border border-slate-200 dark:border-white/20 rounded-lg p-3 bg-slate-50 dark:bg-sidebar-main/60">
                {roles.map((rol) => {
                  const checked = field.value.includes(rol.id);
                  return (
                    <label key={rol.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-sidebar-accent focus:ring-sidebar-accent/60"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, rol.id]);
                          } else {
                            field.onChange(field.value.filter((id) => id !== rol.id));
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700 dark:text-gray-300">{rol.rolDescripcion}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        )}
        {errors.rolesIds && <p className={errorClass}>{errors.rolesIds.message}</p>}
      </div>

      {/* Acceso especial por usuario */}
      <UserAccessSelector
        value={watch('usuariosIds')}
        onChange={(ids) => setValue('usuariosIds', ids)}
        existingUsers={initialValues?.reportesUsuarios ?? []}
      />

      {/* Activo */}
      <div className="flex items-center gap-2">
        <input
          {...register('activo')}
          type="checkbox"
          id="activo"
          className="w-4 h-4 rounded border-slate-300 text-sidebar-accent focus:ring-sidebar-accent/60"
        />
        <label htmlFor="activo" className="text-sm text-slate-700 dark:text-gray-300">
          Reporte activo
        </label>
      </div>

      {errors.root && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {errors.root.message}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-sidebar-main text-white rounded-lg text-sm font-medium hover:bg-sidebar-hover hover:ring-1 hover:ring-sidebar-accent/60 disabled:opacity-60 transition-all"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>

    </form>

      {/* ── Sub-reportes vinculados (FUERA del form, evita form anidado) ── */}
      {isEditing && !lockedParentId && (
        <>
          <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4" />
          <ChildReportsSection parentId={initialValues!.id} parentTitle={initialValues!.titulo} />
        </>
      )}
    </>
  );
}
