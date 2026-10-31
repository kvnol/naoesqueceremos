/**
 * Gera paths SVG do mundo (bloqueado) + UFs do Brasil na mesma projeção,
 * enquadrando a América do Sul / Brasil com vizinhança visível.
 *
 * Uso: node scripts/generate-world-map.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const geoDir = join(root, "tmp/geo");
const outFile = join(root, "src/data/world-map-paths.ts");

const WIDTH = 1600;
const HEIGHT = 1000;
const PAD = 56;
/** Zoom-out relativo ao fit no Brasil (1 = encostado nas bordas). */
const ZOOM_OUT = 0.66;

/** ISO numeric id do Brasil no world-atlas 110m */
const BRAZIL_ISO = "076";

const topo = JSON.parse(
  readFileSync(join(geoDir, "countries-110m.json"), "utf8"),
);
const brazilGeo = JSON.parse(
  readFileSync(join(geoDir, "brazil-states.geojson"), "utf8"),
);

const countries = feature(topo, topo.objects.countries);

/** Sem simplify — @turf/simplify corrompia MultiPolygons (ex.: MA). */
const brazilStates = {
  type: "FeatureCollection",
  features: brazilGeo.features,
};

// Fit no Brasil → zoom-out → recentra o bbox no meio do viewBox
const projection = geoMercator();
projection.fitExtent(
  [
    [PAD, PAD],
    [WIDTH - PAD, HEIGHT - PAD],
  ],
  brazilStates,
);
projection.scale(projection.scale() * ZOOM_OUT);

{
  const measure = geoPath(projection);
  const [[x0, y0], [x1, y1]] = measure.bounds(brazilStates);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const [tx, ty] = projection.translate();
  projection.translate([tx + (WIDTH / 2 - cx), ty + (HEIGHT / 2 - cy)]);
}

const path = geoPath(projection);
const [[bx0, by0], [bx1, by1]] = path.bounds(brazilStates);
console.log(
  `  Brazil bbox px: [${bx0.toFixed(0)},${by0.toFixed(0)}] → [${bx1.toFixed(0)},${by1.toFixed(0)}] center (${((bx0 + bx1) / 2).toFixed(0)}, ${((by0 + by1) / 2).toFixed(0)})`,
);

/** Reduz casas decimais nos paths SVG gerados. */
function compactPath(d) {
  return d.replace(/(-?\d+\.\d+)/g, (n) => {
    const v = Number(n);
    return Number.isFinite(v) ? String(Math.round(v * 10) / 10) : n;
  });
}

const worldPaths = [];
for (const f of countries.features) {
  const id = String(f.id).padStart(3, "0");
  if (id === BRAZIL_ISO) continue; // buraco do Brasil → preenchido pelas UFs
  const d = path(f);
  if (d) worldPaths.push(compactPath(d));
}

const statePaths = {};
const stateCentroids = {};
for (const f of brazilStates.features) {
  const uf = String(f.properties.sigla || "").toUpperCase();
  if (!uf) continue;
  const d = path(f);
  if (!d) continue;
  statePaths[uf] = compactPath(d);
  const c = path.centroid(f);
  if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
    stateCentroids[uf] = {
      x: Math.round(c[0] * 10) / 10,
      y: Math.round(c[1] * 10) / 10,
    };
  }
}

const ufs = Object.keys(statePaths).sort();
if (ufs.length !== 27) {
  console.warn(`Esperado 27 UFs, gerou ${ufs.length}:`, ufs.join(","));
}

const header = `/**
 * Gerado por scripts/generate-world-map.mjs — não editar à mão.
 * Projeção Mercator focada no Brasil; países do mundo bloqueados.
 */
`;

const body = `${header}
export const WORLD_MAP_VIEWBOX = "0 0 ${WIDTH} ${HEIGHT}";

/** Países (exceto Brasil) — fill bloqueado, sem interação. */
export const WORLD_LOCKED_PATHS: string[] = ${JSON.stringify(worldPaths, null, 2)};

/** Contornos dos estados brasileiros (interativos). */
export const BRAZIL_STATE_PATHS: Record<string, string> = ${JSON.stringify(statePaths, null, 2)};

/** Centróides aproximados para siglas/marcadores. */
export const BRAZIL_STATE_CENTROIDS: Record<string, { x: number; y: number }> = ${JSON.stringify(stateCentroids, null, 2)};
`;

mkdirSync(join(root, "src/data"), { recursive: true });
writeFileSync(outFile, body);
console.log(
  `OK → ${outFile}\n  world paths: ${worldPaths.length}\n  UFs: ${ufs.length}\n  viewBox: 0 0 ${WIDTH} ${HEIGHT}`,
);

// sanity: um ponto em SP deve cair no Brasil
const sp = brazilStates.features.find((f) => f.properties.sigla === "SP");
if (sp) {
  const [x, y] = path.centroid(sp);
  console.log(`  SP centroid px: ${x.toFixed(1)}, ${y.toFixed(1)}`);
}
