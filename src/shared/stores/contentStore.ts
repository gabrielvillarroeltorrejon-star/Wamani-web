import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mockExperiences } from '@/entities/experience/api/mockData';
import type { Experience } from '@/entities/experience/model/schemas';
import { supabase, isSupabaseConfigured } from '@/shared/api/supabaseClient';

export interface Passenger {
  fullName: string;
  documentType: 'rut' | 'passport' | 'dni';
  documentNumber: string;
  age?: number | string;
  phone?: string;
  emergencyContact?: string;
  medicalConditions?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerRut?: string;
  customerDocumentType?: 'rut' | 'passport';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  invoiceType?: 'boleta' | 'factura';
  billingDetails?: {
    businessName?: string;
    rut?: string;
    activity?: string;
    address?: string;
  };
  experienceTitle: string;
  experienceSlug?: string;
  bookingDate: string;
  pax: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  source: 'automatic' | 'manual' | 'whatsapp';
  paymentMethod?: 'webpay' | 'transfer' | 'cash' | 'manual' | 'whatsapp';
  buyOrder?: string;
  authorizationCode?: string;
  cardLast4?: string;
  notes?: string;
  passengers?: Passenger[];
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  description: string[];
  targetAudience: string;
  characteristics: string[];
  gallery: string[];
}

export interface Advisor {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface GatewaySettings {
  transbank: {
    environment: 'INTEGRATION' | 'PRODUCTION';
    commerceCode: string;
    apiKey: string;
    isEnabled: boolean;
  };
  bankTransfer: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountRut: string;
    accountHolder: string;
    notificationEmail: string;
    instructions: string;
    isEnabled: boolean;
  };
  emailNotifications: {
    smtpConfigured: boolean;
    adminEmail: string;
    sendVoucherToCustomer: boolean;
  };
}

export interface LegalInfo {
  businessName: string;
  rut: string;
  sernaturRegistry: string;
  sernaturUrl: string;
  addressLegal: string;
  city: string;
  region: string;
  legalRepresentative: string;
  supportEmail: string;
  emergencyPhone: string;
  insurancePolicy: string;
}

export interface TransportServiceCard {
  id: string;
  badge: string;
  featuredBadge?: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  features: string[];
  buttonText: string;
  buttonStyle?: 'solid' | 'outline';
  whatsAppTag?: string;
}

export interface TransportSectionContent {
  badge: string;
  title: string;
  description: string;
  services: TransportServiceCard[];
}

export interface SectionContent {
  home: {
    hero: {
      title: string;
      subtitle: string;
      videoUrl: string;
    };
    services: {
      title: string;
      description: string;
      items: ServiceItem[];
    };
    destinations: {
      title: string;
      description: string;
    };
    reviews: {
      title: string;
      description: string;
      elfsightWidgetId: string;
    };
    transport?: TransportSectionContent;
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage?: string;
    historyTitle: string;
    historySubtitle: string;
    historyText1: string;
    historyText2: string;
    historyImage: string;
    mission: string;
    vision: string;
    accreditations: {
      sernatur: {
        text: string;
        subtext: string;
        imageUrl: string;
      };
      marcaChile: {
        text: string;
        subtext: string;
        imageUrl: string;
      };
    };
    advisorsTitle: string;
    advisorsSubtitle: string;
    advisors: Advisor[];
  };
  contact: {
    phone: string;
    whatsappNumber: string;
    whatsappMessage: string;
    email: string;
    address: string;
    instagramUrl: string;
    tripadvisorUrl: string;
    facebookUrl?: string;
  };
  legal: LegalInfo;
  gateway: GatewaySettings;
}

export const DEFAULT_TRANSPORT_SERVICES: TransportServiceCard[] = [
  {
    id: 'trans-1',
    badge: 'Aeropuertos ZCO / PMC',
    title: 'Traslados Aeropuerto VIP',
    description: 'Recogida y retorno puntual en los aeropuertos de Temuco (Freire) y Puerto Montt hacia Pucón, Villarrica y Huilo Huilo.',
    icon: 'bi-airplane-engines',
    imageUrl: '',
    features: [
      'Monitoreo de vuelo en tiempo real',
      'Recepción personalizada con letrero',
      'Asistencia completa con equipaje'
    ],
    buttonText: 'Cotizar Traslado',
    buttonStyle: 'outline',
    whatsAppTag: 'Traslado Aeropuerto'
  },
  {
    id: 'trans-2',
    badge: 'Jornada Completa / Media Jornada',
    featuredBadge: 'MÁS SOLICITADO',
    title: 'Disposición & Rutas Termales',
    description: 'Vehículo y chofer privado a tu propio ritmo para visitar termas cordilleranas, parques nacionales, saltos de agua y gastronomía.',
    icon: 'bi-car-front-fill',
    imageUrl: '',
    features: [
      'Circuitos a Termas Geométricas y Huife',
      'Flexibilidad total en paradas y tiempos',
      'Chofer profesional con conocimiento local'
    ],
    buttonText: 'Cotizar Disposición',
    buttonStyle: 'solid',
    whatsAppTag: 'Disposición Termal y Parque'
  },
  {
    id: 'trans-3',
    badge: 'Empresas & Grupos Privados',
    title: 'Corporativo & Delegaciones',
    description: 'Logística de movilidad integral para convenciones, matrimonios de destino, productoras audiovisuales y viajes de incentivo.',
    icon: 'bi-people-fill',
    imageUrl: '',
    features: [
      'Vans ejecutivas y tracción 4x4',
      'Facturación formal electrónica para empresas',
      'Pólizas colectivas de asistencia'
    ],
    buttonText: 'Cotizar Corporativo',
    buttonStyle: 'outline',
    whatsAppTag: 'Transporte Corporativo'
  }
];

export const DEFAULT_TRANSPORT_SECTION: TransportSectionContent = {
  badge: 'MOVILIDAD PRIVADA & CONFORT',
  title: 'Transporte Exclusivo & Traslados Cordilleranos',
  description: 'Conectamos los principales aeropuertos y destinos del sur de Chile con conductores profesionales, puntualidad rigurosa y vehículos acondicionados para la montaña.',
  services: DEFAULT_TRANSPORT_SERVICES
};

