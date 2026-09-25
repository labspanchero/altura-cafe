// Lotes de muestra, ficticios. Orígenes, variedades y procesos son categorías
// reales; fincas, productores, puntajes y notas son ilustrativos.

export type Metodo =
  | "espresso"
  | "moka"
  | "aeropress"
  | "v60"
  | "chemex"
  | "prensa"
  | "coldbrew";

export type Perfil = "floral" | "frutal" | "chocolate" | "caramelo";

export type Receta = {
  metodo: Metodo;
  molienda: string;
  dosis: string;
  agua: string;
  temperatura: string;
  tiempo: string;
};

export type Cafe = {
  id: string;
  lote: string;
  pais: string;
  region: string;
  finca: string;
  productor: string;
  altitud: number;
  variedad: string;
  proceso: string;
  secado: string;
  tueste: "Claro" | "Medio claro" | "Medio" | "Medio oscuro";
  puntaje: number;
  cosecha: string;
  tinta: string;
  tintaClara: string;
  notas: string[];
  aroma: string;
  perfil: Perfil[];
  sensorial: { acidez: number; cuerpo: number; dulzor: number; amargor: number };
  conLeche: boolean;
  recetas: Receta[];
  historia: string;
};

export const METODOS: Record<Metodo, { nombre: string; molienda: string; micras: string }> = {
  espresso: { nombre: "Espresso", molienda: "Fina", micras: "200–300 µm" },
  moka: { nombre: "Moka", molienda: "Fina a media", micras: "300–450 µm" },
  aeropress: { nombre: "AeroPress", molienda: "Media fina", micras: "450–600 µm" },
  v60: { nombre: "V60", molienda: "Media fina", micras: "550–700 µm" },
  chemex: { nombre: "Chemex", molienda: "Media", micras: "700–850 µm" },
  prensa: { nombre: "Prensa francesa", molienda: "Gruesa", micras: "900–1100 µm" },
  coldbrew: { nombre: "Cold brew", molienda: "Extra gruesa", micras: "1200+ µm" },
};

export const METODOS_ORDEN: Metodo[] = [
  "espresso",
  "moka",
  "aeropress",
  "v60",
  "chemex",
  "prensa",
  "coldbrew",
];

