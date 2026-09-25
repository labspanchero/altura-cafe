-- Carta traída del CMS de Webflow. "cambiado" solo avanza cuando el contenido cambia.
CREATE TABLE IF NOT EXISTS carta (
  id INTEGER PRIMARY KEY,
  datos TEXT NOT NULL,
  huella TEXT NOT NULL,
  leido INTEGER NOT NULL,
  cambiado INTEGER NOT NULL
);