const DEFAULT_CONTENT: SectionContent = {
  home: {
    hero: {
      title: 'WAMANI',
      subtitle: 'Ecoturismo desde Chile',
      videoUrl: '/hero-video.mp4'
    },
    services: {
      title: 'Nuestros Servicios',
      description: 'Ofrecemos diferentes formatos de experiencias diseñadas bajo un estándar común de calidad, seguridad y respeto por el entorno natural y social.',
      items: [
        {
          id: 'privadas',
          title: 'Experiencias Privadas',
          subtitle: 'Exclusividad Total',
          coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          description: [
            'Las Experiencias Privadas WAMANI están orientadas a pasajeros que desean recorrer un destino a su propio ritmo, con un servicio exclusivo para su grupo y una planificación ajustada a sus intereses y tiempos.',
            'Este formato permite una experiencia más personalizada, con mayor libertad en horarios, paradas y enfoque del recorrido, siempre con acompañamiento profesional y coordinación previa.'
          ],
          targetAudience: 'Familias, parejas, grupos privados y viajeros que buscan una experiencia personalizada',
          characteristics: [
            'Servicio exclusivo para el grupo contratado',
            'Planificación previa del itinerario',
            'Flexibilidad en tiempos y recorridos',
            'Acompañamiento de guía certificado',
            'Posibilidad de integrar transporte privado'
          ],
          gallery: [
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'grupales',
          title: 'Experiencias Grupales',
          subtitle: 'Aventuras Compartidas',
          coverImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
          description: [
            'Las Experiencias Grupales WAMANI están orientadas a viajeros que desean conocer destinos relevantes en compañía de otros pasajeros, manteniendo un estándar de organización, ritmo adecuado y acompañamiento profesional.',
            'Cada salida es planificada con anticipación y operada con grupos reducidos, priorizando la calidad de la experiencia, la interpretación del entorno y una coordinación clara durante toda la jornada.',
            'Nota: Las salidas grupales están sujetas a confirmación según mínimo operativo.'
          ],
          targetAudience: 'Viajeros individuales, parejas y grupos pequeños de amigos',
          characteristics: [
            'Grupos reducidos',
            'Itinerarios definidos y planificados',
            'Guía certificado durante la experiencia',
            'Coordinación antes, durante y después del servicio'
          ],
          gallery: [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1576082761138-0cc8404a3487?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'medida',
          title: 'Experiencias a Medida',
          subtitle: 'Tu Propia Ruta',
          coverImage: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
          description: [
            'Las Experiencias a Medida WAMANI están orientadas principalmente a empresas, organizaciones, universidades y establecimientos educacionales que requieren experiencias planificadas en función de objetivos claros, perfiles de grupo y contextos específicos.',
            'Diseñamos propuestas personalizadas que integran naturaleza, territorio y actividades colaborativas, adecuando el formato, duración y contenidos según las necesidades de cada institución.',
            'Este servicio también puede ser solicitado por grupos privados con requerimientos particulares.'
          ],
          targetAudience: 'Empresas, organizaciones, universidades, institutos, colegios con enfoque en educación al aire libre, equipos de trabajo y grupos privados con objetivos específicos',
          characteristics: [
            'Jornadas de team building',
            'Actividades de integración y cohesión de equipos',
            'Experiencias de reconocimiento y bonificación',
            'Salidas académicas y formativas en terreno',
            'Programas educativos al aire libre'
          ],
          gallery: [
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'aliado',
          title: 'Experiencias con Aliados',
          subtitle: 'Red de Excelencia',
          coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
          description: [
            'Las Experiencias con Aliados WAMANI corresponden a una red de propuestas desarrolladas junto a emprendedores, proyectos locales y proveedores especializados que ofrecen experiencias de alto valor en ámbitos culturales, artísticos, naturales y territoriales.',
            'Cada aliado forma parte de WAMANI tras un proceso de evaluación y validación, asegurando coherencia con nuestros estándares de calidad, profesionalismo y experiencia del usuario.',
            'Estas experiencias pueden reservarse de manera individual o integrarse dentro de itinerarios y experiencias combinadas coordinadas por WAMANI.'
          ],
          targetAudience: 'Viajeros interesados en experiencias locales, pasajeros que buscan propuestas especializadas, grupos y empresas que desean complementar su experiencia',
          characteristics: [
            'Experiencias operadas por aliados validados',
            'Reservas gestionadas a través de WAMANI',
            'Posibilidad de experiencias combinadas',
            'Coordinación y respaldo operativo'
          ],
          gallery: [
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'transporte',
          title: 'Transporte Personalizado',
          subtitle: 'Confort en Movimiento',
          coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
          description: [
            'El Transporte Personalizado WAMANI está orientado a pasajeros que requieren movilidad segura, puntual y correctamente coordinada, ya sea para traslados específicos o para jornadas completas.',
            'Este servicio puede operar de manera independiente o como complemento a otras experiencias WAMANI, asegurando una logística clara y un desplazamiento sin contratiempos.'
          ],
          targetAudience: 'Viajeros individuales, familias, empresas y grupos privados',
          characteristics: [
            'Traslados aeropuerto – hotel',
            'Transporte a destinos turísticos',
            'Jornadas completas de transporte',
            'Transporte con o sin servicio de guía'
          ],
          gallery: [
            'https://images.unsplash.com/photo-1576082761138-0cc8404a3487?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'
          ]
        }
      ]
    },
    destinations: {
      title: 'Explorar Todas las Experiencias',
      description: 'Descubre aventuras únicas en los paisajes más imponentes del sur de Chile y personaliza tu viaje a medida'
    },
    reviews: {
      title: 'Reseñas',
      description: 'Lo que nuestros viajeros opinan sobre su aventura con Wamani Experience.',
      elfsightWidgetId: '908f9592-7ab5-4097-8a5a-1f97e9a30061'
    },
    transport: DEFAULT_TRANSPORT_SECTION
  },
  about: {
    heroTitle: 'Nuestra Historia',
    heroSubtitle: 'Conoce Wamani Experience',
    heroImage: '/961c6329-cc6b-4e0d-bff5-df7f6ce1f26b.jpg',
    historyTitle: 'Nacidos',
    historySubtitle: 'en la Araucanía',
    historyText1: 'Wamani Experience nace en el corazón del sur de Chile, fundado por apasionados guías de montaña y de turismo aventura que decidieron unir su experiencia y amor por el territorio para crear una propuesta diferente: ecoturismo real, seguro y de alta calidad.',
    historyText2: 'Creemos fielmente que viajar y recorrer la naturaleza debe ser un acto de aprendizaje, desconexión y respeto. Por eso, integramos en cada guiado la interpretación ambiental e historia local, asegurando además el cumplimiento de todos los estándares de seguridad nacionales e internacionales.',
    historyImage: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80',
    mission: 'Proporcionar experiencias de ecoturismo y turismo aventura de excelencia en Chile, conectando a las personas de forma segura y consciente con la naturaleza y las comunidades locales, promoviendo la conservación.',
    vision: 'Ser reconocidos a nivel nacional como la agencia líder en ecoturismo de excelencia en Chile, destacándonos por la seguridad de nuestras operaciones, la calidad humana y técnica de nuestros guías, y nuestro firme compromiso socioambiental.',
    accreditations: {
      sernatur: {
        text: 'Registro Oficial',
        subtext: 'Agencia certificada',
        imageUrl: '/sernatur.webp'
      },
      marcaChile: {
        text: 'Orgullo Nacional',
        subtext: 'Representantes oficiales',
        imageUrl: '/Logo_MarcaChile_Caja Roja.webp'
      }
    },
    advisorsTitle: 'Nuestro Equipo & Asesores',
    advisorsSubtitle: 'Profesionales apasionados por el ecoturismo, la seguridad en la montaña y el desarrollo local',
    advisors: [
      {
        id: 'adv-1',
        name: 'Camilo Tamayo',
        role: 'Director de Operaciones & Guía de Montaña',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
        bio: 'Especialista en expediciones de alta montaña y logística de terreno con amplia trayectoria en la cordillera andina.'
      },
      {
        id: 'adv-2',
        name: 'Benjamín Meneses',
        role: 'Coordinador de Rutas & Ecoturismo',
        image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
        bio: 'Apasionado por la conservación ambiental, el diseño de senderos seguros y la interpretación de la flora y fauna nativa.'
      },
      {
        id: 'adv-3',
        name: 'Gabriel Villarroel',
        role: 'Fundador & Gestión de Experiencias',
        image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
        bio: 'Líder en turismo aventura de excelencia, dedicado a crear vivencias auténticas y personalizadas en el sur de Chile.'
      }
    ]
  },
  contact: {
    phone: '+56 9 8567 3376',
    whatsappNumber: '56985673376',
    whatsappMessage: 'Hola Wamani, me gustaría consultar por sus experiencias.',
    email: 'experiencewamani@gmail.com',
    address: 'O\'Higgins 425, Pucón, Chile',
    instagramUrl: 'https://instagram.com/wamani.experience',
    tripadvisorUrl: 'https://www.tripadvisor.cl/'
  },
  legal: {
    businessName: 'Wamani experience spa',
    rut: '78.199.034-5',
    sernaturRegistry: '84219',
    sernaturUrl: 'https://serviciosturisticos.sernatur.cl/',
    addressLegal: 'Av. Bernardo O\'Higgins 425',
    city: 'Pucón',
    region: 'Región de La Araucanía, Chile',
    legalRepresentative: 'Gabriel Villarroel Torrejón',
    supportEmail: 'experiencewamani@gmail.com',
    emergencyPhone: '+56 9 8567 3376',
    insurancePolicy: 'Póliza Colectiva de Accidentes Personales y Asistencia en Montaña N° CH-884920'
  },
  gateway: {
    transbank: {
      environment: 'PRODUCTION',
      commerceCode: '597053104647',
      apiKey: '07845f9a-aefe-442f-9fb9-054bfca3629f',
      isEnabled: true
    },
    bankTransfer: {
      bankName: 'Banco Santander Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '89-01234-5',
      accountRut: '78.199.034-5',
      accountHolder: 'Wamani experience spa',
      notificationEmail: 'experiencewamani@gmail.com',
      instructions: 'Una vez realizada la transferencia, envía el comprobante vía WhatsApp o al correo experiencewamani@gmail.com indicando tu número de orden.',
      isEnabled: true
    },
    emailNotifications: {
      smtpConfigured: true,
      adminEmail: 'experiencewamani@gmail.com',
      sendVoucherToCustomer: true
    }
  }
};

const DEFAULT_BOOKINGS: Booking[] = [];

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  isActive: boolean;
}

const DEFAULT_DISCOUNT_CODES: DiscountCode[] = [
  { id: 'disc-1', code: 'WAMANI20', type: 'percentage', value: 20, isActive: true },
  { id: 'disc-2', code: '10LUKAS', type: 'fixed_amount', value: 10000, isActive: true }
];

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  bundlePrice: number;
  originalPrice: number;
  imageUrl: string;
  includedTourIds: string[];
  badgeText: string;
  isActive: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  caption?: string;
  createdAt: string;
}

const DEFAULT_GALLERY: GalleryImage[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    title: 'Volcán Villarrica al Amanecer',
    category: 'Montaña',
    caption: 'Ascenso guiado al cráter activo en los Andes de la Araucanía.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    title: 'Bosques Milenarios de Araucarias',
    category: 'Bosques',
    caption: 'Senderismo por parques nacionales protegidos.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    title: 'Aguas Termales Geotérmicas',
    category: 'Termas',
    caption: 'Relajo y desconexión en pozas naturales cordilleranas.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    title: 'Lagos y Cascadas Cristalinas',
    category: 'Lagos',
    caption: 'Navegación y saltos de agua en la Ruta de los Siete Lagos.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-5',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    title: 'Atardecer en la Cordillera',
    category: 'Montaña',
    caption: 'Vistas panorámicas tras una jornada de trekking.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-6',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    title: 'Expedición en Terreno',
    category: 'Aventura',
    caption: 'Equipamiento técnico y acompañamiento profesional de montaña.',
    createdAt: new Date().toISOString()
  }
];

const CATALOG_VERSION = 'v2_2026_11_29tours';

const OBSOLETE_TOUR_NAMES = [
  'villarrica',
  'pucón',
  'pucon',
  'geysers del tatio',
  'siete lagos',
  'ruta de los lagos',
  'torres del paine',
  'glaciar el morado'
];

const isObsoleteTour = (tour: any): boolean => {
  if (!tour || !tour.title) return false;
  const title = String(tour.title).toLowerCase();
  return OBSOLETE_TOUR_NAMES.some(obs => title.includes(obs));
};

const DEFAULT_PACKAGES: TourPackage[] = [
  {
    id: 'pkg-1',
    title: 'Pack Andes Total: Panorámico & Laguna del Inca',
    description: 'La combinación definitiva de montaña: Recorre Farellones y los miradores de la cordillera, junto a la mítica Laguna del Inca en Portillo con picnic gourmet.',
    bundlePrice: 70000,
    originalPrice: 83000,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    includedTourIds: ['exp-001', 'exp-002'],
    badgeText: 'Ahorra 15%',
    isActive: true
  },
  {
    id: 'pkg-2',
    title: 'Pack Santiago Cultural: Viña Concha y Toro & Andes Sunset',
    description: 'Sumérgete en la tradición vitivinícola con Casillero del Diablo y finaliza con un atardecer mágico y picnic en las alturas de la cordillera.',
    bundlePrice: 89000,
    originalPrice: 105000,
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
    includedTourIds: ['exp-004', 'exp-005'],
    badgeText: 'Más Popular',
    isActive: true
  },
  {
    id: 'pkg-3',
    title: 'Pack Alta Montaña & Valles del Vino',
    description: 'Experiencia completa en la zona central: Andes Panorámico y la prestigiosa Viña Concha y Toro con degustación guiada.',
    bundlePrice: 85000,
    originalPrice: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa8?auto=format&fit=crop&w=1200&q=80',
    includedTourIds: ['exp-001', 'exp-004'],
    badgeText: 'Imperdible',
    isActive: true
  }
];

export const useContentStore = defineStore('content', () => {
  const experiences = ref<Experience[]>([]);
  const content = ref<SectionContent>(DEFAULT_CONTENT);
  const bookings = ref<Booking[]>([]);
  const discountCodes = ref<DiscountCode[]>([]);
  const tourPackages = ref<TourPackage[]>([]);
  const galleryImages = ref<GalleryImage[]>([]);
  const isLoading = ref(false);
  const isDarkMode = ref(false);

  // Desactivado: forzar siempre modo claro
  const applyTheme = () => {
    isDarkMode.value = false;
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.classList.remove('dark-theme');
    localStorage.removeItem('wamani_dark_mode');
  };

  const toggleDarkMode = () => {
    applyTheme();
  };

  // Cargar datos al inicializar
  const loadFromStorage = () => {
    const savedCatalogVersion = localStorage.getItem('wamani_catalog_version');
    const savedExperiences = localStorage.getItem('wamani_experiences');
    const savedContent = localStorage.getItem('wamani_content');
    const savedBookings = localStorage.getItem('wamani_bookings');
    const savedDiscounts = localStorage.getItem('wamani_discounts');
    localStorage.removeItem('wamani_dark_mode');

    let shouldRefreshCatalog = savedCatalogVersion !== CATALOG_VERSION;

    if (savedExperiences) {
      try {
        const parsed: Experience[] = JSON.parse(savedExperiences);
        if (!Array.isArray(parsed) || parsed.length !== 29 || parsed.some(isObsoleteTour)) {
          shouldRefreshCatalog = true;
        } else if (!shouldRefreshCatalog) {
          experiences.value = parsed;
        }
      } catch {
        shouldRefreshCatalog = true;
      }
    } else {
      shouldRefreshCatalog = true;
    }

    if (shouldRefreshCatalog) {
      experiences.value = [...mockExperiences];
      try {
        localStorage.setItem('wamani_experiences', JSON.stringify(mockExperiences));
        localStorage.setItem('wamani_catalog_version', CATALOG_VERSION);
      } catch (e) {
        console.warn('Aviso storage:', e);
      }
    }

    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        content.value = {
          home: {
            ...DEFAULT_CONTENT.home,
            ...parsed.home,
            transport: {
              ...DEFAULT_CONTENT.home.transport,
              ...(parsed.home?.transport || {}),
              services: (Array.isArray(parsed.home?.transport?.services) && parsed.home.transport.services.length > 0)
                ? parsed.home.transport.services
                : DEFAULT_TRANSPORT_SECTION.services
            }
          },
          about: {
            ...DEFAULT_CONTENT.about,
            ...parsed.about,
            historyImage: parsed.about?.historyImage || DEFAULT_CONTENT.about.historyImage,
            heroImage: parsed.about?.heroImage || DEFAULT_CONTENT.about.heroImage,
            accreditations: { ...DEFAULT_CONTENT.about.accreditations, ...parsed.about?.accreditations },
            advisorsTitle: (parsed.about?.advisorsTitle && parsed.about.advisorsTitle !== 'Nuestros Guías & Equipo')
              ? parsed.about.advisorsTitle
              : DEFAULT_CONTENT.about.advisorsTitle,
            advisorsSubtitle: (parsed.about?.advisorsSubtitle && !parsed.about.advisorsSubtitle.includes('SERNATUR'))
              ? parsed.about.advisorsSubtitle
              : DEFAULT_CONTENT.about.advisorsSubtitle,
            advisors: (Array.isArray(parsed.about?.advisors) && parsed.about.advisors.length > 0)
              ? parsed.about.advisors
              : DEFAULT_CONTENT.about.advisors
          },
          contact: { ...DEFAULT_CONTENT.contact, ...parsed.contact },
          legal: { ...DEFAULT_CONTENT.legal, ...parsed.legal },
          gateway: {
            transbank: { ...DEFAULT_CONTENT.gateway.transbank, ...parsed.gateway?.transbank },
            bankTransfer: { ...DEFAULT_CONTENT.gateway.bankTransfer, ...parsed.gateway?.bankTransfer },
            emailNotifications: { ...DEFAULT_CONTENT.gateway.emailNotifications, ...parsed.gateway?.emailNotifications }
          }
        };
      } catch (e) {
        content.value = { ...DEFAULT_CONTENT };
      }
    } else {
      content.value = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
      localStorage.setItem('wamani_content', JSON.stringify(DEFAULT_CONTENT));
    }

    if (savedBookings) {
      try {
        const parsed = JSON.parse(savedBookings);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].buyOrder) {
          bookings.value = [...DEFAULT_BOOKINGS];
          localStorage.setItem('wamani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
        } else {
          bookings.value = parsed;
        }
      } catch {
        bookings.value = [...DEFAULT_BOOKINGS];
      }
    } else {
      bookings.value = [...DEFAULT_BOOKINGS];
      localStorage.setItem('wamani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    }
    
    if (savedDiscounts) {
      discountCodes.value = JSON.parse(savedDiscounts);
    } else {
      discountCodes.value = [...DEFAULT_DISCOUNT_CODES];
      localStorage.setItem('wamani_discounts', JSON.stringify(DEFAULT_DISCOUNT_CODES));
    }
    
    const savedPackages = localStorage.getItem('wamani_packages');
    if (savedPackages) {
      try {
        const parsed = JSON.parse(savedPackages);
        const hasObsolete = Array.isArray(parsed) && parsed.some(p => 
          p.title?.toLowerCase().includes('volc') || 
          p.title?.toLowerCase().includes('araucan') || 
          p.title?.toLowerCase().includes('lacustre') ||
          p.includedTourIds?.includes('1')
        );
        if (hasObsolete || savedCatalogVersion !== CATALOG_VERSION) {
          tourPackages.value = [...DEFAULT_PACKAGES];
          localStorage.setItem('wamani_packages', JSON.stringify(DEFAULT_PACKAGES));
        } else {
          tourPackages.value = parsed;
        }
      } catch {
        tourPackages.value = [...DEFAULT_PACKAGES];
      }
    } else {
      tourPackages.value = [...DEFAULT_PACKAGES];
      localStorage.setItem('wamani_packages', JSON.stringify(DEFAULT_PACKAGES));
    }

    const savedGallery = localStorage.getItem('wamani_gallery');
    if (savedGallery) {
      try {
        galleryImages.value = JSON.parse(savedGallery);
      } catch {
        galleryImages.value = [...DEFAULT_GALLERY];
      }
    } else {
      galleryImages.value = [...DEFAULT_GALLERY];
      localStorage.setItem('wamani_gallery', JSON.stringify(DEFAULT_GALLERY));
    }

    applyTheme();
  };

  // Sincronización en la Nube con Supabase
  const syncFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    isLoading.value = true;
    try {
      // 1. Cargar catálogo completo enriquecido desde site_content (contiene languages, duration, capacity completos)
      const catalogBackupMap = new Map<string, Experience>();
      try {
        const { data: catData } = await supabase.from('site_content').select('data').eq('key', 'experiences_catalog').single();
        if (catData?.data && Array.isArray(catData.data)) {
          catData.data.forEach((exp: Experience) => {
            if (exp && exp.id && !isObsoleteTour(exp)) {
              catalogBackupMap.set(exp.id, exp);
            }
          });
        }
      } catch (catErr) {
        console.warn('Aviso: no se pudo leer catálogo enriquecido de respaldo:', catErr);
      }

      // 2. Cargar experiencias desde Supabase
      const { data: expData, error: expError } = await supabase.from('experiences').select('*');
      if (!expError && expData && expData.length > 0) {
        const cloudExperiences = expData
          .map((e: any) => {
            const backupExp = catalogBackupMap.get(e.id);
            const localExp = experiences.value.find(loc => loc.id === e.id);

            // Resolver idiomas preservando la selección guardada
            const resolvedLanguages = (backupExp?.languages && backupExp.languages.length > 0)
              ? backupExp.languages
              : (localExp?.languages && localExp.languages.length > 0)
                ? localExp.languages
                : (e.languages && e.languages.length > 0)
                  ? e.languages
                  : ['Español', 'Inglés'];

            // Resolver portada: preferir la portada personalizada del respaldo si existe
            const resolvedCover = (backupExp?.coverImage?.url && (
              backupExp.coverImage.url.startsWith('data:') ||
              backupExp.coverImage.url.includes('supabase') ||
              !e.cover_image?.url
            )) ? backupExp.coverImage : (e.cover_image || backupExp?.coverImage || { url: '', alt: e.title });

            // Resolver galería: no permitir que un array vacío de la tabla pise fotos cargadas en el catálogo
            const resolvedGallery = (backupExp?.gallery && backupExp.gallery.length > 0)
              ? backupExp.gallery
              : (e.gallery && Array.isArray(e.gallery) && e.gallery.length > 0 ? e.gallery : []);

            // Resolver banner panorámico
            const resolvedHeroBanner = (backupExp?.heroBannerUrl && backupExp.heroBannerUrl !== e.cover_image?.url)
              ? backupExp.heroBannerUrl
              : (e.hero_banner_url || backupExp?.heroBannerUrl || resolvedCover?.url || '');

            // Resolver garantías oficiales
            const resolvedGuarantees = (backupExp?.guarantees && backupExp.guarantees.length > 0)
              ? backupExp.guarantees
              : (e.guarantees && Array.isArray(e.guarantees) && e.guarantees.length > 0 ? e.guarantees : []);

            return {
              id: e.id,
              slug: e.slug,
              title: e.title || backupExp?.title || '',
              subtitle: e.subtitle || backupExp?.subtitle || '',
              summary: e.summary || backupExp?.summary || '',
              description: e.description || backupExp?.description || '',
              destinationId: e.destination_id || backupExp?.destinationId || 'dest-cordillera-santiago',
              macroZone: e.macro_zone || backupExp?.macroZone || 'centro',
              difficulty: e.difficulty || backupExp?.difficulty || 'moderate',
              pricing: {
                basePrice: Number(e.base_price) || backupExp?.pricing?.basePrice || 50000,
                currency: 'CLP'
              },
              duration: backupExp?.duration || (e.duration ? e.duration : { value: 8, unit: 'hours' }),
              languages: resolvedLanguages,
              capacity: backupExp?.capacity || (e.capacity ? e.capacity : { min: 2, max: 12 }),
              coverImage: resolvedCover,
              gallery: resolvedGallery,
              tags: (e.tags && e.tags.length > 0) ? e.tags : (backupExp?.tags || []),
              categories: (e.categories && e.categories.length > 0) ? e.categories : (backupExp?.categories || []),
              schedule: e.schedule || backupExp?.schedule || '',
              meetingPoint: e.meeting_point || backupExp?.meetingPoint || '',
              cancellationPolicy: e.cancellation_policy || backupExp?.cancellationPolicy || '',
              itinerary: (backupExp?.itinerary && backupExp.itinerary.length > 0) ? backupExp.itinerary : (e.itinerary || []),
              included: (backupExp?.included && backupExp.included.length > 0) ? backupExp.included : (e.included || []),
              notIncluded: (backupExp?.notIncluded && backupExp.notIncluded.length > 0) ? backupExp.notIncluded : (e.not_included || []),
              heroBannerUrl: resolvedHeroBanner,
              guarantees: resolvedGuarantees,
              status: (e.status as 'active' | 'draft' | 'archived') || 'active'
            };
          })
          .filter((e: any) => !isObsoleteTour(e));

        // Incorporar tours adicionales presentes en el respaldo pero ausentes en la tabla individual
        const expDataIds = new Set(expData.map(e => e.id));
        catalogBackupMap.forEach((exp, id) => {
          if (!expDataIds.has(id) && !isObsoleteTour(exp)) {
            cloudExperiences.push(exp);
          }
        });

        if (cloudExperiences.length > 0) {
          // Fusión inteligente: preservar tours locales que aún no se hayan subido a la nube (excluyendo obsoletos)
          const cloudIds = new Set(cloudExperiences.map(e => e.id));
          const localOnly = experiences.value.filter(e => !cloudIds.has(e.id) && !isObsoleteTour(e));
          experiences.value = [...cloudExperiences, ...localOnly];

          try {
            localStorage.setItem('wamani_experiences', JSON.stringify(experiences.value));
          } catch (e) {
            console.warn('Aviso cuota storage:', e);
          }
        }
      } else {
        // Fallback a respaldo en site_content si la tabla individual no devolvió datos
        try {
          const { data: catData } = await supabase.from('site_content').select('data').eq('key', 'experiences_catalog').single();
          if (catData?.data && Array.isArray(catData.data) && catData.data.length > 0) {
            const cloudCat = (catData.data as Experience[]).filter(e => !isObsoleteTour(e));
            if (cloudCat.length > 0) {
              const cloudIds = new Set(cloudCat.map(e => e.id));
              const localOnly = experiences.value.filter(e => !cloudIds.has(e.id) && !isObsoleteTour(e));
              experiences.value = [...cloudCat, ...localOnly];
            }
          }
        } catch (catErr) {
          console.warn('Aviso: no se pudo leer catálogo de respaldo:', catErr);
        }
      }

      // 2. Cargar reservas desde Supabase
      const { data: bData, error: bError } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!bError && bData && bData.length > 0) {
        bookings.value = bData.map((b: any) => ({
          id: b.id,
          buyOrder: b.buy_order,
          customerName: b.customer_name,
          customerEmail: b.customer_email,
          customerPhone: b.customer_phone,
          customerRut: b.customer_rut,
          customerDocumentType: b.customer_document_type || 'rut',
          emergencyContactName: b.emergency_contact_name,
          emergencyContactPhone: b.emergency_contact_phone,
          medicalConditions: b.medical_conditions,
          invoiceType: b.invoice_type || 'boleta',
          billingDetails: b.billing_details || {},
          experienceTitle: b.experience_title,
          experienceSlug: b.experience_slug,
          bookingDate: b.booking_date,
          pax: b.pax,
          totalPrice: Number(b.total_price),
          status: b.status,
          source: b.source,
          paymentMethod: b.payment_method,
          authorizationCode: b.authorization_code,
          cardLast4: b.card_last4,
          notes: b.notes,
          createdAt: b.created_at
        }));
      }

      // 3. Cargar contenidos generales y galería desde Supabase
      const { data: scData, error: scError } = await supabase.from('site_content').select('data').eq('key', 'main_content').single();
      if (!scError && scData?.data) {
        const cloud = scData.data;
        content.value = {
          home: {
            ...DEFAULT_CONTENT.home,
            ...cloud.home,
            transport: {
              ...DEFAULT_CONTENT.home.transport,
              ...(cloud.home?.transport || {}),
              services: (Array.isArray(cloud.home?.transport?.services) && cloud.home.transport.services.length > 0)
                ? cloud.home.transport.services
                : DEFAULT_TRANSPORT_SECTION.services
            }
          },
          about: {
            ...DEFAULT_CONTENT.about,
            ...cloud.about,
            historyImage: cloud.about?.historyImage || DEFAULT_CONTENT.about.historyImage,
            heroImage: cloud.about?.heroImage || DEFAULT_CONTENT.about.heroImage,
            accreditations: { ...DEFAULT_CONTENT.about.accreditations, ...cloud.about?.accreditations },
            advisorsTitle: (cloud.about?.advisorsTitle && cloud.about.advisorsTitle !== 'Nuestros Guías & Equipo')
              ? cloud.about.advisorsTitle
              : DEFAULT_CONTENT.about.advisorsTitle,
            advisorsSubtitle: (cloud.about?.advisorsSubtitle && !cloud.about.advisorsSubtitle.includes('SERNATUR'))
              ? cloud.about.advisorsSubtitle
              : DEFAULT_CONTENT.about.advisorsSubtitle,
            advisors: (Array.isArray(cloud.about?.advisors) && cloud.about.advisors.length > 0)
              ? cloud.about.advisors
              : (content.value.about?.advisors || DEFAULT_CONTENT.about.advisors)
          },
          contact: { ...DEFAULT_CONTENT.contact, ...cloud.contact },
          legal: { ...DEFAULT_CONTENT.legal, ...cloud.legal },
          gateway: {
            transbank: { ...DEFAULT_CONTENT.gateway.transbank, ...cloud.gateway?.transbank },
            bankTransfer: { ...DEFAULT_CONTENT.gateway.bankTransfer, ...cloud.gateway?.bankTransfer },
            emailNotifications: { ...DEFAULT_CONTENT.gateway.emailNotifications, ...cloud.gateway?.emailNotifications }
          }
        };
      }

      // 4. Cargar galería fotográfica desde Supabase
      const { data: galData } = await supabase.from('site_content').select('data').eq('key', 'gallery_images').single();
      if (galData?.data && Array.isArray(galData.data) && galData.data.length > 0) {
        galleryImages.value = galData.data;
        try {
          localStorage.setItem('wamani_gallery', JSON.stringify(galleryImages.value));
        } catch (e) {
          console.warn('Storage quota gallery notice:', e);
        }
      }
    } catch (e) {
      console.warn('Nota: Supabase offline o no alcanzable, usando caché local:', e);
    } finally {
      isLoading.value = false;
    }
  };

  loadFromStorage();
  syncFromSupabase();

  // Guardar en Storage y Nube con persistencia garantizada
  const persist = async () => {
    try {
      localStorage.setItem('wamani_experiences', JSON.stringify(experiences.value));
      localStorage.setItem('wamani_content', JSON.stringify(content.value));
      localStorage.setItem('wamani_bookings', JSON.stringify(bookings.value));
      localStorage.setItem('wamani_discounts', JSON.stringify(discountCodes.value));
      localStorage.setItem('wamani_packages', JSON.stringify(tourPackages.value));
      localStorage.setItem('wamani_gallery', JSON.stringify(galleryImages.value));
    } catch (storageErr) {
      console.warn('Aviso: Cuota de localStorage alcanzada, sincronizando directamente con Supabase:', storageErr);
    }

    // Si Supabase está configurado, guardar también en la nube
    if (isSupabaseConfigured && supabase) {
      try {
        const [r1, r2, r3] = await Promise.all([
          supabase.from('site_content').upsert({ key: 'main_content', data: content.value }, { onConflict: 'key' }),
          supabase.from('site_content').upsert({ key: 'experiences_catalog', data: experiences.value }, { onConflict: 'key' }),
          supabase.from('site_content').upsert({ key: 'gallery_images', data: galleryImages.value }, { onConflict: 'key' })
        ]);
        if (r1.error) console.error('Error al guardar main_content en Supabase:', r1.error);
        if (r2.error) console.error('Error al guardar experiences_catalog en Supabase:', r2.error);
        if (r3.error) console.error('Error al guardar gallery_images en Supabase:', r3.error);
      } catch (e) {
        console.warn('Error al sincronizar contenidos con Supabase:', e);
      }
    }
  };

  // Helpers for Supabase mapping (sólo columnas soportadas por public.experiences)
  const mapExpToDb = (e: Experience) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    subtitle: e.subtitle || '',
    summary: e.summary || '',
    description: e.description || '',
    destination_id: e.destinationId || 'dest-cordillera-santiago',
    difficulty: e.difficulty || 'moderate',
    base_price: Number(e.pricing?.basePrice) || 50000,
    cover_image: e.coverImage || { url: '', alt: e.title },
    gallery: e.gallery || [],
    tags: e.tags || [],
    categories: e.categories || [],
    schedule: e.schedule || '',
    meeting_point: e.meetingPoint || '',
    cancellation_policy: e.cancellationPolicy || '',
    itinerary: e.itinerary || [],
    included: e.included || [],
    not_included: e.notIncluded || [],
    status: e.status || 'active',
    updated_at: new Date().toISOString()
  });

  // CRUD de Experiencias
  const addExperience = async (exp: Omit<Experience, 'id' | 'slug'>) => {
    const nextIdNum = experiences.value.length + 1;
    const cleanTitleSlug = exp.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newExp: Experience = {
      ...exp,
      id: `exp-${Date.now()}`,
      slug: `${cleanTitleSlug}-${nextIdNum}`,
      status: 'active'
    };
    experiences.value.unshift(newExp);
    await persist();
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('experiences').upsert(mapExpToDb(newExp), { onConflict: 'id' });
        if (error) {
          console.warn('Supabase upsert experience warning:', error.message, error);
        }
      } catch (e) {
        console.warn('Error saving new experience to Supabase:', e);
      }
    }
    
    return newExp;
  };

  const updateExperience = async (id: string, updated: Partial<Experience>) => {
    const index = experiences.value.findIndex(e => e.id === id);
    if (index !== -1) {
      experiences.value[index] = { ...experiences.value[index], ...updated } as Experience;
      await persist();
      
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('experiences').upsert(mapExpToDb(experiences.value[index]), { onConflict: 'id' });
          if (error) {
            console.warn('Supabase update experience warning:', error.message, error);
          }
        } catch (e) {
          console.warn('Error updating experience in Supabase:', e);
        }
      }
      
      return true;
    }
    return false;
  };

  const deleteExperience = async (id: string) => {
    const index = experiences.value.findIndex(e => e.id === id);
    if (index !== -1) {
      experiences.value.splice(index, 1);
      await persist();
      
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('experiences').delete().eq('id', id);
        } catch (e) {
          console.warn('Error deleting experience in Supabase:', e);
        }
      }
      
      return true;
    }
    return false;
  };

  // CRUD de Servicios de Inicio (Tarjetas de Inicio)
  const saveServiceItem = async (item: ServiceItem) => {
    if (!content.value.home.services.items) {
      content.value.home.services.items = [];
    }
    const idx = content.value.home.services.items.findIndex(s => s.id === item.id);
    if (idx !== -1) {
      content.value.home.services.items[idx] = { ...item };
    } else {
      content.value.home.services.items.push({ ...item });
    }
    await persist();
  };

  const deleteServiceItem = async (id: string) => {
    if (!content.value.home.services.items) return;
    const idx = content.value.home.services.items.findIndex(s => s.id === id);
    if (idx !== -1) {
      content.value.home.services.items.splice(idx, 1);
      await persist();
    }
  };

  // CRUD de Advisors / Equipo
  const saveAdvisor = async (adv: Advisor) => {
    if (!content.value.about.advisors) {
      content.value.about.advisors = [];
    }
    const idx = content.value.about.advisors.findIndex(a => a.id === adv.id);
    if (idx !== -1) {
      content.value.about.advisors[idx] = { ...adv };
    } else {
      content.value.about.advisors.push({ ...adv });
    }
    await persist();
  };

  const deleteAdvisor = async (id: string) => {
    if (!content.value.about.advisors) return;
    const idx = content.value.about.advisors.findIndex(a => a.id === id);
    if (idx !== -1) {
      content.value.about.advisors.splice(idx, 1);
      await persist();
    }
  };

  // CRM Reservas / Ventas Actions
  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    bookings.value.unshift(newBooking);
    await persist();

    // Sincronizar reserva en Supabase en tiempo real
    if (isSupabaseConfigured && supabase) {
      try {
        const fullNotesCombined = [
          newBooking.notes,
          newBooking.customerDocumentType === 'passport' ? 'Documento: Pasaporte/DNI extranjero' : '',
          newBooking.emergencyContactName ? `Contacto emergencia: ${newBooking.emergencyContactName} (${newBooking.emergencyContactPhone || 'S/N'})` : '',
          newBooking.medicalConditions ? `Declaración salud: ${newBooking.medicalConditions}` : '',
          newBooking.invoiceType === 'factura' ? `Comprobante: Factura (${JSON.stringify(newBooking.billingDetails)})` : ''
        ].filter(Boolean).join(' | ');

        const { error } = await supabase.from('bookings').insert({
          id: newBooking.id,
          buy_order: newBooking.buyOrder || `BO-${Date.now()}`,
          customer_name: newBooking.customerName,
          customer_email: newBooking.customerEmail,
          customer_phone: newBooking.customerPhone,
          customer_rut: newBooking.customerRut || null,
          experience_title: newBooking.experienceTitle,
          experience_slug: newBooking.experienceSlug || null,
          booking_date: newBooking.bookingDate,
          pax: newBooking.pax,
          total_price: newBooking.totalPrice,
          status: newBooking.status,
          source: newBooking.source,
          payment_method: newBooking.paymentMethod || 'webpay',
          authorization_code: newBooking.authorizationCode || null,
          card_last4: newBooking.cardLast4 || null,
          notes: fullNotesCombined || null
        });
        if (error) console.warn('Supabase booking insert notice:', error);
      } catch (e) {
        console.warn('Error saving booking to Supabase:', e);
      }
    }

    return newBooking;
  };

  const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const booking = bookings.value.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      await persist();

      if (isSupabaseConfigured && supabase) {
        supabase.from('bookings').update({ status }).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase booking update status notice:', error);
        });
      }

      return true;
    }
    return false;
  };

  const deleteBooking = async (id: string) => {
    const index = bookings.value.findIndex(b => b.id === id);
    if (index !== -1) {
      const removedId = bookings.value[index].id;
      bookings.value.splice(index, 1);
      await persist();

      if (isSupabaseConfigured && supabase) {
        supabase.from('bookings').delete().eq('id', removedId).then(({ error }) => {
          if (error) console.warn('Supabase booking delete notice:', error);
        });
      }

      return true;
    }
    return false;
  };

  // Actualizar Secciones
  const updateContent = async (newContent: Partial<SectionContent>) => {
    content.value = { ...content.value, ...newContent } as SectionContent;
    await persist();
  };

  // Actualizar Pasarela y Datos Bancarios
  const updateGatewaySettings = async (settings: Partial<GatewaySettings>) => {
    content.value.gateway = {
      transbank: { ...content.value.gateway.transbank, ...settings.transbank },
      bankTransfer: { ...content.value.gateway.bankTransfer, ...settings.bankTransfer },
      emailNotifications: { ...content.value.gateway.emailNotifications, ...settings.emailNotifications }
    };
    await persist();
  };

  const addDiscountCode = async (code: Omit<DiscountCode, 'id'>) => {
    const newCode: DiscountCode = {
      ...code,
      id: `disc-${Date.now()}`
    };
    discountCodes.value.push(newCode);
    await persist();
  };

  const updateDiscountCode = async (id: string, code: Partial<DiscountCode>) => {
    const idx = discountCodes.value.findIndex(d => d.id === id);
    if (idx !== -1) {
      discountCodes.value[idx] = { ...discountCodes.value[idx], ...code };
      await persist();
    }
  };

  const deleteDiscountCode = async (id: string) => {
    discountCodes.value = discountCodes.value.filter(d => d.id !== id);
    await persist();
  };

  const addPackage = async (pkg: Omit<TourPackage, 'id'>) => {
    const newPkg: TourPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`
    };
    tourPackages.value.push(newPkg);
    await persist();
  };

  const updatePackage = async (id: string, pkg: Partial<TourPackage>) => {
    const idx = tourPackages.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      tourPackages.value[idx] = { ...tourPackages.value[idx], ...pkg };
      await persist();
    }
  };

  const deletePackage = async (id: string) => {
    tourPackages.value = tourPackages.value.filter(p => p.id !== id);
    await persist();
  };

  // CRUD de Galería Fotográfica
  const addGalleryImage = async (img: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    const newImg: GalleryImage = {
      ...img,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    galleryImages.value.unshift(newImg);
    await persist();
    return newImg;
  };

  const updateGalleryImage = async (updated: GalleryImage) => {
    const idx = galleryImages.value.findIndex(g => g.id === updated.id);
    if (idx !== -1) {
      galleryImages.value[idx] = { ...galleryImages.value[idx], ...updated };
      await persist();
    }
  };

  const deleteGalleryImage = async (id: string) => {
    galleryImages.value = galleryImages.value.filter(g => g.id !== id);
    await persist();
  };

  // CRUD de Transporte Exclusivo & Traslados
  const updateTransportHeader = async (header: { badge: string; title: string; description: string }) => {
    if (!content.value.home.transport) {
      content.value.home.transport = JSON.parse(JSON.stringify(DEFAULT_TRANSPORT_SECTION));
    }
    content.value.home.transport.badge = header.badge;
    content.value.home.transport.title = header.title;
    content.value.home.transport.description = header.description;
    await persist();
  };

  const saveTransportService = async (service: TransportServiceCard) => {
    if (!content.value.home.transport) {
      content.value.home.transport = JSON.parse(JSON.stringify(DEFAULT_TRANSPORT_SECTION));
    }
    const list = [...(content.value.home.transport.services || [])];
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) {
      list[idx] = { ...service };
    } else {
      list.push({ ...service, id: service.id || `trans-${Date.now()}` });
    }
    content.value.home.transport.services = list;
    await persist();
  };

  const deleteTransportService = async (id: string) => {
    if (!content.value.home.transport) return;
    content.value.home.transport.services = (content.value.home.transport.services || []).filter(s => s.id !== id);
    await persist();
  };

  return {
    experiences,
    content,
    bookings,
    discountCodes,
    addDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    galleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    updateTransportHeader,
    saveTransportService,
    deleteTransportService,
    isLoading,
    isDarkMode,
    toggleDarkMode,
    persist,
    syncFromSupabase,
    addExperience,
    updateExperience,
    deleteExperience,
    saveServiceItem,
    deleteServiceItem,
    saveAdvisor,
    deleteAdvisor,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    updateContent,
    updateGatewaySettings,
    tourPackages,
    addPackage,
    updatePackage,
    deletePackage
  };
});
