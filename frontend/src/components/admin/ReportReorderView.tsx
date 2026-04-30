'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, X, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useAdminReports, useAdminReportsFlat } from '@/hooks/useAdminReports';
import type { Report } from '@/types/report.types';

interface ReportReorderViewProps {
  onClose: () => void;
}

type GroupKey = string; // 'root' | `parent-${id}`

function keyForPadre(padreId: number | null): GroupKey {
  return padreId == null ? 'root' : `parent-${padreId}`;
}

function padreFromKey(key: GroupKey): number | null {
  return key === 'root' ? null : Number(key.replace('parent-', ''));
}

export function ReportReorderView({ onClose }: ReportReorderViewProps) {
  const { data: flatReports = [], isLoading } = useAdminReportsFlat();
  const { reorderReports } = useAdminReports();

  // Estado local: agrupación por padre, mutable durante la edición.
  // Solo se incluyen padres que tengan al menos un hijo en la lista.
  const [groups, setGroups] = useState<Record<GroupKey, Report[]>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inicializar agrupación una sola vez al cargar los datos.
  const initialGroups = useMemo<Record<GroupKey, Report[]>>(() => {
    if (!flatReports.length) return {};
    const map: Record<GroupKey, Report[]> = {};
    for (const r of flatReports) {
      const key = keyForPadre(r.padreId);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    // Ordenar dentro de cada grupo por orderIndex (ya viene así del backend, pero por defensa)
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return map;
  }, [flatReports]);

  if (!initialized && flatReports.length > 0) {
    setGroups(initialGroups);
    setInitialized(true);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Map global id → groupKey para detectar a qué grupo pertenece un item arrastrado.
  const idToGroup = useMemo(() => {
    const m = new Map<number, GroupKey>();
    for (const [key, items] of Object.entries(groups)) {
      for (const r of items) m.set(r.id, key);
    }
    return m;
  }, [groups]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeGroup = idToGroup.get(Number(active.id));
    const overGroup = idToGroup.get(Number(over.id));
    if (!activeGroup || !overGroup) return;
    // Solo permitir drag entre hermanos del mismo grupo
    if (activeGroup !== overGroup) return;

    setGroups((prev) => {
      const items = prev[activeGroup];
      const oldIndex = items.findIndex((r) => r.id === active.id);
      const newIndex = items.findIndex((r) => r.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return {
        ...prev,
        [activeGroup]: arrayMove(items, oldIndex, newIndex),
      };
    });
  };

  // Detecta qué grupos cambiaron de orden vs. el estado inicial.
  const dirtyGroups = useMemo(() => {
    const dirty: GroupKey[] = [];
    for (const key of Object.keys(groups)) {
      const initial = initialGroups[key] ?? [];
      const current = groups[key] ?? [];
      if (initial.length !== current.length) {
        dirty.push(key);
        continue;
      }
      for (let i = 0; i < initial.length; i++) {
        if (initial[i].id !== current[i].id) {
          dirty.push(key);
          break;
        }
      }
    }
    return dirty;
  }, [groups, initialGroups]);

  const hasChanges = dirtyGroups.length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      // Una mutation por grupo afectado, en serie para que los logs queden ordenados.
      for (const key of dirtyGroups) {
        const padreId = padreFromKey(key);
        const orderedIds = groups[key].map((r) => r.id);
        await reorderReports({ padreId, orderedIds });
      }
      onClose();
    } catch {
      // Los toasts de error los dispara el hook; mantener la vista abierta para reintentar.
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Determina el orden de presentación de los grupos: raíz primero, luego cada padre.
  const groupOrder: GroupKey[] = ['root', ...Object.keys(groups).filter((k) => k !== 'root')];

  return (
    <div className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">
            Reordenar Reportes
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Arrastra los reportes para cambiar su orden. Solo se permite reordenar entre hermanos del mismo nivel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main disabled:opacity-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sidebar-main text-white text-sm rounded-lg hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Guardando...' : 'Guardar orden'}
          </button>
        </div>
      </div>

      {/* Listas de drag & drop por grupo */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="p-4 space-y-6">
          {groupOrder.map((key) => {
            const items = groups[key] ?? [];
            if (items.length === 0) return null;
            const padreId = padreFromKey(key);
            const padreReport = padreId == null
              ? null
              : flatReports.find((r) => r.id === padreId);
            const title =
              padreId == null
                ? 'Reportes raíz'
                : `Sub-reportes de "${padreReport?.titulo ?? `#${padreId}`}"`;

            return (
              <div key={key}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2 px-1">
                  {title}
                </h3>
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-1.5">
                    {items.map((report) => (
                      <SortableItem key={report.id} report={report} />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

// ── Item arrastrable ────────────────────────────────────────────────────
function SortableItem({ report }: { report: Report }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: report.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const childCount = report._count?.children ?? 0;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 border rounded-lg bg-white dark:bg-sidebar-main',
        isDragging
          ? 'border-sidebar-accent shadow-md'
          : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-sidebar-main/60',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-400 dark:text-gray-500 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60 rounded"
        aria-label={`Arrastrar ${report.titulo}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {report.padreId && (
        <ChevronRight className="w-3 h-3 text-sidebar-accent flex-shrink-0" />
      )}
      <span className="flex-1 text-sm text-slate-700 dark:text-gray-200 truncate">
        {report.titulo}
      </span>
      {childCount > 0 && (
        <span className="text-[10px] bg-sidebar-accent/20 text-sidebar-accent px-1.5 py-0.5 rounded-full flex-shrink-0">
          {childCount} sub
        </span>
      )}
      {!report.activo && (
        <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
          inactivo
        </span>
      )}
    </li>
  );
}
