-- Crear tabla de unión cex_reportes_roles
CREATE TABLE IF NOT EXISTS cex_reportes_roles (
  reporte_id INTEGER NOT NULL,
  rol_id     INTEGER NOT NULL,
  PRIMARY KEY (reporte_id, rol_id),
  CONSTRAINT fk_reporte FOREIGN KEY (reporte_id) REFERENCES cex_reportes(id) ON DELETE CASCADE,
  CONSTRAINT fk_rol     FOREIGN KEY (rol_id)     REFERENCES cex_roles(id)    ON DELETE CASCADE
);

-- Migrar datos existentes: copiar rol_minimo_id de cada reporte a la tabla de unión
INSERT INTO cex_reportes_roles (reporte_id, rol_id)
SELECT id, rol_minimo_id
FROM cex_reportes
WHERE rol_minimo_id IS NOT NULL
ON CONFLICT DO NOTHING;
