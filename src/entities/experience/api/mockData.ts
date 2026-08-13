import type { Experience } from '../model/schemas';

const baseTemplates: Partial<Experience>[] = [
  {
    title: 'Termas Pucón Indómito + Sunset en Lancha',
    subtitle: 'Navegación y relajo',
    summary: 'Relájate en aguas termales exclusivas y finaliza tu día con un atardecer inolvidable navegando por el lago Villarrica.',
    description: 'Una experiencia de desconexión total. Comenzaremos sumergiéndonos en las cálidas aguas de las Termas Pucón Indómito, rodeadas de bosque nativo. Luego, nos trasladaremos al muelle para disfrutar de una navegación al atardecer, donde podrás apreciar el volcán Villarrica mientras el sol se esconde.',
    destinationId: 'dest-pucon',
    categories: ['Relajo', 'Navegación'],
    tags: ['Termas', 'Sunset'],
    difficulty: 'easy',
    schedule: '14:00 - 20:00',
    restrictions: ['No apto para mujeres embarazadas en piscinas de alta temperatura'],
    pricing: { basePrice: 65000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', alt: 'Termas' },
    itinerary: [
      { dayOrTime: '14:00', title: 'Pick up', description: 'Recogida en hotel y traslado a Termas.' },
      { dayOrTime: '15:00', title: 'Relajo Termal', description: 'Tiempo libre en piscinas termales Pucón Indómito.' },
      { dayOrTime: '18:00', title: 'Navegación', description: 'Paseo en lancha por el Lago Villarrica durante el atardecer.' }
    ],
    included: ['Traslado ida y vuelta', 'Entrada a Termas', 'Paseo en lancha de 1 hora', 'Snack y bebida (pisco sour o espumante)'],
    notIncluded: ['Propinas', 'Toallas extras', 'Almuerzo']
  },
  {
    title: 'Ascenso al Volcán Villarrica',
    subtitle: 'Desafío en las alturas',
    summary: 'Conquista uno de los volcanes más activos de Sudamérica y maravíllate con la vista panorámica del cráter humeante.',
    description: 'Asciende los 2.847 metros del Volcán Villarrica. Una jornada exigente pero gratificante, guiada por expertos montañistas. Disfrutarás de vistas 360° de la región de los lagos y volcanes, finalizando con un divertido descenso en trineos por la nieve.',
    destinationId: 'dest-pucon',
    categories: ['Aventura', 'Montaña'],
    tags: ['Trekking', 'Volcán', 'Nieve'],
    difficulty: 'hard',
    schedule: '06:00 - 15:00',
    restrictions: ['Salud física compatible', 'Mayores de 14 años'],
    pricing: { basePrice: 120000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80', alt: 'Volcán' },
    itinerary: [
      { dayOrTime: '06:00', title: 'Encuentro', description: 'Revisión de equipo y traslado a la base del volcán.' },
      { dayOrTime: '07:30', title: 'Ascenso', description: 'Inicio de la caminata hacia el cráter (4-5 horas).' },
      { dayOrTime: '12:30', title: 'Cumbre', description: 'Tiempo para fotografías y observación del cráter.' },
      { dayOrTime: '13:00', title: 'Descenso', description: 'Bajada deslizándose en nieve.' }
    ],
    included: ['Transporte', 'Guía de montaña certificado UIAGM', 'Equipo completo (piolet, crampones, casco, ropa)', 'Seguro de accidentes'],
    notIncluded: ['Ticket de andarivel (opcional)', 'Alimentación (raciones de marcha)', 'Agua']
  },
  {
    title: 'Ruta de los Lagos Andinos',
    subtitle: 'Paisajes de ensueño',
    summary: 'Recorre la espectacular ruta escénica de los siete lagos, descubriendo cascadas ocultas y bosques milenarios.',
    description: 'Un viaje contemplativo ideal para la fotografía. Visitaremos reservas naturales y parques nacionales, deteniéndonos en miradores estratégicos. Podrás caminar por senderos de baja dificultad rodeados de araucarias centenarias.',
    destinationId: 'dest-panguipulli',
    categories: ['Naturaleza', 'Fotografía'],
    tags: ['Lagos', 'Flora', 'Miradores'],
    difficulty: 'easy',
    schedule: '09:00 - 18:00',
    restrictions: ['Ninguna'],
    pricing: { basePrice: 45000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', alt: 'Lagos' },
    itinerary: [
      { dayOrTime: '09:00', title: 'Salida', description: 'Salida desde Pucón por la ruta internacional.' },
      { dayOrTime: '11:00', title: 'Saltos y Cascadas', description: 'Visita a Ojos del Caburgua y Salto del Claro.' },
      { dayOrTime: '14:00', title: 'Almuerzo libre', description: 'Parada en pintoresco pueblo cordillerano.' }
    ],
    included: ['Transporte privado', 'Guía bilingüe', 'Entrada a Parques Nacionales'],
    notIncluded: ['Almuerzo en restaurante local', 'Propinas']
  }
];

export const mockExperiences: Experience[] = Array.from({ length: 30 }).map((_, index) => {
  const templateIndex = index % baseTemplates.length;
  const template = baseTemplates[templateIndex];
  const isFeatured = index < 9; // For the first 9, we can treat them as 'destacados' implicitly if we want, or just randomize
  
  // Create variations to make them look distinct in a grid
  const id = `exp-00${index + 1}`;
  const priceVariations = [1, 1.2, 0.8, 1.5, 0.9];
  const basePrice = template.pricing!.basePrice * priceVariations[index % priceVariations.length];

  return {
    ...template,
    id,
    slug: `tour-${index + 1}`,
    status: 'active',
    title: `${template.title} ${isFeatured ? 'Premium' : ''} ${index > 2 ? `V${index}` : ''}`,
    coordinates: { lat: -39.2743, lng: -71.9774 },
    duration: { value: 6, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', alt: 'Termas' },
      { url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80', alt: 'Volcán' },
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80', alt: 'Lagos' }
    ],
    pricing: {
      basePrice,
      currency: 'CLP'
    },
    meetingPoint: 'Oficina Wamani, Centro de Pucón',
    cancellationPolicy: 'Cancelación gratuita con 48 hrs de anticipación.'
  } as Experience;
});
