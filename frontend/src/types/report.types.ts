import type { PaginatedMeta } from './user.types';

export interface ReportRole {
  rolId: number;
  rol: { rolDescripcion: string };
}

export interface Report {
  id: number;
  titulo: string;
  descripcion: string | null;
  urlIframe: string;
  activo: boolean;
  fechaRegistro: string;
  reportesRoles: ReportRole[];
}

export interface CreateReportPayload {
  titulo: string;
  urlIframe: string;
  descripcion?: string;
  rolesIds: number[];
  activo?: boolean;
}

export interface UpdateReportPayload {
  titulo?: string;
  urlIframe?: string;
  descripcion?: string;
  rolesIds?: number[];
  activo?: boolean;
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
