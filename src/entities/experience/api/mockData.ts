import type { Experience } from '../model/schemas';

export const mockExperiences: Experience[] = [
  {
    id: 'exp-001',
    slug: 'andes-panoramico',
    status: 'active',
    macroZone: 'centro',
    title: 'Andes Panorámico',
    subtitle: 'Miradores y la inmensidad de la cordillera',
    summary: 'Asciende por las curvas cordilleranas hasta Farellones, contemplando vistas panorámicas y la inmensidad de los Andes.',
    description: 'Una excursión clásica e imprescindible para conectarse con la Cordillera de los Andes central. Ascendemos a través de la ruta de curvas hacia el pueblo de montaña de Farellones, realizando paradas en miradores estratégicos con vistas sobrecogedoras del valle de Santiago y los macizos andinos. Ideal para toda la familia y amantes de la fotografía de montaña.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Naturaleza', 'Cordillera'],
    tags: ['Farellones', 'Miradores', 'Cordillera'],
    difficulty: 'moderate',
    pricing: { basePrice: 35000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Andes Panorámico'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Andes Panorámico 1' },
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'Andes Panorámico 2' },
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', alt: 'Andes Panorámico 3' }
    ],
    meetingPoint: 'Recogida hotelera / Baquedano y Tobalaba.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '07:30', title: 'Recogida y Encuentro', description: 'Recogida en hotel o punto convenido (Baquedano / Tobalaba).' },
      { dayOrTime: '09:30', title: 'Miradores Panorámicos', description: 'Detención fotográfica en miradores de la ruta a Farellones.' },
      { dayOrTime: '11:30', title: 'Pueblo de Farellones', description: 'Recorrido y tiempo libre en el histórico poblado de montaña.' },
      { dayOrTime: '14:30', title: 'Almuerzo Libre y Vistas', description: 'Tiempo para almorzar y disfrutar el paisaje cordillerano.' },
      { dayOrTime: '17:00', title: 'Retorno a Santiago', description: 'Descenso panorámico y regreso al punto de inicio.' }
    ],
    included: ['Transporte ida y vuelta climatizado', 'Guía profesional bilingüe', 'Seguro de transporte de pasajeros', 'Paradas en miradores panorámicos'],
    notIncluded: ['Almuerzo y bebidas', 'Actividades de nieve con costo adicional', 'Propinas'],
    restrictions: ['Llevar ropa abrigada por capas', 'Calzado cerrado con buen agarre', 'Protector solar y lentes con filtro UV', 'Apto para toda la familia']
  },
  {
    id: 'exp-002',
    slug: 'portillo-y-laguna-del-inca',
    status: 'active',
    macroZone: 'centro',
    title: 'Portillo y Laguna del Inca',
    subtitle: 'Mito, historia y la legendaria laguna color esmeralda',
    summary: 'Descubre el histórico centro de esquí Portillo, la imponente Laguna del Inca y la famosa ruta de los Caracoles con picnic incluido.',
    description: 'Viaja hacia el paso fronterizo Los Libertadores cruzando el Valle de Aconcagua y subiendo la legendaria cuesta Los Caracoles. Al llegar al histórico Hotel Portillo, quedaremos maravillados ante las aguas color esmeralda de la Laguna del Inca, cargadas de leyendas de la realeza incaica. Incluye un agradable picnic campestre con vista a las altas cumbres andinas.',
    destinationId: 'dest-portillo',
    categories: ['Naturaleza', 'Cordillera'],
    tags: ['Portillo', 'Laguna del Inca', 'Picnic'],
    difficulty: 'moderate',
    pricing: { basePrice: 48000, currency: 'CLP' },
    duration: { value: 8.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      alt: 'Portillo y Laguna del Inca'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', alt: 'Portillo 1' },
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', alt: 'Laguna del Inca 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Portillo Cordillera 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '07:00', title: 'Pick up hotelero', description: 'Recogida en hoteles de Santiago hacia el Valle de Aconcagua.' },
      { dayOrTime: '09:30', title: 'Monumento Chacabuco', description: 'Detención histórica y vistas del valle precordillerano.' },
      { dayOrTime: '11:30', title: 'Cuesta Los Caracoles', description: 'Ascenso por la emblemática carretera de alta montaña.' },
      { dayOrTime: '12:30', title: 'Portillo y Laguna del Inca', description: 'Vistas panorámicas de la laguna esmeralda y picnic campestre.' },
      { dayOrTime: '15:30', title: 'Retorno', description: 'Regreso pausado y cómodo hacia Santiago.' }
    ],
    included: ['Transporte turístico ida y vuelta', 'Guía bilingüe acreditado', 'Picnic campestre con vino y snacks', 'Seguro de pasajeros'],
    notIncluded: ['Almuerzo en restaurante de Hotel Portillo', 'Propinas', 'Gastos personales'],
    restrictions: ['Recomendado llevar abrigo cortavientos', 'Protección solar y lentes UV', 'No recomendado para personas con afecciones severas de altura sin aclimatación']
  },
  {
    id: 'exp-003',
    slug: 'valparaiso-y-vina-del-mar',
    status: 'active',
    macroZone: 'centro',
    title: 'Valparaíso y Viña del Mar',
    subtitle: 'Patrimonio de la Humanidad, arte callejero y brisa pacífica',
    summary: 'Recorre los coloridos cerros de Valparaíso, sus históricos funiculares y los encantos costeros y jardines de Viña del Mar.',
    description: 'Una travesía inolvidable hacia el Océano Pacífico. En Valparaíso, ciudad declarada Patrimonio de la Humanidad por la UNESCO, recorreremos sus coloridos cerros Alegre y Concepción, sus escaleras intervenidas con arte urbano y sus históricos ascensores funiculares. Luego avanzaremos hacia la Ciudad Jardín, Viña del Mar, visitando el Reloj de Flores y su atractiva costanera.',
    destinationId: 'dest-valparaiso-vina',
    categories: ['Cultura', 'Ciudad'],
    tags: ['Costa', 'Patrimonio', 'Arte urbano'],
    difficulty: 'moderate',
    pricing: { basePrice: 35000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80',
      alt: 'Valparaíso y Viña del Mar'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80', alt: 'Valparaíso Cerros 1' },
      { url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80', alt: 'Valparaíso Arte 2' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', alt: 'Viña del Mar Costa 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:00', title: 'Salida de Santiago', description: 'Recogida en hoteles y viaje hacia la costa central.' },
      { dayOrTime: '10:30', title: 'Cerros de Valparaíso', description: 'Caminata patrimonial por Cerro Alegre y Concepción.' },
      { dayOrTime: '12:30', title: 'Puerto y Ascensores', description: 'Paseo por el puerto histórico y opción de ascensor tradicional.' },
      { dayOrTime: '14:00', title: 'Viña del Mar y Almuerzo', description: 'Tiempo libre para almuerzo costero en Viña del Mar.' },
      { dayOrTime: '15:30', title: 'Reloj de Flores y Borde Costero', description: 'Fotografías en el icono viñamarino y vista del Pacífico.' },
      { dayOrTime: '17:30', title: 'Retorno a Santiago', description: 'Regreso seguro hacia los hoteles.' }
    ],
    included: ['Transporte privado de turismo', 'Guía profesional bilingüe', 'Paseo guiado por cerros patrimoniales', 'Visita al Reloj de Flores'],
    notIncluded: ['Almuerzo en restaurante', 'Tickets de funicular o museos', 'Propinas'],
    restrictions: ['Calzado cómodo para caminar en pendientes y adoquines', 'Llevar cortavientos para la brisa marina']
  },
  {
    id: 'exp-004',
    slug: 'concha-y-toro-centro-del-vino',
    status: 'active',
    macroZone: 'centro',
    title: 'Concha y Toro: Centro del Vino',
    subtitle: 'Tradición vitivinícola centenaria y la leyenda del Casillero del Diablo',
    summary: 'Visita los centenarios jardines, la casona señorial y la mítica bodega del Casillero del Diablo con degustación guiada.',
    description: 'Adéntrate en la bodega más emblemática de Chile en Pirque, Valle del Maipo. Conoce la antigua residencia de verano de la familia Concha y Toro rodeada de un parque señorial del siglo XIX. Recorre el jardín de variedades de uva y desciende a las misteriosas cavas subterráneas donde nació la famosa leyenda del Casillero del Diablo, acompañado de una exclusiva degustación de vinos premium y copa de regalo.',
    destinationId: 'dest-concha-y-toro',
    categories: ['Vino', 'Cultura'],
    tags: ['Concha y Toro', 'Casillero del Diablo', 'Vino'],
    difficulty: 'moderate',
    pricing: { basePrice: 65000, currency: 'CLP' },
    duration: { value: 5.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
      alt: 'Concha y Toro'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Viñedos Concha y Toro 1' },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cavas Casillero del Diablo 2' },
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Degustación de Vino 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:00', title: 'Salida de Santiago', description: 'Recogida hotelera y traslado hacia Pirque.' },
      { dayOrTime: '10:00', title: 'Llegada a Viña Concha y Toro', description: 'Ingreso al parque patrimonial y casona señorial.' },
      { dayOrTime: '10:30', title: 'Jardín de Variedades', description: 'Paseo por las cepas emblemáticas y explicación ampelográfica.' },
      { dayOrTime: '11:30', title: 'Cavas del Casillero del Diablo', description: 'Descenso a las bodegas subterráneas y show de la leyenda.' },
      { dayOrTime: '12:30', title: 'Degustación y Copa de Regalo', description: 'Cata guiada de 3 vinos selectos y entrega de copa grabada.' },
      { dayOrTime: '14:00', title: 'Retorno a Santiago', description: 'Regreso cómodo a los hoteles.' }
    ],
    included: ['Transporte ida y vuelta con recogida en hotel', 'Ticket de entrada oficial a Viña Concha y Toro', 'Tour guiado por sommelier o guía de viña', 'Degustación de 3 copas de vino premium', 'Copa de regalo grabada'],
    notIncluded: ['Almuerzo o consumos en el Wine Bar', 'Propinas'],
    restrictions: ['Edad mínima para degustación de alcohol: 18 años', 'Menores pueden participar acompañados de adultos']
  },
  {
    id: 'exp-005',
    slug: 'andes-sunset-con-picnic',
    status: 'active',
    macroZone: 'centro',
    title: 'Andes Sunset con picnic',
    subtitle: 'Atardecer de oro sobre el valle de Santiago desde la alta cordillera',
    summary: 'Sube al atardecer a la cordillera para contemplar la caída del sol sobre la ciudad mientras disfrutas de un picnic gourmet con vino chileno.',
    description: 'Una experiencia sensorial inolvidable en las alturas de Farellones. A medida que el sol desciende, la cordillera se tiñe de tonalidades doradas, violetas y rojas. Instalamos un acogedor picnic con tabla de quesos finos, frutos secos y una copa de vino chileno para brindar frente al manto de nubes o la silueta iluminada del valle de Santiago.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Naturaleza', 'Cordillera'],
    tags: ['Sunset', 'Picnic', 'Farellones'],
    difficulty: 'moderate',
    pricing: { basePrice: 40000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Andes Sunset con picnic'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'Andes Sunset 1' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Picnic en la Nieve 2' },
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', alt: 'Atardecer Cordillerano 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '13:00', title: 'Recogida hotelera', description: 'Salida desde Santiago hacia la cordillera.' },
      { dayOrTime: '15:00', title: 'Ascenso Cordillerano', description: 'Paradas escénicas para fotografías en la ruta de curvas.' },
      { dayOrTime: '16:30', title: 'Pueblo de Farellones', description: 'Paseo por las calles de montaña y miradores.' },
      { dayOrTime: '18:00', title: 'Preparación de Mirador', description: 'Instalación de mantas y tabla gourmet en mirador clave.' },
      { dayOrTime: '18:30', title: 'Sunset y Brindis', description: 'Atardecer andino con vinos y picoteo chileno.' },
      { dayOrTime: '20:30', title: 'Descenso a Santiago', description: 'Retorno seguro con la ciudad iluminada en el horizonte.' }
    ],
    included: ['Transporte de turismo ida y vuelta', 'Guía anfitrión cordillerano', 'Picnic gourmet con tabla de quesos y snacks', 'Vino chileno seleccionado', 'Mantas de abrigo para el atardecer'],
    notIncluded: ['Cena completa', 'Propinas'],
    restrictions: ['Llevar abrigo grueso cortavientos para la caída de temperatura', 'Calzado cerrado antideslizante']
  },
  {
    id: 'exp-006',
    slug: 'santiago-historico-y-moderno',
    status: 'active',
    macroZone: 'centro',
    title: 'Santiago histórico y moderno',
    subtitle: 'Del corazón colonial de la Plaza de Armas al vanguardismo de Sanhattan',
    summary: 'Un recorrido completo por los contrastes de la capital: Palacio de La Moneda, centro cívico, cerro Santa Lucía y los barrios vanguardistas del oriente.',
    description: 'Conoce la fascinante evolución de Santiago de Chile en un tour integral. Desde su fundación en el cerro Santa Lucía y el centro cívico con el Palacio de La Moneda y la Catedral Metropolitana, hasta los modernos rascacielos financieros del sector oriente conocidos como "Sanhattan" y los distritos gastronómicos de Providencia y Las Condes.',
    destinationId: 'dest-santiago',
    categories: ['Cultura', 'Ciudad'],
    tags: ['City tour', 'Historia', 'Ciudad'],
    difficulty: 'moderate',
    pricing: { basePrice: 60000, currency: 'CLP' },
    duration: { value: 5.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80',
      alt: 'Santiago histórico y moderno'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80', alt: 'Santiago Skyline 1' },
      { url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80', alt: 'La Moneda 2' },
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', alt: 'Sanhattan Moderno 3' }
    ],
    meetingPoint: 'Recogida hotelera | Salida: 08:00 hrs.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:00', title: 'Recogida hotelera', description: 'Encuentro en hoteles de Santiago.' },
      { dayOrTime: '08:45', title: 'Barrio Cívico y La Moneda', description: 'Recorrido por Plaza de la Constitución y sede de gobierno.' },
      { dayOrTime: '10:30', title: 'Cerro Santa Lucía', description: 'Ascenso a terrazas históricas del cerro fundacional.' },
      { dayOrTime: '11:45', title: 'Parque Forestal y Bellas Artes', description: 'Paseo panorámico por el corredor cultural.' },
      { dayOrTime: '12:30', title: 'Distrito Financiero "Sanhattan"', description: 'Recorrido por los rascacielos y zonas de vanguardia.' },
      { dayOrTime: '13:30', title: 'Retorno a hoteles', description: 'Finalización del tour en alojamiento o punto céntrico.' }
    ],
    included: ['Transporte climatizado de primer nivel', 'Guía turístico certificado bilingüe', 'Recorrido a pie por casco histórico y cerro Santa Lucía', 'Agua mineral a bordo'],
    notIncluded: ['Almuerzo', 'Tickets de museos no especificados', 'Propinas'],
    restrictions: ['Calzado cómodo para caminatas urbanas', 'Cuidado con pertenencias en zonas concurridas']
  },
  {
    id: 'exp-007',
    slug: 'isla-negra-algarrobo-y-vina-undurraga',
    status: 'active',
    macroZone: 'centro',
    title: 'Isla Negra, Algarrobo y Viña Undurraga',
    subtitle: 'Poesía nerudiana frente al oleaje, costa central y viñedos centenarios',
    summary: 'Visita la mítica casa de Pablo Neruda en Isla Negra, admira la costa de Algarrobo y culmina con un tour y degustación en Viña Undurraga.',
    description: 'Un circuito inolvidable que combina literatura, mar y vino chileno. Comenzamos en Isla Negra visitando la fascinante casa-museo de Pablo Neruda, repleta de mascarones de proa y colecciones marinas frente a las olas. Continuamos hacia el balneario de Algarrobo y su afamada bahía, para culminar la tarde en la centenaria Viña Undurraga en Talagante con un tour guiado y degustación de vinos de exportación.',
    destinationId: 'dest-isla-negra',
    categories: ['Cultura', 'Vino'],
    tags: ['Vino', 'Neruda', 'Costa'],
    difficulty: 'moderate',
    pricing: { basePrice: 75000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      alt: 'Isla Negra y Costa'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', alt: 'Isla Negra Océano 1' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Viña Undurraga 2' },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cavas y Vino 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:00', title: 'Salida de Santiago', description: 'Recogida hotelera y traslado hacia el litoral de los poetas.' },
      { dayOrTime: '10:00', title: 'Casa Museo de Isla Negra', description: 'Visita a la residencia marina y colecciones de Pablo Neruda.' },
      { dayOrTime: '12:30', title: 'Algarrobo Costero', description: 'Paseo por la bahía y tiempo para almuerzo de mariscos.' },
      { dayOrTime: '15:00', title: 'Hacia Valle del Maipo', description: 'Viaje hacia Talagante a las bodegas de Undurraga.' },
      { dayOrTime: '16:00', title: 'Tour y Cata en Undurraga', description: 'Degustación de 3 vinos reserva con copa grabada de obsequio.' },
      { dayOrTime: '17:30', title: 'Retorno a Santiago', description: 'Regreso a los alojamientos.' }
    ],
    included: ['Transporte de turismo exclusivo', 'Guía profesional bilingüe', 'Ticket de ingreso y degustación en Viña Undurraga', 'Copa de degustación grabada'],
    notIncluded: ['Ticket de ingreso a Museo Neruda (opcional en boletería)', 'Almuerzo', 'Propinas'],
    restrictions: ['Verificar disponibilidad de entradas a Museo Neruda en temporada alta', 'Ropa cómoda y cortaviento']
  },
  {
    id: 'exp-008',
    slug: 'parque-safari-desde-santiago',
    status: 'active',
    macroZone: 'centro',
    title: 'Parque Safari desde Santiago',
    subtitle: 'Encuentro cercano con la vida silvestre y aventura para toda la familia',
    summary: 'Viaja cómodamente desde Santiago al único parque safari de Chile para vivir una experiencia inolvidable con felinos y fauna exótica.',
    description: 'Una emocionante experiencia diseñada para familias y amantes de la naturaleza. Viajamos al sur de Santiago rumbo a Rancagua para ingresar al único Parque Safari de Chile, donde en vehículos especialmente acondicionados y protegidos podrás observar leones y tigres en semilibertad, además de interactuar con animales herbívoros, aves exóticas y dinosaurios animatrónicos en el sector jurásico.',
    destinationId: 'dest-parque-safari',
    categories: ['Naturaleza', 'Recreación'],
    tags: ['Safari', 'Animales', 'Familia'],
    difficulty: 'moderate',
    pricing: { basePrice: 60000, currency: 'CLP' },
    duration: { value: 5.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      alt: 'Parque Safari'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80', alt: 'León Safari 1' },
      { url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80', alt: 'Fauna Silvestre 2' },
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', alt: 'Naturaleza Safari 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:30', title: 'Salida de Santiago', description: 'Recogida hotelera y viaje hacia Rancagua por la Ruta 5 Sur.' },
      { dayOrTime: '10:00', title: 'Llegada a Parque Safari', description: 'Ingreso al recinto y coordinación de expediciones.' },
      { dayOrTime: '10:30', title: 'Safari Grandes Felinos', description: 'Ingreso en camión protegido al hábitat de leones y tigres.' },
      { dayOrTime: '11:45', title: 'Fauna Herbívora y Aviario', description: 'Recorrido libre e interacción con especies exóticas.' },
      { dayOrTime: '13:30', title: 'Tiempo Libre para Snack', description: 'Espacio de cafetería y descanso familiar.' },
      { dayOrTime: '14:00', title: 'Retorno a Santiago', description: 'Regreso cómodo a los hoteles.' }
    ],
    included: ['Transporte ida y vuelta desde Santiago', 'Coordinador de viaje bilingüe', 'Entrada general al Parque Safari', 'Seguro de transporte'],
    notIncluded: ['Ticket específico safari felinos o jurásico no incluido en general', 'Alimentación', 'Propinas'],
    restrictions: ['Seguir estrictamente las normas de seguridad del parque', 'Ideal para todas las edades']
  },
  {
    id: 'exp-009',
    slug: 'vina-undurraga-y-degustacion',
    status: 'active',
    macroZone: 'centro',
    title: 'Viña Undurraga y degustación',
    subtitle: 'Bodegas subterráneas centenarias, parque francés y vinos premium',
    summary: 'Sumérgete en la historia vinícola chilena en Talagante recorriendo sus parques franceses decimonónicos y cavas subterráneas con cata de vinos.',
    description: 'Fundada en 1885, Viña Undurraga es una de las pioneras en la vitivinicultura chilena. Situada en Santa Ana de Talagante, el recorrido incluye el majestuoso parque de estilo francés diseñado por George Dubois, las históricas bodegas subterráneas de guarda, la colección arqueológica de la sala de arte mapuche "Gente de la Tierra" y una completa cata guiada de vinos reserva.',
    destinationId: 'dest-undurraga',
    categories: ['Vino', 'Cultura'],
    tags: ['Undurraga', 'Viñedos', 'Degustación'],
    difficulty: 'moderate',
    pricing: { basePrice: 50000, currency: 'CLP' },
    duration: { value: 4.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      alt: 'Viña Undurraga y degustación'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cavas Undurraga 1' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Parque Francés 2' },
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Degustación de Vinos 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:30', title: 'Recogida en Santiago', description: 'Salida desde hoteles hacia Santa Ana de Talagante.' },
      { dayOrTime: '10:30', title: 'Llegada e Ingreso', description: 'Recepción en los jardines históricos de Undurraga.' },
      { dayOrTime: '11:00', title: 'Tour Sibaris', description: 'Recorrido por parque, viñedo experimental y cavas subterráneas.' },
      { dayOrTime: '12:00', title: 'Degustación Guiada', description: 'Cata de 3 vinos selectos y entrega de copa tallada de recuerdo.' },
      { dayOrTime: '12:45', title: 'Sala de Arte Mapuche', description: 'Apreciación de la exhibición precolombina e indígena.' },
      { dayOrTime: '13:30', title: 'Retorno a Santiago', description: 'Regreso directo al hotel.' }
    ],
    included: ['Transporte privado ida y vuelta', 'Entrada y tour guiado Sibaris en Viña Undurraga', 'Degustación de 3 vinos reserva', 'Copa de cristal de regalo', 'Visita a sala de arte mapuche'],
    notIncluded: ['Almuerzo', 'Compras en tienda de vinos', 'Propinas'],
    restrictions: ['Degustación de alcohol solo para mayores de 18 años']
  },
  {
    id: 'exp-010',
    slug: 'vina-santa-rita-y-degustacion',
    status: 'active',
    macroZone: 'centro',
    title: 'Viña Santa Rita y degustación',
    subtitle: 'Patrimonio de la patria, jardines centenarios y cata de grandes cepas',
    summary: 'Recorre la cuna de los 120 patriotas en Buin, sus históricas bodegas de cal y canto y degusta sus reconocidos vinos acompañados de copa de recuerdo.',
    description: 'Ubicada a los pies de la cordillera en Buin, Valle del Maipo, Viña Santa Rita une historia patria y excelencia enológica. Conocerás la histórica bodega de los "120 patriotas" que encontraron refugio durante las guerras de independencia de Chile, el parque centenario de 40 hectáreas diseñado por paisajistas europeos y el Museo Andino con su invaluable patrimonio precolombino.',
    destinationId: 'dest-santa-rita',
    categories: ['Vino', 'Cultura'],
    tags: ['Santa Rita', 'Patrimonio', 'Vino'],
    difficulty: 'moderate',
    pricing: { basePrice: 55000, currency: 'CLP' },
    duration: { value: 5.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80',
      alt: 'Viña Santa Rita'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Viña Santa Rita Parque 1' },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Bodega 120 Patriotas 2' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Viñedos de Buin 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:00', title: 'Salida de Santiago', description: 'Recogida hotelera hacia la comuna de Buin.' },
      { dayOrTime: '10:15', title: 'Llegada a Santa Rita', description: 'Ingreso al parque patrimonial y capilla neogótica.' },
      { dayOrTime: '10:45', title: 'Paseo por Jardines', description: 'Caminata entre árboles centenarios y esculturas europeas.' },
      { dayOrTime: '11:30', title: 'Bodega de los 120', description: 'Visita histórica a las cavas de la independencia chilena.' },
      { dayOrTime: '12:15', title: 'Degustación y Copa', description: 'Cata guiada de 3 vinos reserva con sommelier.' },
      { dayOrTime: '13:00', title: 'Museo Andino', description: 'Recorrido libre por el museo arqueológico Claro Vial.' },
      { dayOrTime: '14:00', title: 'Retorno a Santiago', description: 'Regreso hacia los hoteles.' }
    ],
    included: ['Transporte de turismo exclusivo ida y vuelta', 'Tour clásico guiado en Viña Santa Rita', 'Degustación guiada de 3 vinos reserva', 'Copa grabada de regalo', 'Acceso al Museo Andino'],
    notIncluded: ['Almuerzo en Restaurante Doña Paula', 'Propinas'],
    restrictions: ['Calzado cómodo para caminar en parque y empedrados']
  },
  {
    id: 'exp-011',
    slug: 'cajon-del-maipo-y-termas-valle-de-colina',
    status: 'active',
    macroZone: 'centro',
    title: 'Cajón del Maipo y Termas Valle de Colina',
    subtitle: 'Aguas termales volcánicas escalonadas bajo las altas cumbres andinas',
    summary: 'Adéntrate en el cañón del Cajón del Maipo para sumergirte en las pozas termales minerales de Colina con un exquisito picnic cordillerano.',
    description: 'Una de las experiencias más revitalizantes de los Andes centrales. Recorreremos la garganta cordillerana del Cajón del Maipo, pasando por San José de Maipo hasta las Termas Valle de Colina, donde pozas naturales escalonadas de aguas termales volcánicas (entre 25°C y 55°C) brotan al pie del Volcán San José. Incluye un reconfortante picnic campestre con vino y picoteo chileno.',
    destinationId: 'dest-cajon-maipo',
    categories: ['Naturaleza', 'Bienestar'],
    tags: ['Termas', 'Cajón del Maipo', 'Picnic'],
    difficulty: 'moderate',
    pricing: { basePrice: 65000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      alt: 'Cajón del Maipo y Termas Valle de Colina'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', alt: 'Termas de Colina 1' },
      { url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80', alt: 'Cañón del Maipo 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Cordillera y Volcán 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '07:00', title: 'Salida de Santiago', description: 'Recogida hotelera y viaje hacia San José de Maipo.' },
      { dayOrTime: '08:30', title: 'Pueblo de San José', description: 'Parada en la plaza colonial y abastecimiento.' },
      { dayOrTime: '11:00', title: 'Termas Valle de Colina', description: 'Tiempo libre para sumergirse en las pozas termales minerales.' },
      { dayOrTime: '13:30', title: 'Picnic Cordillerano', description: 'Degustación de quesos, picoteo chileno y vino frente al volcán.' },
      { dayOrTime: '14:45', title: 'Descenso Fotográfico', description: 'Paradas en formaciones rocosas y cañones del río.' },
      { dayOrTime: '17:30', title: 'Llegada a Santiago', description: 'Retorno seguro a los hoteles.' }
    ],
    included: ['Transporte 4x4 o van de montaña autorizada', 'Guía cordillerano certificado', 'Entrada a Termas Valle de Colina', 'Picnic gourmet con vino chileno y picoteo'],
    notIncluded: ['Almuerzo formal en restaurante', 'Toallas y traje de baño', 'Propinas'],
    restrictions: ['Llevar traje de baño, toalla y calzado adecuado para agua/piedras', 'Precaución en pozas más calientes para personas con hipertensión']
  },
  {
    id: 'exp-012',
    slug: 'walking-tour-por-santiago-historico',
    status: 'active',
    macroZone: 'centro',
    title: 'Walking Tour por Santiago histórico',
    subtitle: 'A paso firme entre callejones coloniales, palacios y secretos fundacionales',
    summary: 'Recorre a pie los rincones más emblemáticos de la capital chilena junto a un guía historiador experto.',
    description: 'La forma más cercana y enriquecedora de descubrir la capital. Caminaremos por los adoquines del centro histórico de Santiago: la Plaza de Armas con su Catedral Metropolitana, el edificio del Correo Central, el ex Congreso Nacional, los patios coloniales del Palacio de La Moneda y las terrazas del Cerro Santa Lucía, donde Pedro de Valdivia fundó la ciudad en 1541.',
    destinationId: 'dest-santiago',
    categories: ['Cultura', 'Ciudad'],
    tags: ['Walking tour', 'Historia', 'Arquitectura'],
    difficulty: 'moderate',
    pricing: { basePrice: 25000, currency: 'CLP' },
    duration: { value: 4, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
      alt: 'Walking Tour por Santiago histórico'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80', alt: 'Plaza de Armas 1' },
      { url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80', alt: 'Cerro Santa Lucía 2' },
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', alt: 'Palacio de La Moneda 3' }
    ],
    meetingPoint: 'Punto de encuentro en centro de Santiago (sin recogida hotelera).',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:30', title: 'Encuentro Céntrico', description: 'Reunión frente a La Moneda o Teatro Municipal.' },
      { dayOrTime: '10:00', title: 'Barrio Cívico y La Moneda', description: 'Historia republicana, patios y arquitectura patrimonial.' },
      { dayOrTime: '11:00', title: 'Paseo Ahumada y Plaza de Armas', description: 'Catedral Metropolitana, edificios coloniales y vida urbana.' },
      { dayOrTime: '12:00', title: 'Ex Congreso y Tribunales', description: 'Paseo por el eje neoclásico de los poderes del Estado.' },
      { dayOrTime: '12:45', title: 'Cerro Santa Lucía', description: 'Ascenso a la fortaleza de Hidalgo y vista panorámica.' },
      { dayOrTime: '13:30', title: 'Cierre y Recomendaciones', description: 'Consejos gastronómicos locales y despedida.' }
    ],
    included: ['Guía profesional de historia bilingüe', 'Recorrido a pie interpretativo de 4 horas', 'Mapa del centro histórico y recomendaciones'],
    notIncluded: ['Transporte de recogida o retorno', 'Alimentos y bebidas', 'Propinas'],
    restrictions: ['Caminata de intensidad moderada', 'Llevar calzado deportivo cómodo y agua']
  },
  {
    id: 'exp-013',
    slug: 'ski-day-en-los-andes',
    status: 'active',
    macroZone: 'centro',
    title: 'Ski Day en los Andes',
    subtitle: 'Traslado seguro y jornada libre en los mejores centros de nieve',
    summary: 'Sube a la alta cordillera para disfrutar de un día completo de esquí o snowboard en los centros invernales de Santiago.',
    description: 'El servicio ideal para fanáticos de la nieve y los deportes de invierno. Te recogemos temprano en tu hotel para trasladarte de forma segura y puntual a los centros invernales de la cordillera de Santiago (Farellones, El Colorado o Valle Nevado). Disfrutarás de una jornada completa de esquí o snowboard en las mejores pistas del hemisferio sur.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Nieve', 'Aventura'],
    tags: ['Ski', 'Snowboard', 'Nieve'],
    difficulty: 'moderate',
    pricing: { basePrice: 35000, currency: 'CLP' },
    duration: { value: 11.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ski Day en los Andes'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', alt: 'Ski Pistas 1' },
      { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', alt: 'Snowboard Andes 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Centro Invernal 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '06:30', title: 'Pick up en Santiago', description: 'Recogida temprana en hoteles de la ciudad.' },
      { dayOrTime: '07:30', title: 'Parada de Arriendo', description: 'Detención en tienda especializada para arriendo de equipo/ropa.' },
      { dayOrTime: '09:30', title: 'Llegada a Pistas', description: 'Arribo al centro invernal en la alta cordillera.' },
      { dayOrTime: '10:00', title: 'Día Completo de Esquí', description: 'Jornada libre para esquiar o practicar snowboard.' },
      { dayOrTime: '16:30', title: 'Encuentro y Descenso', description: 'Regreso coordinado en el transporte hacia Santiago.' },
      { dayOrTime: '18:30', title: 'Llegada al Hotel', description: 'Finalización de la jornada.' }
    ],
    included: ['Transporte de montaña especializado ida y vuelta', 'Chofer profesional con experiencia en hielo y nieve', 'Parada de arriendo de equipo con descuento preferencial', 'Seguro de transporte'],
    notIncluded: ['Ticket de andarivel (Ski pass)', 'Arriendo de equipo de esquí/snowboard y ropa técnica', 'Alimentación', 'Clases particulares'],
    restrictions: ['Operativo durante temporada de nieve (junio a octubre según clima)', 'Ropa impermeable y gafas de sol obligatorias']
  },
  {
    id: 'exp-014',
    slug: 'ski-day-premium-en-los-andes',
    status: 'active',
    macroZone: 'centro',
    title: 'Ski Day Premium en los Andes',
    subtitle: 'Comodidad total con arriendo de equipo incluido y traslado preferente',
    summary: 'Vive un día de esquí sin preocupaciones con transporte VIP y equipamiento completo de esquí o snowboard incluido.',
    description: 'Para quienes buscan la máxima conveniencia en la nieve. Nuestro servicio Ski Day Premium te ahorra filas y contratiempos: incluye el transporte ida y vuelta en vehículos de alta gama, y el equipamiento completo de esquí o snowboard (botas, esquíes/tabla y bastones) preseleccionado para tu talla y nivel de destreza.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Nieve', 'Aventura'],
    tags: ['Ski', 'Snowboard', 'Equipamiento'],
    difficulty: 'moderate',
    pricing: { basePrice: 110000, currency: 'CLP' },
    duration: { value: 11.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ski Day Premium'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', alt: 'Ski Premium 1' },
      { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', alt: 'Equipo Completo 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Pistas Andinas 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '06:30', title: 'Pick up VIP', description: 'Recogida en vehículos acondicionados en el hotel.' },
      { dayOrTime: '07:45', title: 'Fitting Preferencial', description: 'Ajuste de botas y tablas sin demoras.' },
      { dayOrTime: '09:30', title: 'Llegada a la Nieve', description: 'Entrega de equipo listo para subir a pistas.' },
      { dayOrTime: '10:00', title: 'Jornada Libre en Pistas', description: 'Esquí o snowboard durante todo el día.' },
      { dayOrTime: '16:30', title: 'Devolución y Abordaje', description: 'Recepción del equipo y abordaje del transporte VIP.' },
      { dayOrTime: '18:30', title: 'Llegada al Hotel', description: 'Retorno confortable a Santiago.' }
    ],
    included: ['Transporte VIP ida y vuelta climatizado', 'Equipo completo de esquí o snowboard (tablas, botas, bastones y casco)', 'Asistencia personalizada en el ajuste y fitting', 'Seguro de asistencia en transporte'],
    notIncluded: ['Ticket de andarivel (Ski pass)', 'Ropa técnica impermeable (disponible para arriendo adicional)', 'Almuerzo'],
    restrictions: ['Informar con anticipación peso, estatura y talla de calzado para ajuste de fijaciones']
  },
  {
    id: 'exp-015',
    slug: 'moto-de-nieve-en-cajon-del-maipo',
    status: 'active',
    macroZone: 'centro',
    title: 'Moto de nieve en Cajón del Maipo',
    subtitle: 'Velocidad, adrenalina y paisajes vírgenes en la nieve andina',
    summary: 'Pilotea potentes motos de nieve por valles glaciares y laderas nevadas del Cajón del Maipo con guía de montaña experto.',
    description: 'La máxima aventura invernal en la cordillera central. Salimos de madrugada para llegar a los sectores altos del Cajón del Maipo donde aguardan nuestras potentes motos de nieve (snowmobiles). Tras una instrucción de seguridad, conducirás a través de paisajes vírgenes de nieve profunda, cañones glaciares y miradores a los que solo es posible acceder en este tipo de máquinas.',
    destinationId: 'dest-cajon-maipo',
    categories: ['Nieve', 'Aventura'],
    tags: ['Moto de nieve', 'Cordillera', 'Aventura'],
    difficulty: 'moderate',
    pricing: { basePrice: 260000, currency: 'CLP' },
    duration: { value: 12, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      alt: 'Moto de nieve en Cajón del Maipo'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80', alt: 'Motos de Nieve 1' },
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'Cajón Nevado 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Glaciares Andinos 3' }
    ],
    meetingPoint: 'Recogida hotelera | Salida: 06:00 a 06:30 hrs.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '06:00', title: 'Salida de Santiago', description: 'Recogida temprana en hotel en vehículo 4x4.' },
      { dayOrTime: '08:30', title: 'Base de Operaciones', description: 'Llegada a base de alta montaña en Cajón del Maipo.' },
      { dayOrTime: '09:30', title: 'Briefing e Instrucción', description: 'Charla técnica, normas de seguridad y entrega de cascos.' },
      { dayOrTime: '10:00', title: 'Expedición en Moto de Nieve', description: 'Travesía guiada por laderas y mesetas vírgenes (aprox 2 hrs).' },
      { dayOrTime: '12:30', title: 'Refugio y Snack Caliente', description: 'Descanso reconfortante en refugio cordillerano.' },
      { dayOrTime: '14:00', title: 'Almuerzo Campestre', description: 'Tiempo libre para almuerzo y relax de montaña.' },
      { dayOrTime: '16:30', title: 'Retorno a Santiago', description: 'Regreso hacia los hoteles.' }
    ],
    included: ['Transporte ida y vuelta en vehículo 4x4', 'Arriendo y pilotaje de moto de nieve biplaza o individual', 'Casco y guantes de protección técnica', 'Guía de montaña especializado e instrucción completa', 'Snack caliente en refugio'],
    notIncluded: ['Almuerzo completo formal', 'Ropa térmica personal', 'Propinas'],
    restrictions: ['Conductores deben ser mayores de 18 años con licencia de conducir vigente', 'Acompañantes desde 10 años', 'Sujeto a condiciones de nieve y clima']
  },
  {
    id: 'exp-016',
    slug: 'parque-farellones-dia-de-nieve',
    status: 'active',
    macroZone: 'centro',
    title: 'Parque Farellones: día de nieve',
    subtitle: 'Diversión familiar en la nieve con tubing, canopy y trineos',
    summary: 'Un día mágico de entretenimiento en la nieve para grandes y chicos en el único parque de atracciones de montaña en Chile.',
    description: 'El destino favorito para familias y amigos que quieren vivir la nieve sin necesidad de esquiar como expertos. Parque Farellones ofrece tirolesas (canopy), pistas de tubing, trineos, sillas panorámicas y fat bikes en medio de la cordillera blanca. Traslado cómodo y seguro desde tu alojamiento en Santiago.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Nieve', 'Recreación'],
    tags: ['Farellones', 'Nieve', 'Familia'],
    difficulty: 'moderate',
    pricing: { basePrice: 35000, currency: 'CLP' },
    duration: { value: 11.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      alt: 'Parque Farellones: día de nieve'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', alt: 'Parque Farellones Nieve 1' },
      { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', alt: 'Tubing y Trineos 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Montaña Blanca 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '06:45', title: 'Salida de Santiago', description: 'Recogida en hoteles de la ciudad.' },
      { dayOrTime: '08:15', title: 'Alquiler de Ropa', description: 'Parada en tienda para arriendo de ropa impermeable.' },
      { dayOrTime: '09:45', title: 'Llegada a Parque Farellones', description: 'Ingreso al parque de diversiones en la nieve.' },
      { dayOrTime: '10:00', title: 'Atracciones y Nieve', description: 'Día completo de tubing, trineos, canopy y teleférico.' },
      { dayOrTime: '16:30', title: 'Regreso hacia Santiago', description: 'Descenso en transporte seguro.' },
      { dayOrTime: '18:30', title: 'Llegada a Hoteles', description: 'Finalización del tour.' }
    ],
    included: ['Transporte ida y vuelta con chofer profesional de montaña', 'Coordinador a bordo', 'Parada en tienda de alquiler de ropa impermeable con descuento', 'Seguro de transporte de pasajeros'],
    notIncluded: ['Ticket de entrada general a Parque Farellones', 'Arriendo de ropa de nieve y guantes', 'Almuerzo'],
    restrictions: ['Comprar tickets de Parque Farellones con anticipación online en temporada alta', 'Ropa impermeable imprescindible']
  },
  {
    id: 'exp-017',
    slug: 'andes-beats-after-ski',
    status: 'active',
    macroZone: 'centro',
    title: 'Andes Beats: After Ski',
    subtitle: 'Música electrónica, ambiente exclusivo y fiesta sobre la nieve al atardecer',
    summary: 'Disfruta de la mejor fiesta After Ski en las terrazas de El Colorado con DJs en vivo, coctelería y atardecer en los Andes.',
    description: 'La combinación perfecta entre montaña, estilo y vida nocturna. Al caer la tarde en El Colorado, las terrazas cordilleranas se transforman con sesiones de DJs en vivo, luces, coctelería de autor y la mejor vibra juvenil y cosmopolita. Disfruta de la fiesta con la tranquilidad de contar con transporte exclusivo de ida y retorno nocturno seguro a Santiago.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Nieve', 'Eventos'],
    tags: ['After ski', 'Música', 'Sunset'],
    difficulty: 'moderate',
    pricing: { basePrice: 110000, currency: 'CLP' },
    duration: { value: 7.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Andes Beats: After Ski'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'After Ski Terraza 1' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Sunset en la Nieve 2' },
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', alt: 'Fiesta Cordillera 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '14:00', title: 'Salida de Santiago', description: 'Recogida en hoteles en transporte privado.' },
      { dayOrTime: '16:00', title: 'Llegada a El Colorado', description: 'Ingreso preferente a las terrazas del after ski.' },
      { dayOrTime: '16:30', title: 'DJ Sessions y Sunset', description: 'Música electrónica, cóctel de bienvenida y caída del sol.' },
      { dayOrTime: '19:30', title: 'Fiesta Bajo las Estrellas', description: 'Luces, ambiente y pista de baile en la montaña.' },
      { dayOrTime: '20:30', title: 'Retorno Seguro a Santiago', description: 'Descenso nocturno asistido en van privada.' },
      { dayOrTime: '22:00', title: 'Llegada al Hotel', description: 'Término de la jornada.' }
    ],
    included: ['Transporte de ida y vuelta exclusivo', 'Acceso preferente al evento After Ski', 'Trago o cóctel de bienvenida', 'Coordinación y traslado seguro nocturno'],
    notIncluded: ['Consumo adicional de bar y comida', 'Arriendo de ropa de esquí'],
    restrictions: ['Evento exclusivo para mayores de 18 años', 'Llevar ropa abrigada y estilo informal de montaña']
  },
  {
    id: 'exp-018',
    slug: 'tour-astronomico-en-cajon-del-maipo',
    status: 'active',
    macroZone: 'centro',
    title: 'Tour astronómico en Cajón del Maipo',
    subtitle: 'Cielos limpios, observación con telescopios profesionales y cosmovisión andina',
    summary: 'Descubre los misterios del universo observando estrellas, planetas y nebulosas desde un observatorio astronómico en el Cajón del Maipo.',
    description: 'Chile es la capital astronómica del planeta. A solo una hora de Santiago, internándonos en la cordillera del Cajón del Maipo, la contaminación lumínica desaparece para revelar un firmamento deslumbrante. Guiados por astrónomos expertos, observaremos planetas, cúmulos estelares y galaxias a través de telescopios de alta potencia, complementado con una charla de cosmovisión y una copa de vino caliente o chocolate bajo las estrellas.',
    destinationId: 'dest-cajon-maipo',
    categories: ['Naturaleza', 'Astronomía'],
    tags: ['Astronomía', 'Telescopio', 'Estrellas'],
    difficulty: 'moderate',
    pricing: { basePrice: 68000, currency: 'CLP' },
    duration: { value: 6.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      alt: 'Tour astronómico en Cajón del Maipo'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80', alt: 'Cielo Estrellado 1' },
      { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', alt: 'Telescopio y Vía Láctea 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Noche en Cajón del Maipo 3' }
    ],
    meetingPoint: 'Recogida hotelera | Horario: 16:00 a 21:00 hrs.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '16:00', title: 'Salida de Santiago', description: 'Recogida hotelera y traslado hacia el Cajón del Maipo.' },
      { dayOrTime: '17:30', title: 'Pueblo de San José', description: 'Parada para café y apreciación de la precordillera.' },
      { dayOrTime: '18:30', title: 'Llegada al Observatorio', description: 'Ingreso al centro astronómico cordillerano.' },
      { dayOrTime: '19:00', title: 'Charla Cosmovisión Andina', description: 'Introducción al cielo austral y constelaciones incas.' },
      { dayOrTime: '19:45', title: 'Observación en Telescopios', description: 'Visualización guiada de planetas, nebulosas y cúmulos.' },
      { dayOrTime: '21:00', title: 'Bebida Caliente y Despedida', description: 'Vino caliente o chocolate bajo las estrellas.' },
      { dayOrTime: '21:30', title: 'Retorno a Santiago', description: 'Llegada aproximada a las 22:30 hrs.' }
    ],
    included: ['Transporte ida y vuelta con chofer profesional', 'Guía y astrónomo divulgador científico', 'Acceso a observatorio y uso de telescopios computarizados', 'Bebida caliente (vino navegado o chocolate) y snack'],
    notIncluded: ['Cena principal', 'Propinas'],
    restrictions: ['Actividad sujeta a condiciones de nubosidad nocturna', 'Llevar abrigo muy grueso (las noches cordilleranas son frías)']
  },
  {
    id: 'exp-019',
    slug: 'santiago-y-los-andes-en-helicoptero',
    status: 'active',
    macroZone: 'centro',
    title: 'Santiago y los Andes en helicóptero',
    subtitle: 'Vuelo panorámico exclusivo sobre la ciudad y las cumbres andinas',
    summary: 'Sobrevuela los rascacielos de Santiago, los valles precordilleranos y las cumbres eternas de los Andes en un vuelo privado en helicóptero.',
    description: 'Una perspectiva insuperable reservada para ocasiones especiales. Despega desde un moderno helipuerto en Santiago para un sobrevuelo emocionante por encima de la torre Gran Santiago, el Parque Metropolitano y los valles vitivinícolas, internándote luego hacia las majestuosas paredes de roca y glaciares de la Cordillera de los Andes. Una experiencia VIP con brindis con champán incluido.',
    destinationId: 'dest-santiago',
    categories: ['Experiencias exclusivas', 'Aventura'],
    tags: ['Helicóptero', 'Vuelo', 'Panorámico'],
    difficulty: 'moderate',
    pricing: { basePrice: 350000, currency: 'CLP' },
    duration: { value: 3, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      alt: 'Santiago y los Andes en helicóptero'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', alt: 'Helicóptero en Vuelo 1' },
      { url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80', alt: 'Vista Aérea de Santiago 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Cumbres Andinas desde el Aire 3' }
    ],
    meetingPoint: 'Recogida hotelera / Helipuerto.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:30', title: 'Traslado Privado', description: 'Recogida en hotel hacia el helipuerto corporativo.' },
      { dayOrTime: '10:15', title: 'Salón VIP y Briefing', description: 'Recepción, check-in aeronáutico e instrucciones de seguridad.' },
      { dayOrTime: '10:45', title: 'Vuelo Panorámico (30 min)', description: 'Sobrevuelo sobre rascacielos de Santiago y faldas cordilleranas.' },
      { dayOrTime: '11:15', title: 'Brindis con Espumante', description: 'Aterrizaje, brindis con champaña y sesión fotográfica.' },
      { dayOrTime: '12:00', title: 'Retorno al Hotel', description: 'Traslado privado de regreso.' }
    ],
    included: ['Traslado terrestre privado ida y vuelta al helipuerto', 'Vuelo en helicóptero turbina con piloto comercial certificado', 'Acceso a sala VIP de embarque', 'Brindis con espumante y fotografías de recuerdo'],
    notIncluded: ['Gastos personales', 'Propinas'],
    restrictions: ['Presentar documento de identidad o pasaporte vigente', 'Sujeto a autorizaciones de tráfico aéreo y meteorología', 'Límite de peso por pasajero según modelo de aeronave']
  },
  {
    id: 'exp-020',
    slug: 'bus-panoramico-hop-on-hop-off-santiago',
    status: 'active',
    macroZone: 'centro',
    title: 'Bus panorámico Hop-On Hop-Off Santiago',
    subtitle: 'Libertad total para recorrer la capital en buses de dos pisos con audioguía',
    summary: 'Sube y baja cuantas veces quieras durante el día en las paradas más importantes de Santiago: museos, parques, teleférico y centros comerciales.',
    description: 'El clásico bus de dos pisos de estilo londinense adaptado para recorrer Santiago a tu propio ritmo. Con un solo ticket puedes subir y bajar durante toda la jornada en más de 10 paradas estratégicas, conectando el centro histórico, el Parque Metropolitano, el Teleférico, el Costanera Center y los barrios gastronómicos de Providencia y Las Condes, con audioguía multilingüe.',
    destinationId: 'dest-santiago',
    categories: ['Cultura', 'Ciudad'],
    tags: ['Bus panorámico', 'Hop-on hop-off', 'Ciudad'],
    difficulty: 'moderate',
    pricing: { basePrice: 40500, currency: 'CLP' },
    duration: { value: 8, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      alt: 'Bus panorámico Hop-On Hop-Off Santiago'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', alt: 'Bus Dos Pisos 1' },
      { url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80', alt: 'Recorrido Urbano 2' },
      { url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80', alt: 'Parada Histórica 3' }
    ],
    meetingPoint: 'Punto de encuentro parada habilitada (sin recogida hotelera).',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '10:00', title: 'Primer Abordaje', description: 'Inicio de servicio en cualquier parada habilitada del circuito.' },
      { dayOrTime: '10:00 a 18:00', title: 'Circuito Continuo Libre', description: 'Subida y bajada ilimitada en todas las estaciones.' },
      { dayOrTime: '18:00', title: 'Fin de Operaciones', description: 'Cierre del horario de operación regular de los buses.' }
    ],
    included: ['Pase diario Hop-On Hop-Off ilimitado', 'Audioguía a bordo en múltiples idiomas con audífonos', 'Mapa del circuito y horarios de pasada', 'Wifi a bordo del bus'],
    notIncluded: ['Recogida hotelera personalizada', 'Tickets de teleférico o funicular (salvo combo)', 'Alimentación'],
    restrictions: ['Pase personal e intransferible válido durante el día seleccionado', 'Buses adaptados con acceso universal']
  },
  {
    id: 'exp-021',
    slug: 'concha-y-toro-marques-de-casa-concha',
    status: 'active',
    macroZone: 'centro',
    title: 'Concha y Toro: Marqués de Casa Concha',
    subtitle: 'Degustación premium de alta gama maridada con finos quesos maduros',
    summary: 'Una experiencia gourmet exclusiva en Viña Concha y Toro con sommelier privado, cata de 4 variedades Marqués de Casa Concha y tabla de maridaje.',
    description: 'La opción predilecta para conocedores del buen vino. Además del recorrido por los jardines señoriales y la leyenda del Casillero del Diablo, participarás en una sesión privada guiada por un sommelier profesional de la viña. Catarás cuatro variedades exclusivas de la línea Marqués de Casa Concha, maridadas meticulosamente con quesos importados y chilenos madurados.',
    destinationId: 'dest-concha-y-toro',
    categories: ['Vino', 'Gastronomía'],
    tags: ['Concha y Toro', 'Maridaje', 'Degustación'],
    difficulty: 'moderate',
    pricing: { basePrice: 85000, currency: 'CLP' },
    duration: { value: 7.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      alt: 'Marqués de Casa Concha'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cata Sommelier 1' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Casona y Parque 2' },
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Maridaje Gourmet 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:30', title: 'Salida de Santiago', description: 'Recogida en hotel hacia Pirque.' },
      { dayOrTime: '10:45', title: 'Parque Histórico', description: 'Recorrido por la casona señorial de Don Melchor.' },
      { dayOrTime: '11:30', title: 'Casillero del Diablo', description: 'Descenso a las bodegas subterráneas centenarias.' },
      { dayOrTime: '12:15', title: 'Cata Premium con Sommelier', description: 'Degustación de 4 cepas Marqués con maridaje de quesos.' },
      { dayOrTime: '13:45', title: 'Wine Bar & Tienda', description: 'Tiempo libre para compras de vinos de colección.' },
      { dayOrTime: '15:30', title: 'Retorno a Santiago', description: 'Regreso cómodo a los hoteles.' }
    ],
    included: ['Transporte privado ida y vuelta', 'Tour oficial Marqués de Casa Concha', 'Cata guiada de 4 vinos de alta gama con sommelier', 'Tabla de quesos finos para maridaje', 'Copa de degustación grabada de regalo'],
    notIncluded: ['Almuerzo completo', 'Compras personales en el wine shop', 'Propinas'],
    restrictions: ['Exclusivo para mayores de 18 años']
  },
  {
    id: 'exp-022',
    slug: 'casillero-del-diablo-nocturno-con-cena',
    status: 'active',
    macroZone: 'centro',
    title: 'Casillero del Diablo nocturno con cena',
    subtitle: 'Misterio bajo la luz de las velas, espectáculo de luces y cena gourmet',
    summary: 'Vive la atmósfera nocturna y mística de Viña Concha y Toro con show exclusivo en las bodegas del diablo y cena de tres tiempos maridada.',
    description: 'Una velada cautivadora en Pirque. Cuando las puertas de la viña se cierran al público general, se inicia este recorrido nocturno iluminado por antorchas y faroles. En las profundidades de la cava del siglo XIX se revive la dramatización de la leyenda del Casillero del Diablo, culminando con una exquisita cena gourmet de 3 tiempos en el restaurante de la viña, maridada con vinos de excelencia.',
    destinationId: 'dest-concha-y-toro',
    categories: ['Vino', 'Gastronomía'],
    tags: ['Casillero del Diablo', 'Cena', 'Noche'],
    difficulty: 'moderate',
    pricing: { basePrice: 115000, currency: 'CLP' },
    duration: { value: 7.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80',
      alt: 'Casillero del Diablo nocturno con cena'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Cava Iluminada 1' },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cena Maridada 2' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Noche en la Viña 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '17:30', title: 'Salida de Santiago', description: 'Recogida hotelera hacia Pirque al caer la tarde.' },
      { dayOrTime: '18:45', title: 'Bienvenida con Cóctel', description: 'Recepción en la casona con copa de bienvenida.' },
      { dayOrTime: '19:30', title: 'Tour Nocturno Teatralizado', description: 'Recorrido por las cavas a la luz de las velas.' },
      { dayOrTime: '20:45', title: 'Cena Gourmet de 3 Tiempos', description: 'Cena maridada con vinos de alta gama en restaurante.' },
      { dayOrTime: '22:45', title: 'Retorno Seguro a Santiago', description: 'Llegada aproximada a medianoche.' }
    ],
    included: ['Transporte de turismo exclusivo ida y vuelta', 'Tour nocturno teatralizado en cavas centenarias', 'Cena gourmet de 3 tiempos con maridaje de vinos incluido', 'Cóctel de bienvenida y copa de regalo'],
    notIncluded: ['Bebidas alcohólicas adicionales a las del maridaje', 'Propinas'],
    restrictions: ['Cupos limitados para preservar la exclusividad', 'Vestimenta semiformal / casual elegante']
  },
  {
    id: 'exp-023',
    slug: 'monte-luz-sunset-360',
    status: 'active',
    macroZone: 'centro',
    title: 'Monte Luz Sunset 360',
    subtitle: 'Mirador exclusivo, música ambiental y atardecer de autor en la cordillera',
    summary: 'Disfruta de una experiencia de atardecer privilegiada en el sector de Monte Luz con vista en 360 grados, tabla gourmet y coctelería.',
    description: 'Una escapada chic y relajante hacia uno de los miradores más espectaculares y privados de la precordillera de Santiago. En el sector de Monte Luz, con vista 360° al valle y a las primeras estribaciones andinas, vivirás un atardecer mágico con música chill-out ambiental, estaciones de vinos seleccionados y tablas de charcutería artesanal.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Vino', 'Eventos'],
    tags: ['Sunset', 'Vino', 'Música'],
    difficulty: 'moderate',
    pricing: { basePrice: 80000, currency: 'CLP' },
    duration: { value: 7.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Monte Luz Sunset 360'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'Monte Luz Sunset 1' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Vino al Atardecer 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Mirador 360 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '16:30', title: 'Salida de Santiago', description: 'Recogida en hoteles en transporte privado.' },
      { dayOrTime: '17:30', title: 'Llegada a Monte Luz', description: 'Recepción con copa de espumante en el mirador.' },
      { dayOrTime: '18:00', title: 'Estación de Vinos', description: 'Degustación de cepas chilenas y tablas de quesos y fiambres.' },
      { dayOrTime: '18:30', title: 'Sunset 360 con Música', description: 'Caída del sol con vistas al valle de Santiago y cordillera.' },
      { dayOrTime: '20:30', title: 'Descenso Nocturno', description: 'Retorno seguro con vista panorámica de la ciudad.' },
      { dayOrTime: '21:30', title: 'Llegada al Hotel', description: 'Término de la experiencia.' }
    ],
    included: ['Transporte privado ida y vuelta', 'Acceso al mirador exclusivo Monte Luz', 'Degustación de vinos y espumantes', 'Tabla de charcutería gourmet y quesos de la zona', 'Música ambiental y ambientación lounge'],
    notIncluded: ['Consumo de destilados no incluidos en la propuesta', 'Propinas'],
    restrictions: ['Recomendado llevar chaqueta o abrigo para la brisa de la tarde']
  },
  {
    id: 'exp-024',
    slug: 'valle-de-casablanca-tres-vinas',
    status: 'active',
    macroZone: 'centro',
    title: 'Valle de Casablanca: tres viñas',
    subtitle: 'El paraíso de los vinos de clima frío, espumantes y gastronomía costera',
    summary: 'Un recorrido completo por tres viñas destacadas del afamado Valle de Casablanca con catas de Sauvignon Blanc, Chardonnay, Pinot Noir y espumantes.',
    description: 'El Valle de Casablanca es reconocido mundialmente por sus vinos de clima frío influenciados por la brisa del Océano Pacífico. En este tour premium visitamos tres prestigiosas viñas (ej. Casas del Bosque, Viña Mar y Emiliana Orgánica), degustando sus afamados blancos crujientes, tintos elegantes de Pinot Noir y espumantes de método tradicional, acompañados de un almuerzo campestre o degustación maridada.',
    destinationId: 'dest-casablanca',
    categories: ['Vino', 'Gastronomía'],
    tags: ['Casablanca', 'Vino', 'Espumantes'],
    difficulty: 'moderate',
    pricing: { basePrice: 105000, currency: 'CLP' },
    duration: { value: 8.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
      alt: 'Valle de Casablanca: tres viñas'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Viñedos Casablanca 1' },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Cata de Espumantes 2' },
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Bodega de Clima Frío 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:30', title: 'Salida de Santiago', description: 'Recogida hotelera hacia el poniente por la Ruta 68.' },
      { dayOrTime: '10:00', title: 'Primera Viña: Emiliana Orgánica', description: 'Tour biodinámico y cata de vinos orgánicos.' },
      { dayOrTime: '11:45', title: 'Segunda Viña: Viña Mar', description: 'Especialización en espumantes y método champenoise.' },
      { dayOrTime: '13:15', title: 'Tercera Viña: Casas del Bosque', description: 'Visita a bodegas y tiempo para almuerzo en Tanino.' },
      { dayOrTime: '15:45', title: 'Degustación Final de Sauvignon Blanc', description: 'Cata guiada de cepas costeras emblemáticas.' },
      { dayOrTime: '16:45', title: 'Retorno a Santiago', description: 'Regreso hacia los hoteles.' }
    ],
    included: ['Transporte de turismo exclusivo', 'Guía sommelier bilingüe', 'Degustaciones de vinos en las 3 viñas del itinerario', 'Copas de degustación de recuerdo', 'Agua mineral a bordo'],
    notIncluded: ['Almuerzo en restaurante de viña', 'Propinas'],
    restrictions: ['Mayores de 18 años para degustaciones de vino']
  },
  {
    id: 'exp-025',
    slug: 'cousino-macul-y-templo-bahai',
    status: 'active',
    macroZone: 'centro',
    title: 'Cousiño Macul y Templo Bahá’í',
    subtitle: 'La viña urbana más antigua de Chile y el icónico templo de alabastro en la precordillera',
    summary: 'Combina el legado vitivinícola colonial de Cousiño Macul en Peñalolén con la imponente arquitectura y paz espiritual del Templo Bahá’í de Sudamérica.',
    description: 'Un circuito fascinante al oriente de la capital. Visitarás Viña Cousiño Macul, fundada en 1856 y única viña histórica que aún pertenece 100% a la familia fundadora dentro de la cuenca urbana de Santiago, recorriendo sus centenarias bodegas subterráneas de ladrillo y cal y canto. Posteriormente ascenderemos a la precordillera de Peñalolén para conocer el monumental Templo Bahá’í, galardonada obra arquitectónica de vidrio y mármol translúcido con vistas panorámicas inigualables.',
    destinationId: 'dest-santiago',
    categories: ['Vino', 'Cultura'],
    tags: ['Vino', 'Arquitectura', 'Bahá’í'],
    difficulty: 'moderate',
    pricing: { basePrice: 50000, currency: 'CLP' },
    duration: { value: 5.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80',
      alt: 'Cousiño Macul y Templo Bahá’í'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Cavas Cousiño Macul 1' },
      { url: 'https://images.unsplash.com/photo-1578852612716-854e527abf50?auto=format&fit=crop&w=1200&q=80', alt: 'Templo Bahá’í y Ciudad 2' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Viñedos Urbanos 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '09:00', title: 'Salida de Santiago', description: 'Recogida hotelera hacia la comuna de Peñalolén.' },
      { dayOrTime: '09:45', title: 'Viña Cousiño Macul', description: 'Recorrido por viñedos, museo y bodegas de cal y canto.' },
      { dayOrTime: '10:45', title: 'Degustación de Vinos', description: 'Cata guiada de 4 vinos de la bodega y entrega de copa.' },
      { dayOrTime: '11:45', title: 'Hacia la Precordillera', description: 'Traslado al Templo Bahá’í de Sudamérica.' },
      { dayOrTime: '12:15', title: 'Visita al Templo Bahá’í', description: 'Paseo por jardines de agua, arquitectura y mirador.' },
      { dayOrTime: '13:45', title: 'Retorno a Hoteles', description: 'Regreso cómodo a Santiago.' }
    ],
    included: ['Transporte climatizado ida y vuelta', 'Tour clásico y degustación guiada en Viña Cousiño Macul', 'Copa de regalo', 'Visita guiada exterior y jardines del Templo Bahá’í', 'Guía bilingüe durante todo el recorrido'],
    notIncluded: ['Almuerzo', 'Propinas'],
    restrictions: ['En el interior del Templo Bahá’í se debe guardar silencio y respeto']
  },
  {
    id: 'exp-026',
    slug: 'alyan-sunset',
    status: 'active',
    macroZone: 'centro',
    title: 'Alyan Sunset',
    subtitle: 'Atardecer mágico en una viña boutique familiar de estilo toscano',
    summary: 'Una experiencia íntima en Pirque: recorre los viñedos al atardecer, degusta vinos de autor con maridajes informales y cena tipo picoteo bajo las luces del jardín.',
    description: 'Viña Alyan es una joya familiar boutique situada en Pirque, inspirada en la calidez de las fincas toscanas. Su afamada experiencia Sunset invita a recorrer las bodegas y jardines con una copa en la mano, finalizando al caer la noche en su terraza rústica con estaciones de maridaje gourmet, panes caseros, quesos y frutos secos, mientras contemplas la caída del sol entre viñedos.',
    destinationId: 'dest-alyan',
    categories: ['Vino', 'Gastronomía'],
    tags: ['Alyan', 'Sunset', 'Vino'],
    difficulty: 'moderate',
    pricing: { basePrice: 36000, currency: 'CLP' },
    duration: { value: 6.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      alt: 'Alyan Sunset'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', alt: 'Alyan Viña Boutique 1' },
      { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', alt: 'Terraza al Atardecer 2' },
      { url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80', alt: 'Maridaje y Vinos 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '16:00', title: 'Salida de Santiago', description: 'Recogida hotelera hacia el Valle del Maipo (Pirque).' },
      { dayOrTime: '17:15', title: 'Llegada a Viña Alyan', description: 'Recepción en finca toscana y primera copa en mano.' },
      { dayOrTime: '17:30', title: 'Paseo por Viñedos y Cavas', description: 'Recorrido íntimo por salas de barricas y bodegas.' },
      { dayOrTime: '19:00', title: 'Sunset y Maridaje', description: 'Ubicación en terrazas para el atardecer con tablas de quesos.' },
      { dayOrTime: '20:30', title: 'Copa de Recuerdo y Brindis', description: 'Cierre con vino ícono de la viña.' },
      { dayOrTime: '21:15', title: 'Retorno a Santiago', description: 'Regreso seguro hacia los hoteles.' }
    ],
    included: ['Transporte de turismo exclusivo ida y vuelta', 'Experiencia Sunset completa en Viña Alyan', 'Degustación de diversas cepas de autor', 'Tablas de quesos y maridaje gourmet', 'Copa grabada'],
    notIncluded: ['Cena formal pesada', 'Propinas'],
    restrictions: ['Actividad para mayores de 18 años']
  },
  {
    id: 'exp-027',
    slug: 'rafting-en-cajon-del-maipo',
    status: 'active',
    macroZone: 'centro',
    title: 'Rafting en Cajón del Maipo',
    subtitle: 'Emoción y rápidos clase III y IV en las aguas glaciares del río Maipo',
    summary: 'Desciende los rápidos más emocionantes de la cordillera central con guías certificados y equipamiento completo de seguridad acuática.',
    description: 'Una inyección pura de adrenalina en el río Maipo. Navegaremos por rápidos clase III y IV en una sección de 14 kilómetros de aguas bravas nacidas en los glaciares andinos. Contarás con equipamiento técnico de neopreno completo, cascos, chalecos certificados y balsas guiadas por expertos remeros con estándares internacionales de seguridad.',
    destinationId: 'dest-cajon-maipo',
    categories: ['Aventura', 'Naturaleza'],
    tags: ['Rafting', 'Río Maipo', 'Aventura'],
    difficulty: 'moderate',
    pricing: { basePrice: 65000, currency: 'CLP' },
    duration: { value: 5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80',
      alt: 'Rafting en Cajón del Maipo'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80', alt: 'Rafting Río Maipo 1' },
      { url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80', alt: 'Rápidos en el Río 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Cañón Cordillerano 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '08:30', title: 'Salida de Santiago', description: 'Recogida hotelera hacia San José de Maipo.' },
      { dayOrTime: '10:00', title: 'Base de Operaciones', description: 'Entrega de equipo de neopreno, chalecos y cascos.' },
      { dayOrTime: '10:30', title: 'Charla de Seguridad y Remada', description: 'Instrucciones del guía y prácticas de maniobra.' },
      { dayOrTime: '11:15', title: 'Descenso en Rápidos (14 km)', description: 'Navegación intensa de rápidos clase III y IV en el río Maipo.' },
      { dayOrTime: '12:45', title: 'Llegada y Duchas Calientes', description: 'Cambio de ropa y tiempo para fotografías de la bajada.' },
      { dayOrTime: '13:30', title: 'Retorno a Santiago', description: 'Regreso cómodo a los hoteles.' }
    ],
    included: ['Transporte ida y vuelta desde Santiago', 'Equipo completo de rafting: traje neopreno, botines, chaleco salvavidas, casco y remo', 'Guía de rafting certificado internacionalmente', 'Balsa de seguridad y rescate', 'Seguro de accidentes personales en agua'],
    notIncluded: ['Almuerzo', 'Fotografías profesionales del descenso (adicionales en base)', 'Propinas'],
    restrictions: ['Saber flotar/nadar básico', 'Edad mínima 12 años', 'Llevar traje de baño y toalla']
  },
  {
    id: 'exp-028',
    slug: 'cuatrimoto-sunset-en-cajon-del-maipo',
    status: 'active',
    macroZone: 'centro',
    title: 'Cuatrimoto Sunset en Cajón del Maipo',
    subtitle: 'Rutas off-road entre quebradas, atardecer andino y asado campestre',
    summary: 'Conduce potentes cuatrimotos todoterreno por senderos de montaña al atardecer y culmina con un tradicional asado chileno a la parrilla.',
    description: 'Una aventura todoterreno incomparable. Recorreremos senderos agrestes, cruces de riachuelos y laderas precordilleranas en potentes quads 4x4. Al caer el atardecer, alcanzamos un mirador panorámico sobre el cañón para disfrutar de la puesta de sol, y luego regresamos a un acogedor quincho rústico para celebrar con un sabroso asado a la parrilla con vino chileno y empanadas.',
    destinationId: 'dest-cajon-maipo',
    categories: ['Aventura', 'Gastronomía'],
    tags: ['Cuatrimoto', 'Sunset', 'Parrilla'],
    difficulty: 'moderate',
    pricing: { basePrice: 160000, currency: 'CLP' },
    duration: { value: 9, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      alt: 'Cuatrimoto Sunset en Cajón del Maipo'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80', alt: 'Cuatrimotos 4x4 1' },
      { url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80', alt: 'Ruta Off-road 2' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Parrilla Cordillerana 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '14:30', title: 'Salida de Santiago', description: 'Recogida hotelera hacia el Cajón del Maipo.' },
      { dayOrTime: '16:00', title: 'Base de Operaciones', description: 'Instrucción de manejo y entrega de casco, antiparras y guantes.' },
      { dayOrTime: '16:30', title: 'Circuito Off-Road 4x4', description: 'Recorrido por laderas, senderos y cruce de riachuelos.' },
      { dayOrTime: '18:30', title: 'Mirador del Atardecer', description: 'Detención en mirador alto para disfrutar del Sunset con picoteo.' },
      { dayOrTime: '19:30', title: 'Descenso en Caravana', description: 'Regreso hacia el quincho campestre.' },
      { dayOrTime: '20:15', title: 'Gran Asado a la Parrilla', description: 'Asado tradicional chileno, ensaladas y vino bajo las estrellas.' },
      { dayOrTime: '22:30', title: 'Retorno a Santiago', description: 'Llegada aproximada a las 23:30 hrs.' }
    ],
    included: ['Transporte privado ida y vuelta', 'Arriendo de cuatrimoto todoterreno', 'Equipo de protección: casco, antiparras y guantes', 'Guía líder off-road y mecánico de apoyo', 'Asado completo a la parrilla con carnes, opciones vegetarianas, ensaladas y vino'],
    notIncluded: ['Consumo de destilados extras en barra', 'Propinas'],
    restrictions: ['Conductores mayores de 18 años con licencia', 'Acompañantes desde 12 años', 'Ropa cómoda que se pueda ensuciar con polvo y calzado cerrado']
  },
  {
    id: 'exp-029',
    slug: 'andes-panoramico-con-silla-en-el-colorado',
    status: 'active',
    macroZone: 'centro',
    title: 'Andes Panorámico con silla en El Colorado',
    subtitle: 'Ascenso en telesilla panorámica hacia las cumbres de El Colorado y Farellones',
    summary: 'Combina el tour panorámico por Farellones con un inolvidable paseo en la telesilla panorámica de El Colorado hasta los 3.000 metros de altura.',
    description: 'Una perspectiva de vuelo sin necesidad de esquiar. Este tour complementa el clásico recorrido panorámico por la ruta cordillerana y el pueblo de Farellones con un ticket de telesilla en El Colorado. Te elevarás suavemente por las laderas andinas hasta los miradores de alta cumbre, disfrutando de vistas colosales de 360 grados sobre los macizos cordilleranos y el valle central.',
    destinationId: 'dest-cordillera-santiago',
    categories: ['Naturaleza', 'Cordillera'],
    tags: ['Silla panorámica', 'El Colorado', 'Cordillera'],
    difficulty: 'moderate',
    pricing: { basePrice: 50000, currency: 'CLP' },
    duration: { value: 9.5, unit: 'hours' },
    languages: ['es', 'en'],
    capacity: { min: 2, max: 12 },
    coverImage: {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Andes Panorámico con silla en El Colorado'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Telesilla Panorámica 1' },
      { url: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80', alt: 'Cumbres de El Colorado 2' },
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', alt: 'Vistas 360 Farellones 3' }
    ],
    meetingPoint: 'Recogida hotelera.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itinerary: [
      { dayOrTime: '07:30', title: 'Salida de Santiago', description: 'Recogida en hoteles hacia la cordillera.' },
      { dayOrTime: '09:30', title: 'Miradores del Camino', description: 'Paradas fotográficas en la ruta de montaña.' },
      { dayOrTime: '11:00', title: 'Telesilla en El Colorado', description: 'Ascenso en andarivel panorámico hacia los 3.000 msnm.' },
      { dayOrTime: '12:30', title: 'Mirador de Alta Cumbre', description: 'Tiempo libre para fotografías y vistas panorámicas 360°.' },
      { dayOrTime: '14:00', title: 'Pueblo de Farellones', description: 'Visita al pueblo cordillerano y tiempo para almuerzo.' },
      { dayOrTime: '16:30', title: 'Descenso a Santiago', description: 'Retorno confortable a los hoteles.' }
    ],
    included: ['Transporte de turismo de montaña ida y vuelta', 'Guía profesional bilingüe', 'Ticket de ascenso y descenso en telesilla panorámica de El Colorado', 'Seguro de transporte de pasajeros'],
    notIncluded: ['Almuerzo y bebidas', 'Arriendo de ropa de nieve adicional', 'Propinas'],
    restrictions: ['Llevar calzado cerrado con suela antideslizante', 'Llevar abrigo, guantes, protector solar y lentes con filtro UV']
  }
];
