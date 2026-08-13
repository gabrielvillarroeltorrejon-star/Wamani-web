import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mockExperiences } from '@/entities/experience/api/mockData';
import type { Experience } from '@/entities/experience/model/schemas';
import { supabase, isSupabaseConfigured } from '@/shared/api/supabaseClient';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerRut?: string;
  experienceTitle: string;
  experienceSlug?: string;
  bookingDate: string;
  pax: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  source: 'automatic' | 'manual';
  paymentMethod?: 'webpay' | 'transfer' | 'cash' | 'manual';
  buyOrder?: string;
  authorizationCode?: string;
  cardLast4?: string;
  notes?: string;
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
  gateway: GatewaySettings;
}

const DEFAULT_CONTENT: SectionContent = {
  home: {
    hero: {
      title: 'WAMANI',
      subtitle: 'Ecoturismo desde Chile',
      videoUrl: 'https://wamani.cl/wp-content/uploads/2025/10/VIDEO-PAGINA-WEB.mp4'
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
    }
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
    email: 'contacto@wamani.cl',
    address: 'O\'Higgins 425, Pucón, Chile',
    instagramUrl: 'https://instagram.com/wamani.experience',
    tripadvisorUrl: 'https://www.tripadvisor.cl/'
  },
  gateway: {
    transbank: {
      environment: 'INTEGRATION',
      commerceCode: '597055555532',
      apiKey: '579B532A7440BB063079DED945F63E22AFD11A5FD53A474E83623606EA7AB382',
      isEnabled: true
    },
    bankTransfer: {
      bankName: 'Banco Santander Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '89-01234-5',
      accountRut: '77.890.123-4',
      accountHolder: 'Wamani SpA',
      notificationEmail: 'pagos@wamani.cl',
      instructions: 'Una vez realizada la transferencia, envía el comprobante vía WhatsApp o al correo pagos@wamani.cl indicando tu número de orden.',
      isEnabled: true
    },
    emailNotifications: {
      smtpConfigured: true,
      adminEmail: 'reservas@wamani.cl',
      sendVoucherToCustomer: true
    }
  }
};

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'b-1001',
    customerName: 'Carolina Valenzuela',
    customerEmail: 'caro.valen@gmail.com',
    customerPhone: '+56988776655',
    experienceTitle: 'Termas Pucón Indómito + Sunset en Lancha',
    bookingDate: '2026-10-12',
    pax: 2,
    totalPrice: 130000,
    status: 'confirmed',
    source: 'automatic',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b-1002',
    customerName: 'Ricardo Medina',
    customerEmail: 'r.medina@outlook.com',
    customerPhone: '+56944332211',
    experienceTitle: 'Ascenso al Volcán Villarrica',
    bookingDate: '2026-10-15',
    pax: 1,
    totalPrice: 120000,
    status: 'pending',
    source: 'manual',
    createdAt: new Date().toISOString()
  }
];

