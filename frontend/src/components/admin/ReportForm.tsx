'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoles } from '@/hooks/useRoles';
import { useAdminReports } from '@/hooks/useAdminReports';
import type { Report } from '@/types/report.types';

const reportSchema = z.object({
  titulo: z.string().min(1, 'El nombre del reporte es obligatorio').max(100),
  urlIframe: z
    .string()
    .min(1, 'La URL es obligatoria')
    .startsWith('https://', 'La URL debe comenzar con https://'),
  descripcion: z.string().max(500).optional(),
  rolesIds: z.array(z.number().int()).min(1, 'Selecciona al menos un rol'),
  activo: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: Report;
}

export function ReportForm({ onSuccess, onCancel, initialValues }: ReportFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { createReport, updateReport } = useAdminReports();
  const isEditing = !!initialValues;

  const {
    register,
    handleSubmit,
    control,
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
          activo: initialValues.activo,
        }
      : { activo: true, rolesIds: [] as number[] },
  });

  const onSubmit = async (data: ReportFormValues) => {
    try {
      if (isEditing) {
        await updateReport(initialValues.id, data);
      } else {
        await createReport(data);
      }
      // Disparar evento global para refrescar el menú lateral
      window.dispatchEvent(new Event('refresh-reports'));
      onSuccess();
    } catch {
      setError('root', { message: `Error al ${isEditing ? 'actualizar' : 'crear'} el reporte. Intenta de nuevo.` });
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const errorClass = 'text-red-500 text-xs mt-1';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
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
              <div key={i} className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Controller
            name="rolesIds"
            control={control}
            render={({ field }) => (
              <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
                {roles.map((rol) => {
                  const checked = field.value.includes(rol.id);
                  return (
                    <label key={rol.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, rol.id]);
                          } else {
                            field.onChange(field.value.filter((id) => id !== rol.id));
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{rol.rolDescripcion}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        )}
        {errors.rolesIds && <p className={errorClass}>{errors.rolesIds.message}</p>}
      </div>

      {/* Activo */}
      <div className="flex items-center gap-2">
        <input
          {...register('activo')}
          type="checkbox"
          id="activo"
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="activo" className="text-sm text-slate-700">
          Reporte activo
        </label>
      </div>

      {errors.root && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {errors.root.message}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? '✓ Actualizar' : '✓ Guardar'}
        </button>
      </div>
    </form>
  );
}
