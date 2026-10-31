/**
 * Escala em degraus: tints de #0E4286 (mais escuro = mais registros).
 * Buckets: 0 | 1 | 2–3 | 4–6 | 7+
 */

export type CountBucket = 0 | 1 | 2 | 3 | 4;

export interface BucketDef {
  bucket: CountBucket;
  label: string;
  fill: string;
  min: number;
  max: number;
}

/** Base (mais escura) pedida: #0E4286 */
export const INTENSITY_BASE = "#0E4286";

export const COUNT_BUCKETS: BucketDef[] = [
  { bucket: 0, label: "0", fill: "#C9D9EB", min: 0, max: 0 },
  { bucket: 1, label: "1", fill: "#8FB0D9", min: 1, max: 1 },
  { bucket: 2, label: "2–3", fill: "#5A8BC4", min: 2, max: 3 },
  { bucket: 3, label: "4–6", fill: "#2F67A8", min: 4, max: 6 },
  { bucket: 4, label: "7+", fill: INTENSITY_BASE, min: 7, max: Infinity },
];

export function countToBucket(count: number): CountBucket {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function countToFill(count: number): string {
  const bucket = countToBucket(count);
  return COUNT_BUCKETS.find((b) => b.bucket === bucket)!.fill;
}
