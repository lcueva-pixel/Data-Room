export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogActivityRecord {
  usuarioId?: number | null;
  accion: string;
  detalle?: string;
  nivel?: LogLevel;
}
