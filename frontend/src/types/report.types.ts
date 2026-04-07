import type { PaginatedMeta } from './user.types';

export interface ReportRole {
  rolId: number;
  rol: { rolDescripcion: string };
}

export interface ReportUserAccess {
  usuarioId: number;
  usuario?: {
    id: number;
    email: string;
    nombreCompleto: string;
  };
}

export interface Report {
  id: number;
  titulo: string;
  descripcion: string | null;
  urlIframe: string;
  activo: boolean;
  fechaRegistro: string;
  padreId: number | null;
  reportesRoles: ReportRole[];
  reportesUsuarios?: ReportUserAccess[];
  children?: Report[];
  padre?: { id: number; titulo: string } | null;
  _count?: { children: number };
}


export interface CreateReportPayload {
  titulo: string;
  urlIframe: string;
  descripcion?: string;
  rolesIds: number[];
  usuariosIds?: number[];
  activo?: boolean;
  padreId?: number | null;
}

export interface UpdateReportPayload {
  titulo?: string;
  urlIframe?: string;
  descripcion?: string;
  rolesIds?: number[];
  usuariosIds?: number[];
  activo?: boolean;
  padreId?: number | null;
}

export interface PaginatedReports {
  data: Report[];
  meta: PaginatedMeta;
}

export interface ReportListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  activo?: boolean;
}
