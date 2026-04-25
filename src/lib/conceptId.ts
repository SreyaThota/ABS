// Generates a short readable concept ID like "ASYM-CRYPT-7K2"
const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "and", "or", "for", "on", "with",
  "is", "are", "by", "at", "from", "as", "intro", "introduction",
]);

export function makeConceptId(title: string): string {
  const words = (title || "concept")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

  const picked = (words.length ? words : ["concept"]).slice(0, 2);
  const slug = picked
    .map((w) => w.slice(0, 5).toUpperCase())
    .join("-");

  // 3-char base36 hash from title + timestamp
  let h = 0;
  const seed = title + Date.now().toString();
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const tail = h.toString(36).toUpperCase().slice(0, 3).padStart(3, "0");

  return `${slug}-${tail}`;
}
