export const DESTINATIONS_MAP: Record<string, string> = {
  'dest-cordillera-santiago': 'Cordillera de Santiago',
  'dest-portillo': 'Portillo y Laguna del Inca',
  'dest-valparaiso-vina': 'Valparaíso y Viña del Mar',
  'dest-concha-y-toro': 'Viña Concha y Toro',
  'dest-santiago': 'Santiago',
  'dest-cajon-maipo': 'Cajón del Maipo',
  'dest-casablanca': 'Valle de Casablanca',
  'dest-undurraga': 'Viña Undurraga',
  'dest-santa-rita': 'Viña Santa Rita',
  'dest-parque-safari': 'Parque Safari',
  'dest-isla-negra': 'Undurraga, Algarrobo e Isla Negra',
  'dest-alyan': 'Viña Alyan',
  // Nombres directos
  'Cordillera de Santiago': 'Cordillera de Santiago',
  'Portillo y Laguna del Inca': 'Portillo y Laguna del Inca',
  'Valparaíso y Viña del Mar': 'Valparaíso y Viña del Mar',
  'Viña Concha y Toro': 'Viña Concha y Toro',
  'Santiago': 'Santiago',
  'Cajón del Maipo': 'Cajón del Maipo',
  'Valle de Casablanca': 'Valle de Casablanca',
  'Viña Undurraga': 'Viña Undurraga',
  'Viña Santa Rita': 'Viña Santa Rita',
  'Parque Safari': 'Parque Safari',
  'Undurraga, Algarrobo e Isla Negra': 'Undurraga, Algarrobo e Isla Negra',
  'Viña Alyan': 'Viña Alyan'
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

export const formatLanguages = (langs?: string[] | string): string => {
  if (!langs) return 'Español';
  const list = Array.isArray(langs) ? langs : [langs];
  if (list.length === 0) return 'Español';

  const map: Record<string, string> = {
    es: 'Español',
    en: 'Inglés',
    pt: 'Portugués',
    fr: 'Francés',
    de: 'Alemán',
    it: 'Italiano'
  };

  return list
    .map(l => (typeof l === 'string' && map[l.toLowerCase()] ? map[l.toLowerCase()] : l))
    .join(' / ');
};

