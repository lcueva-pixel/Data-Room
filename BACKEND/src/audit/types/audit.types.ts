export interface AuditAccessRecord {
  usuarioId: number;
  userAgent?: string;
}

export interface UnifiedAuditEntry {
  id: string;
  tipo: 'ACCESO' | 'VISUALIZACION';
  fechaHora: Date;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
  reporte?: {
    titulo: string;
  };
  duracion?: number;
}