export const CAFES: Cafe[] = [
  {
    id: "etiopia-guji",
    lote: "ALT-07",
    pais: "Etiopía",
    region: "Guji, Hambela",
    finca: "Estación de lavado Buku",
    productor: "Pequeños productores de Buku",
    altitud: 2150,
    variedad: "Heirloom (variedades locales)",
    proceso: "Lavado",
    secado: "Camas africanas, 12 días",
    tueste: "Claro",
    puntaje: 88.5,
    cosecha: "2025/26",
    tinta: "#1f4fd1",
    tintaClara: "#7a9bff",
    notas: ["Jazmín", "Durazno blanco", "Bergamota"],
    aroma: "Floral intenso, flor de azahar y té negro",
    perfil: ["floral", "frutal"],
    sensorial: { acidez: 5, cuerpo: 2, dulzor: 4, amargor: 1 },
    conLeche: false,
    recetas: [
      { metodo: "v60", molienda: "Media fina", dosis: "15 g", agua: "250 g", temperatura: "94 °C", tiempo: "2:45" },
      { metodo: "chemex", molienda: "Media", dosis: "30 g", agua: "500 g", temperatura: "94 °C", tiempo: "4:30" },
    ],
    historia:
      "Cerezas de parcelas de menos de una hectárea, recolectadas a mano en su punto justo y lavadas con agua de vertiente.",
  },
  {
    id: "kenia-nyeri",
    lote: "ALT-12",
    pais: "Kenia",
    region: "Nyeri",
    finca: "Cooperativa Gatomboya",
    productor: "Socios de la cooperativa",
    altitud: 1850,
    variedad: "SL28 y SL34",
    proceso: "Lavado, doble fermentación",
    secado: "Camas africanas, 14 días",
    tueste: "Claro",
    puntaje: 87.75,
    cosecha: "2025/26",
    tinta: "#c8202f",
    tintaClara: "#ff6b76",
    notas: ["Grosella negra", "Pomelo rosado", "Tomate"],
    aroma: "Frutos rojos y hoja de tomate",
    perfil: ["frutal"],
    sensorial: { acidez: 5, cuerpo: 3, dulzor: 3, amargor: 2 },
    conLeche: false,
    recetas: [
      { metodo: "aeropress", molienda: "Media fina", dosis: "15 g", agua: "220 g", temperatura: "92 °C", tiempo: "2:00" },
      { metodo: "v60", molienda: "Media fina", dosis: "15 g", agua: "250 g", temperatura: "93 °C", tiempo: "2:50" },
    ],
    historia:
      "La doble fermentación, con un remojo largo tras el lavado, da la acidez jugosa típica de las SL.",
  },
  {
    id: "panama-geisha",
    lote: "ALT-03",
    pais: "Panamá",
    region: "Boquete, Chiriquí",
    finca: "Finca Los Nubarrones",
    productor: "Familia Aguilar",
    altitud: 1650,
    variedad: "Geisha",
    proceso: "Natural",
    secado: "Camas elevadas a la sombra, 21 días",
    tueste: "Claro",
    puntaje: 90.25,
    cosecha: "2025/26",
    tinta: "#e5601c",
    tintaClara: "#ff9a5c",
    notas: ["Mango", "Jazmín", "Té de durazno"],
    aroma: "Frutas tropicales maduras y flores blancas",
    perfil: ["floral", "frutal"],
    sensorial: { acidez: 4, cuerpo: 3, dulzor: 5, amargor: 1 },
    conLeche: false,
    recetas: [
      { metodo: "v60", molienda: "Media fina", dosis: "15 g", agua: "240 g", temperatura: "93 °C", tiempo: "2:40" },
      { metodo: "chemex", molienda: "Media", dosis: "30 g", agua: "480 g", temperatura: "93 °C", tiempo: "4:15" },
    ],
    historia:
      "La cereza se seca entera, con la pulpa pegada al grano, y eso le da la fruta madura y el dulzor de miel.",
  },
  {
    id: "colombia-huila",
    lote: "ALT-21",
    pais: "Colombia",
    region: "Huila, Pitalito",
    finca: "Finca El Mirador",
    productor: "Marta Liliana Cruz",
    altitud: 1750,
    variedad: "Caturra y Castillo",
    proceso: "Lavado",
    secado: "Marquesina, 10 días",
    tueste: "Medio claro",
    puntaje: 86.5,
    cosecha: "2026",
    tinta: "#0f7a3a",
    tintaClara: "#4fcf7e",
    notas: ["Panela", "Naranja", "Cacao"],
    aroma: "Caramelo y cítricos dulces",
    perfil: ["caramelo", "frutal"],
    sensorial: { acidez: 3, cuerpo: 3, dulzor: 4, amargor: 2 },
    conLeche: true,
    recetas: [
      { metodo: "v60", molienda: "Media fina", dosis: "15 g", agua: "250 g", temperatura: "93 °C", tiempo: "3:00" },
      { metodo: "espresso", molienda: "Fina", dosis: "18 g", agua: "38 g", temperatura: "93 °C", tiempo: "0:28" },
      { metodo: "moka", molienda: "Fina a media", dosis: "16 g", agua: "160 g", temperatura: "Agua caliente", tiempo: "4:00" },
    ],
    historia:
      "Un café de todos los días que rinde con cualquier método: dulce en filtro y redondo en espresso con leche.",
  },
  {
    id: "guatemala-huehue",
    lote: "ALT-15",
    pais: "Guatemala",
    region: "Huehuetenango",
    finca: "Finca La Esperanza",
    productor: "Cooperativa Todosanterita",
    altitud: 1700,
    variedad: "Bourbon",
    proceso: "Lavado",
    secado: "Patio, 9 días",
    tueste: "Medio",
    puntaje: 85.75,
    cosecha: "2026",
    tinta: "#6b2fb3",
    tintaClara: "#bb95f5",
    notas: ["Chocolate con leche", "Manzana roja", "Almendra"],
    aroma: "Cacao tostado y fruta de pepita",
    perfil: ["chocolate", "caramelo"],
    sensorial: { acidez: 3, cuerpo: 4, dulzor: 4, amargor: 3 },
    conLeche: true,
    recetas: [
      { metodo: "espresso", molienda: "Fina", dosis: "18 g", agua: "36 g", temperatura: "93 °C", tiempo: "0:27" },
      { metodo: "aeropress", molienda: "Media fina", dosis: "16 g", agua: "220 g", temperatura: "90 °C", tiempo: "1:45" },
      { metodo: "prensa", molienda: "Gruesa", dosis: "30 g", agua: "500 g", temperatura: "94 °C", tiempo: "4:00" },
    ],
    historia:
      "Los vientos cálidos que suben desde México protegen del frío a estas laderas altas y dan un café de mucho cuerpo.",
  },
  {
    id: "brasil-mogiana",
    lote: "ALT-30",
    pais: "Brasil",
    region: "Alta Mogiana, São Paulo",
    finca: "Fazenda Santa Clara",
    productor: "Família Andrade",
    altitud: 1150,
    variedad: "Catuaí amarillo",
    proceso: "Natural",
    secado: "Patio y secador de tambor, 18 días",
    tueste: "Medio oscuro",
    puntaje: 84.5,
    cosecha: "2026",
    tinta: "#d9a90b",
    tintaClara: "#f2c94c",
    notas: ["Maní tostado", "Chocolate amargo", "Caramelo"],
    aroma: "Nuez tostada y dulce de leche",
    perfil: ["chocolate", "caramelo"],
    sensorial: { acidez: 1, cuerpo: 5, dulzor: 4, amargor: 4 },
    conLeche: true,
    recetas: [
      { metodo: "espresso", molienda: "Fina", dosis: "18 g", agua: "36 g", temperatura: "92 °C", tiempo: "0:26" },
      { metodo: "moka", molienda: "Fina a media", dosis: "16 g", agua: "160 g", temperatura: "Agua caliente", tiempo: "4:00" },
      { metodo: "coldbrew", molienda: "Extra gruesa", dosis: "100 g", agua: "1000 g", temperatura: "Agua fría", tiempo: "16 h" },
    ],
    historia:
      "Cosecha mecanizada en colinas suaves y secado al sol con la cereza entera: la base clásica de un espresso de chocolate.",
  },
];

export function getCafe(id: string) {
  return CAFES.find((c) => c.id === id);
}
