export interface AuditEntry {
  id: string;
  tipo: 'ACCESO' | 'VISUALIZACION';
  fechaHora: string;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
  reporte?: {
    titulo: string;
  };
  duracion?: number;
}

export interface PaginatedAudit {
  data: AuditEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
