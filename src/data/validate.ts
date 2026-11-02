export type ArtistRecord = { id: string; name: string; year?: number };
export type InfluenceRecord = { source: string; target: string; confidence: string; evidenceUrl: string; note: string; kind?: string; evidenceType?: string; verificationStatus?: string };
export function validateData(artists: ArtistRecord[], influences: InfluenceRecord[]) {
 const errors: string[] = [], ids = new Set<string>(), pairs = new Set<string>();
 for (const artist of artists) {
  if (!artist.id.trim() || !artist.name.trim()) errors.push('Artista sem id ou nome');
  if (ids.has(artist.id)) errors.push(`ID duplicado: ${artist.id}`);
  ids.add(artist.id);
  if (artist.year !== undefined && (!Number.isInteger(artist.year) || artist.year < 1800 || artist.year > 2100)) errors.push(`Ano inválido: ${artist.id}`);
 }
 for (const edge of influences) {
  const key = `${edge.source}->${edge.target}`;
  if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`Referência inválida: ${key}`);
  if (edge.source === edge.target) errors.push(`Autorrelação: ${key}`);
  if (pairs.has(key)) errors.push(`Relação duplicada: ${key}`);
  pairs.add(key);
  if (!['high', 'medium', 'low'].includes(edge.confidence)) errors.push(`Confiança inválida: ${key}`);
  try { if (new URL(edge.evidenceUrl).protocol !== 'https:') throw Error(); } catch { errors.push(`URL inválida: ${key}`); }
  if (!edge.note.trim()) errors.push(`Nota ausente: ${key}`);
  if (!['secondary', 'artist-statement', 'legacy-unreviewed', 'continuity'].includes(edge.evidenceType ?? '')) errors.push(`Tipo de evidência inválido: ${key}`);
  if (!['verified', 'pending'].includes(edge.verificationStatus ?? '')) errors.push(`Verificação inválida: ${key}`);
  if (edge.kind && edge.kind !== 'continuity') errors.push(`Tipo de relação inválido: ${key}`);
 }
 return errors;
}
