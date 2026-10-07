import type { Experience } from '../model/schemas';

const baseTemplates: Partial<Experience>[] = [
  {
    title: 'Termas Pucón Indómito + Sunset en Lancha',
    subtitle: 'Navegación y relajo',
    summary: 'Relájate en aguas termales exclusivas y finaliza tu día con un atardecer inolvidable navegando por el lago Villarrica.',
    description: 'Una experiencia de desconexión total. Comenzaremos sumergiéndonos en las cálidas aguas de las Termas Pucón Indómito, rodeadas de bosque nativo. Luego, nos trasladaremos al muelle para disfrutar de una navegación al atardecer, donde podrás apreciar el volcán Villarrica mientras el sol se esconde.',
    destinationId: 'dest-pucon',
    macroZone: 'sur',
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
    macroZone: 'sur',
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
    macroZone: 'sur',
    categories: ['Naturaleza', 'Fotografía'],
    tags: ['Lagos', 'Flora', 'Miradores'],
    difficulty: 'easy',
    schedule: '09:00 - 18:00',
    restrictions: ['Ninguna'],
    pricing: { basePrice: 45000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', alt: 'Lagos' },
    itinerary: [
      { dayOrTime: '09:00', title: 'Salida', description: 'Salida desde Pucón por la ruta escénica de los lagos.' },
      { dayOrTime: '11:00', title: 'Saltos y Cascadas', description: 'Visita a Ojos del Caburgua y Saltos del Huilo Huilo.' },
      { dayOrTime: '14:00', title: 'Almuerzo y Navegación', description: 'Parada en pintoresco muelle lacustre.' }
    ],
    included: ['Transporte privado climatizado', 'Guía bilingüe certificado', 'Entrada a Parques y Reservas'],
    notIncluded: ['Almuerzo en restaurante local', 'Propinas']
  },
  {
    title: 'Geysers del Tatio & Salares de Atacama',
    subtitle: 'Misticismo en el desierto más árido del mundo',
    summary: 'Amanece a más de 4.200 msnm presenciando impresionantes fumarolas geotérmicas y fauna andina en el altiplano chileno.',
    description: 'Una expedición de madrugada para presenciar el despertar de los géiseres más altos del planeta en San Pedro de Atacama. Observaremos vicuñas, flamencos andinos y concluiremos con un baño termal en pozas naturales bajo el cielo del desierto.',
    destinationId: 'dest-atacama',
    macroZone: 'norte',
    categories: ['Altiplano', 'Aventura'],
    tags: ['Atacama', 'Geysers', 'Desierto', 'Termas'],
    difficulty: 'moderate',
    schedule: '05:00 - 13:00',
    restrictions: ['Aclimatación previa recomendada (altitud > 4.000m)'],
    pricing: { basePrice: 75000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', alt: 'Atacama' },
    itinerary: [
      { dayOrTime: '05:00', title: 'Pick up en San Pedro', description: 'Salida de madrugada hacia el campo geotérmico.' },
      { dayOrTime: '07:00', title: 'Geysers al Alba', description: 'Recorrido guiado entre fumarolas al amanecer con desayuno campestre.' },
      { dayOrTime: '10:30', title: 'Bofedal de Machuca', description: 'Avistamiento de aves andinas y arquitectura colonial atacameña.' }
    ],
    included: ['Transporte 4x4 especializado', 'Desayuno buffet caliente en terreno', 'Guía local con certificación WFR'],
    notIncluded: ['Ticket de ingreso a Parque Geotérmico', 'Propinas']
  },
  {
    title: 'Trekking Base Torres del Paine & Glaciares',
    subtitle: 'El icono legendario de la Patagonia Austral',
    summary: 'Emprende el trekking más codiciado del planeta hasta el mirador de las imponentes tres torres de granito.',
    description: 'Un hito imperdible en el Parque Nacional Torres del Paine. Cruzaremos el Valle del Ascencio, bosques de lenga milenarios y la morrena final hasta contemplar la laguna de aguas turquesas al pie de los míticos cuernos y torres de granito.',
    destinationId: 'dest-patagonia',
    macroZone: 'patagonia',
    categories: ['Patagonia', 'Trekking Extremo'],
    tags: ['Torres del Paine', 'Glaciares', 'Patagonia', 'Montaña'],
    difficulty: 'hard',
    schedule: '06:30 - 19:30',
    restrictions: ['Buen estado físico, apto desde 16 años'],
    pricing: { basePrice: 145000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80', alt: 'Torres del Paine' },
    itinerary: [
      { dayOrTime: '06:30', title: 'Traslado al Parque', description: 'Encuentro en Puerto Natales y entrada al Parque Nacional.' },
      { dayOrTime: '08:30', title: 'Ascenso Valle Ascencio', description: 'Inicio de sendero hacia Refugio Chileno.' },
      { dayOrTime: '13:00', title: 'Mirador Base Torres', description: 'Descanso, almuerzo de marcha frente a las tres torres y laguna.' },
      { dayOrTime: '15:00', title: 'Descenso', description: 'Retorno seguro hacia el transporte.' }
    ],
    included: ['Transporte ida y vuelta desde Puerto Natales', 'Guía de montaña certificado', 'Bastones de trekking', 'Seguro de rescate'],
    notIncluded: ['Ticket de ingreso a Parque Nacional Torres del Paine (CONAF)', 'Ración de marcha']
  },
  {
    title: 'Glaciar El Morado & Termas de Colina',
    subtitle: 'Alta cordillera y aguas termales en la Zona Central',
    summary: 'Aventúrate en la Cordillera de los Andes central y relájate en pozas termales con vistas a cumbres de más de 5.000 metros.',
    description: 'A solo horas de Santiago, el Cajón del Maipo ofrece paisajes cordilleranos sobrecogedores. Una caminata interpretativa hacia glaciares andinos culminando con baños termales terapéuticos al aire libre.',
    destinationId: 'dest-cajon-maipo',
    macroZone: 'centro',
    categories: ['Cordillera', 'Termas'],
    tags: ['Santiago', 'Andes', 'Cajón del Maipo', 'Termas'],
    difficulty: 'moderate',
    schedule: '07:30 - 18:30',
    restrictions: ['Salud compatible para altura moderada'],
    pricing: { basePrice: 60000, currency: 'CLP' },
    coverImage: { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', alt: 'Cordillera de los Andes' },
    itinerary: [
      { dayOrTime: '07:30', title: 'Pick up Santiago / San José', description: 'Traslado cordillerano por la cuenca del Río Maipo.' },
      { dayOrTime: '10:00', title: 'Trekking Mirador Glaciar', description: 'Caminata guiada con vistas al volcán San José y glaciar.' },
      { dayOrTime: '14:30', title: 'Termas de Colina', description: 'Baño en pozas escalonadas de agua volcánica y picoteo chileno.' }
    ],
    included: ['Transporte ida y vuelta', 'Entrada a Termas de Colina', 'Guía cordillerano', 'Picoteo gourmet con vino chileno'],
    notIncluded: ['Almuerzo principal', 'Propinas']
  }
];

export const mockExperiences: Experience[] = Array.from({ length: 30 }).map((_, index) => {
  const templateIndex = index % baseTemplates.length;
  const template = baseTemplates[templateIndex];
  const isFeatured = index < 9;
  
  // Create variations to make them look distinct in a grid
  const id = `exp-00${index + 1}`;
  const priceVariations = [1, 1.15, 0.9, 1.25, 0.95];
  const basePrice = Math.round((template.pricing!.basePrice * priceVariations[index % priceVariations.length]) / 1000) * 1000;

  return {
    ...template,
    id,
    slug: `tour-${index + 1}`,
    status: 'active',
    macroZone: template.macroZone || 'sur',
    title: `${template.title} ${isFeatured ? 'Expedition' : ''} ${index > 5 ? `· Nivel ${Math.floor(index / 6) + 1}` : ''}`,
    coordinates: template.coordinates || { lat: -39.2743, lng: -71.9774 },
    duration: template.duration || { value: 6, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    gallery: [
      template.coverImage!,
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', alt: 'Expedición Chile 1' },
      { url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80', alt: 'Expedición Chile 2' }
    ],
    pricing: {
      basePrice,
      currency: 'CLP'
    },
    meetingPoint: template.destinationId === 'dest-atacama' 
      ? 'Plaza de San Pedro de Atacama' 
      : template.destinationId === 'dest-patagonia' 
        ? 'Terminal de Puerto Natales / Hotel' 
        : template.destinationId === 'dest-cajon-maipo'
          ? 'Metro Los Héroes / Plaza Baquedano (Santiago)'
          : 'Oficina Wamani, Centro de Pucón',
    cancellationPolicy: 'Cancelación gratuita con 48 hrs de anticipación (Reembolso 100%).'
  } as Experience;
});

