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
