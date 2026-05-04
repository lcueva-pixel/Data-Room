WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(padre_id, -1)
      ORDER BY id ASC
    ) AS rn
  FROM cex_reportes
)
UPDATE cex_reportes r
SET    order_index = ordered.rn
FROM   ordered
WHERE  r.id = ordered.id;
