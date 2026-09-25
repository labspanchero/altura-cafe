-- Métricas livianas para el panel en vivo: último aviso de Webflow, cantidad de avisos y latencia del CMS.
CREATE TABLE IF NOT EXISTS eventos (
  clave TEXT PRIMARY KEY,
  valor INTEGER NOT NULL,
  cuando INTEGER NOT NULL
);