export const useContentStore = defineStore('content', () => {
  const experiences = ref<Experience[]>([]);
  const content = ref<SectionContent>(DEFAULT_CONTENT);
  const bookings = ref<Booking[]>([]);
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
    const savedExperiences = localStorage.getItem('wamani_experiences');
    const savedContent = localStorage.getItem('wamani_content');
    const savedBookings = localStorage.getItem('wamani_bookings');
    localStorage.removeItem('wamani_dark_mode');

    if (savedExperiences) {
      experiences.value = JSON.parse(savedExperiences);
    } else {
      experiences.value = [...mockExperiences];
      localStorage.setItem('wamani_experiences', JSON.stringify(mockExperiences));
    }

    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        content.value = {
          home: { ...DEFAULT_CONTENT.home, ...parsed.home },
          about: {
            ...DEFAULT_CONTENT.about,
            ...parsed.about,
            historyImage: DEFAULT_CONTENT.about.historyImage,
            heroImage: DEFAULT_CONTENT.about.heroImage,
            accreditations: { ...DEFAULT_CONTENT.about.accreditations, ...parsed.about?.accreditations },
            advisors: (parsed.about?.advisors && parsed.about.advisors.length === 3 && parsed.about.advisors[0].name === 'Camilo Tamayo' && parsed.about.advisors[0].image.includes('1551632811'))
              ? parsed.about.advisors
              : DEFAULT_CONTENT.about.advisors
          },
          contact: { ...DEFAULT_CONTENT.contact, ...parsed.contact },
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
      bookings.value = JSON.parse(savedBookings);
    } else {
      bookings.value = [...DEFAULT_BOOKINGS];
      localStorage.setItem('wamani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    }

    applyTheme();
  };

  // Sincronización en la Nube con Supabase
  const syncFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // 1. Cargar experiencias desde Supabase
      const { data: expData, error: expError } = await supabase.from('experiences').select('*');
      if (!expError && expData && expData.length > 0) {
        experiences.value = expData.map((e: any) => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          subtitle: e.subtitle || '',
          summary: e.summary || '',
          description: e.description || '',
          destinationId: e.destination_id || 'Pucón',
          difficulty: e.difficulty || 'easy',
          pricing: {
            basePrice: Number(e.base_price),
            currency: 'CLP'
          },
          duration: { value: 6, unit: 'hours' },
          languages: e.languages || ['es', 'en'],
          capacity: e.capacity || { min: 1, max: 12 },
          coverImage: e.cover_image || { url: '', alt: '' },
          gallery: e.gallery || [],
          tags: e.tags || [],
          categories: e.categories || [],
          schedule: e.schedule,
          meetingPoint: e.meeting_point,
          cancellationPolicy: e.cancellation_policy,
          itinerary: e.itinerary || [],
          included: e.included || [],
          notIncluded: e.not_included || [],
          status: (e.status as 'active' | 'draft' | 'archived') || 'active'
        }));
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
    } catch (e) {
      console.warn('Nota: Supabase offline o no alcanzable, usando caché local:', e);
    }
  };

  loadFromStorage();
  syncFromSupabase();

  // Guardar en Storage y Nube
  const persist = async () => {
    localStorage.setItem('wamani_experiences', JSON.stringify(experiences.value));
    localStorage.setItem('wamani_content', JSON.stringify(content.value));
    localStorage.setItem('wamani_bookings', JSON.stringify(bookings.value));

    // Si Supabase está configurado, guardar también en la nube de forma asíncrona
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_content').upsert({ key: 'main_content', data: content.value });
      } catch (e) {
        console.warn('Error al sincronizar contenidos con Supabase:', e);
      }
    }
  };

  // CRUD de Experiencias
  const addExperience = (exp: Omit<Experience, 'id' | 'slug'>) => {
    const nextIdNum = experiences.value.length + 1;
    const cleanTitleSlug = exp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newExp: Experience = {
      ...exp,
      id: `exp-${Date.now()}`,
      slug: `${cleanTitleSlug}-${nextIdNum}`,
      status: 'active'
    };
    experiences.value.push(newExp);
    persist();
    return newExp;
  };

  const updateExperience = (id: string, updated: Partial<Experience>) => {
    const index = experiences.value.findIndex(e => e.id === id);
    if (index !== -1) {
      experiences.value[index] = { ...experiences.value[index], ...updated } as Experience;
      persist();
      return true;
    }
    return false;
  };

  const deleteExperience = (id: string) => {
    const index = experiences.value.findIndex(e => e.id === id);
    if (index !== -1) {
      experiences.value.splice(index, 1);
      persist();
      return true;
    }
    return false;
  };

  // CRUD de Servicios de Inicio (Tarjetas de Inicio)
  const saveServiceItem = (item: ServiceItem) => {
    if (!content.value.home.services.items) {
      content.value.home.services.items = [];
    }
    const idx = content.value.home.services.items.findIndex(s => s.id === item.id);
    if (idx !== -1) {
      content.value.home.services.items[idx] = { ...item };
    } else {
      content.value.home.services.items.push({ ...item });
    }
    persist();
  };

  const deleteServiceItem = (id: string) => {
    if (!content.value.home.services.items) return;
    const idx = content.value.home.services.items.findIndex(s => s.id === id);
    if (idx !== -1) {
      content.value.home.services.items.splice(idx, 1);
      persist();
    }
  };

  // CRUD de Advisors / Equipo
  const saveAdvisor = (adv: Advisor) => {
    if (!content.value.about.advisors) {
      content.value.about.advisors = [];
    }
    const idx = content.value.about.advisors.findIndex(a => a.id === adv.id);
    if (idx !== -1) {
      content.value.about.advisors[idx] = { ...adv };
    } else {
      content.value.about.advisors.push({ ...adv });
    }
    persist();
  };

  const deleteAdvisor = (id: string) => {
    if (!content.value.about.advisors) return;
    const idx = content.value.about.advisors.findIndex(a => a.id === id);
    if (idx !== -1) {
      content.value.about.advisors.splice(idx, 1);
      persist();
    }
  };

  // CRM Reservas / Ventas Actions
  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    bookings.value.unshift(newBooking);
    persist();
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const booking = bookings.value.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      persist();
      return true;
    }
    return false;
  };

  const deleteBooking = (id: string) => {
    const index = bookings.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings.value.splice(index, 1);
      persist();
      return true;
    }
    return false;
  };

  // Actualizar Secciones
  const updateContent = (newContent: Partial<SectionContent>) => {
    content.value = { ...content.value, ...newContent } as SectionContent;
    persist();
  };

  // Actualizar Pasarela y Datos Bancarios
  const updateGatewaySettings = (settings: Partial<GatewaySettings>) => {
    content.value.gateway = {
      transbank: { ...content.value.gateway.transbank, ...settings.transbank },
      bankTransfer: { ...content.value.gateway.bankTransfer, ...settings.bankTransfer },
      emailNotifications: { ...content.value.gateway.emailNotifications, ...settings.emailNotifications }
    };
    persist();
  };

  // Restaurar todo a valores por defecto
  const restoreDefaults = () => {
    experiences.value = [...mockExperiences];
    content.value = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    bookings.value = [...DEFAULT_BOOKINGS];
    isDarkMode.value = false;
    localStorage.removeItem('wamani_experiences');
    localStorage.removeItem('wamani_content');
    localStorage.removeItem('wamani_bookings');
    localStorage.removeItem('wamani_dark_mode');
    persist();
    applyTheme();
  };

  return {
    experiences,
    content,
    bookings,
    isDarkMode,
    toggleDarkMode,
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
    restoreDefaults
  };
});
