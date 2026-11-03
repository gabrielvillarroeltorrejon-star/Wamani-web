export const DESTINATIONS_MAP: Record<string, string> = {
  'dest-pucon': 'Pucón',
  'dest-panguipulli': 'Huilo Huilo / Panguipulli',
  'dest-atacama': 'San Pedro de Atacama',
  'dest-patagonia': 'Torres del Paine',
  'dest-cajon-maipo': 'Cajón del Maipo'
};

export const formatDestinationName = (destIdOrName?: string): string => {
  if (!destIdOrName) return 'Chile';
  const clean = destIdOrName.trim();
  if (DESTINATIONS_MAP[clean]) return DESTINATIONS_MAP[clean];
  if (DESTINATIONS_MAP[clean.toLowerCase()]) return DESTINATIONS_MAP[clean.toLowerCase()];
  
  // Si viene con prefijo dest-, formatearlo amigablemente
  if (clean.startsWith('dest-')) {
    const raw = clean.replace(/^dest-/, '').replace(/-/g, ' ');
    return raw.replace(/\b\w/g, char => char.toUpperCase());
  }
  
  return clean;
};

export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
};

export const formatDifficulty = (diff?: string): string => {
  if (!diff) return 'Fácil';
  const map: Record<string, string> = {
    easy: 'Fácil',
    moderate: 'Moderada',
    hard: 'Exigente (Alta)',
    expert: 'Desafiante'
  };
  return map[diff.toLowerCase()] || diff;
};
