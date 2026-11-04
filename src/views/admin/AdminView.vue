<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useContentStore, type ServiceItem, type Advisor, type GalleryImage, type TransportServiceCard } from '@/shared/stores/contentStore';
import { compressImageFile, compressMultipleImageFiles } from '@/shared/lib/imageCompressor';
import { uploadImageToStorageOrBase64, uploadMultipleImagesToStorage } from '@/shared/lib/supabaseStorage';
import { formatLanguages } from '@/shared/lib/formatters';
import type { Experience } from '@/entities/experience/model/schemas';

const contentStore = useContentStore();

// Security / Authentication State
const isAuthenticated = ref(false);
const pinInput = ref('');
const loginError = ref(false);
const failedAttempts = ref(0);
const lockUntil = ref<number | null>(null);
const lockCountdown = ref(0);

const handleLogin = () => {
  if (lockUntil.value && Date.now() < lockUntil.value) {
    alert(`Acceso bloqueado por seguridad. Espera ${Math.ceil((lockUntil.value - Date.now()) / 1000)} segundos.`);
    return;
  }

  if (pinInput.value === 'wamani2026') {
    isAuthenticated.value = true;
    loginError.value = false;
    failedAttempts.value = 0;
    lockUntil.value = null;
  } else {
    loginError.value = true;
    failedAttempts.value++;
    pinInput.value = '';

    if (failedAttempts.value >= 5) {
      lockUntil.value = Date.now() + 60000;
      lockCountdown.value = 60;
      const interval = setInterval(() => {
        if (lockUntil.value) {
          const rem = Math.ceil((lockUntil.value - Date.now()) / 1000);
          lockCountdown.value = Math.max(0, rem);
          if (rem <= 0) {
            clearInterval(interval);
            lockUntil.value = null;
            failedAttempts.value = 0;
          }
        }
      }, 1000);
    }
  }
};

// Tabs State
const activeTab = ref<'services' | 'cards-home' | 'content-home' | 'transport-mgmt' | 'content-about' | 'advisors' | 'contact' | 'crm' | 'gateway' | 'legal' | 'promotions' | 'packages' | 'quote-generator' | 'gallery-mgmt'>('services');
import { supabase } from '@/shared/api/supabaseClient';
const supabaseOrders = ref([]);
const fetchOrders = async () => {
  if (!supabase) return;
  const { data, error } = await supabase.from('orders_v2').select('*, order_items_v2(*)').order('created_at', { ascending: false });
  if (!error && data) supabaseOrders.value = data;
};
onMounted(() => {
  fetchOrders();
});


// Notification State
const toastMessage = ref('');
const showToast = ref(false);

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// --- 1. EXPERIENCES CATALOG MANAGEMENT ---
const showExpModal = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const editingExpId = ref<string | null>(null);
const expSearchQuery = ref('');

const expForm = ref({
  title: '',
  subtitle: '',
  summary: '',
  description: '',
  destinationId: 'Cordillera de Santiago',
  difficulty: 'moderate' as 'easy' | 'moderate' | 'hard' | 'expert',
  basePrice: 50000,
  coverImageUrl: '',
  heroBannerUrl: '',
  galleryUrls: [] as string[],
  galleryUrlInput: '',
  languages: ['Español', 'Inglés'] as string[],
  customLanguageInput: '',
  tags: '',
  categories: '',
  schedule: '',
  meetingPoint: 'Recogida directamente en tu hotel dentro del perímetro o puntos fijos Metro Baquedano y Metro Tobalaba.',
  cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
  itineraryRaw: '',
  includedRaw: '',
  notIncludedRaw: '',
  guaranteesRaw: ''
});

// Opciones de Idiomas para Guiado de Tours
const availableLanguageOptions = [
  { id: 'Español', label: 'Español', flag: '🇪🇸' },
  { id: 'Inglés', label: 'Inglés', flag: '🇬🇧' },
  { id: 'Portugués', label: 'Portugués', flag: '🇧🇷' },
  { id: 'Francés', label: 'Francés', flag: '🇫🇷' },
  { id: 'Alemán', label: 'Alemán', flag: '🇩🇪' },
  { id: 'Italiano', label: 'Italiano', flag: '🇮🇹' }
];

const isLanguageSelected = (langName: string): boolean => {
  return expForm.value.languages.some(l => {
    const lLower = l.toLowerCase();
    const nameLower = langName.toLowerCase();
    return (
      lLower === nameLower ||
      (nameLower === 'español' && lLower === 'es') ||
      (nameLower === 'inglés' && lLower === 'en') ||
      (nameLower === 'portugués' && lLower === 'pt') ||
      (nameLower === 'francés' && lLower === 'fr') ||
      (nameLower === 'alemán' && lLower === 'de') ||
      (nameLower === 'italiano' && lLower === 'it')
    );
  });
};

const toggleLanguage = (langName: string) => {
  const idx = expForm.value.languages.findIndex(l => {
    const lLower = l.toLowerCase();
    const nameLower = langName.toLowerCase();
    return (
      lLower === nameLower ||
      (nameLower === 'español' && lLower === 'es') ||
      (nameLower === 'inglés' && lLower === 'en') ||
      (nameLower === 'portugués' && lLower === 'pt') ||
      (nameLower === 'francés' && lLower === 'fr') ||
      (nameLower === 'alemán' && lLower === 'de') ||
      (nameLower === 'italiano' && lLower === 'it')
    );
  });

  if (idx !== -1) {
    expForm.value.languages.splice(idx, 1);
  } else {
    expForm.value.languages.push(langName);
  }
};

const addCustomLanguage = () => {
  const val = expForm.value.customLanguageInput?.trim();
  if (!val) return;
  const exists = expForm.value.languages.some(l => l.toLowerCase() === val.toLowerCase());
  if (!exists) {
    expForm.value.languages.push(val);
    triggerToast(`Idioma "${val}" añadido.`);
  }
  expForm.value.customLanguageInput = '';
};

const removeLanguage = (index: number) => {
  expForm.value.languages.splice(index, 1);
};

const addGalleryUrl = () => {
  if (expForm.value.galleryUrlInput.trim()) {
    expForm.value.galleryUrls.push(expForm.value.galleryUrlInput.trim());
    expForm.value.galleryUrlInput = '';
    triggerToast('Foto añadida a la galería del tour.');
  }
};

const removeGalleryImage = (index: number) => {
  expForm.value.galleryUrls.splice(index, 1);
};

// Estado reactivo de guardado y carga de imágenes en Tours
const isSavingExp = ref(false);
const isUploadingCover = ref(false);
const isUploadingHero = ref(false);
const isUploadingGallery = ref(false);

const handleMultipleGalleryUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length > 0) {
    isUploadingGallery.value = true;
    triggerToast(`Optimizando e importando ${files.length} fotos...`);
    try {
      const urls = await uploadMultipleImagesToStorage(files, { maxWidth: 900, quality: 0.75, folder: 'gallery' });
      urls.forEach(url => {
        expForm.value.galleryUrls.push(url);
      });
      triggerToast('¡Imágenes optimizadas y añadidas a la galería!');
    } catch (err: any) {
      alert('Error al procesar imágenes: ' + (err.message || ''));
    } finally {
      isUploadingGallery.value = false;
      input.value = '';
    }
  }
};

const filteredExperiences = computed(() => {
  if (!expSearchQuery.value.trim()) return contentStore.experiences;
  const q = expSearchQuery.value.toLowerCase();
  return contentStore.experiences.filter(exp => 
    exp.title.toLowerCase().includes(q) ||
    exp.destinationId.toLowerCase().includes(q) ||
    exp.summary.toLowerCase().includes(q) ||
    exp.tags.some(t => t.toLowerCase().includes(q))
  );
});

const openAddModal = () => {
  modalMode.value = 'add';
  editingExpId.value = null;
  expForm.value = {
    title: '',
    subtitle: '',
    summary: '',
    description: '',
    destinationId: 'Cordillera de Santiago',
    difficulty: 'moderate',
    basePrice: 50000,
    coverImageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
    heroBannerUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    ],
    galleryUrlInput: '',
    languages: ['Español', 'Inglés'],
    customLanguageInput: '',
    tags: 'Cordillera, Naturaleza',
    categories: 'Naturaleza, Cordillera',
    schedule: '08:00 - 18:00',
    meetingPoint: 'Recogida directamente en tu hotel dentro del perímetro o puntos fijos Metro Baquedano y Metro Tobalaba.',
    cancellationPolicy: 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itineraryRaw: '08:00 - Salida desde Santiago - Inicio del traslado según la recogida coordinada.\n10:30 - Miradores cordilleranos - Parada fotográfica y paisajes de alta montaña.\n13:00 - Almuerzo / Picnic - Tiempo libre para fotografías y descanso.\n17:30 - Regreso a Santiago - Retorno al punto de inicio.',
    includedRaw: 'Transporte ida y vuelta desde Santiago\nGuía turístico profesional en idiomas seleccionados\nSeguro de accidentes personales y asistencia\nParada en rental / actividades descritas',
    notIncludedRaw: 'Alimentación adicional o bebidas no descritas\nGastos personales y compras\nPropinas voluntarias',
    guaranteesRaw: 'Prestador SERNATUR: Registro Oficial de Turismo N° 84219\nSeguro Incluido: Cobertura de rescate y asistencia en montaña\nGarantía Climática: Reprogramación 100% garantizada por condiciones de clima\nPago Cifrado: Transbank Webpay Plus estándar internacional PCI-DSS'
  };
  showExpModal.value = true;
};

const openEditModal = (exp: Experience) => {
  modalMode.value = 'edit';
  editingExpId.value = exp.id;
  
  const itineraryText = exp.itinerary
    ? exp.itinerary.map(i => `${i.dayOrTime} - ${i.title} - ${i.description}`).join('\n')
    : '';

  expForm.value = {
    title: exp.title,
    subtitle: exp.subtitle || '',
    summary: exp.summary,
    description: exp.description,
    destinationId: exp.destinationId,
    difficulty: exp.difficulty,
    basePrice: exp.pricing.basePrice,
    coverImageUrl: exp.coverImage.url,
    heroBannerUrl: exp.heroBannerUrl || exp.coverImage.url,
    galleryUrls: exp.gallery ? exp.gallery.map(g => g.url) : [],
    galleryUrlInput: '',
    languages: exp.languages && exp.languages.length > 0 ? [...exp.languages] : ['Español', 'Inglés'],
    customLanguageInput: '',
    tags: exp.tags.join(', '),
    categories: exp.categories.join(', '),
    schedule: exp.schedule || '',
    meetingPoint: exp.meetingPoint || 'Recogida directamente en tu hotel dentro del perímetro.',
    cancellationPolicy: exp.cancellationPolicy || 'Cancelación gratuita con al menos 48 horas de anticipación.',
    itineraryRaw: itineraryText,
    includedRaw: (exp.included && exp.included.length > 0)
      ? exp.included.join('\n')
      : 'Guía profesional certificado\nSeguro de accidentes personales\nEquipo técnico completo',
    notIncludedRaw: (exp.notIncluded && exp.notIncluded.length > 0)
      ? exp.notIncluded.join('\n')
      : 'Propinas voluntarias\nGastos personales',
    guaranteesRaw: (exp.guarantees && exp.guarantees.length > 0)
      ? exp.guarantees.join('\n')
      : 'Prestador SERNATUR: Registro Oficial de Turismo N° 84219\nSeguro Incluido: Cobertura de rescate y asistencia en montaña\nGarantía Climática: Reprogramación 100% garantizada por condiciones de clima\nPago Cifrado: Transbank Webpay Plus estándar internacional PCI-DSS'
  };
  showExpModal.value = true;
};

const handleHeroBannerUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    isUploadingHero.value = true;
    triggerToast('Optimizando fondo de cabecera panorámico...');
    try {
      const url = await uploadImageToStorageOrBase64(file, { maxWidth: 1440, quality: 0.78, folder: 'banners' });
      expForm.value.heroBannerUrl = url;
      triggerToast('¡Fondo de cabecera optimizado y listo!');
    } catch (err: any) {
      alert('Error al procesar la imagen: ' + (err.message || ''));
    } finally {
      isUploadingHero.value = false;
      input.value = '';
    }
  }
};

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    isUploadingCover.value = true;
    triggerToast('Optimizando y procesando imagen de portada...');
    try {
      const url = await uploadImageToStorageOrBase64(file, { maxWidth: 1000, quality: 0.76, folder: 'covers' });
      expForm.value.coverImageUrl = url;
      triggerToast('¡Imagen optimizada con éxito!');
    } catch (err: any) {
      alert('Error al procesar la imagen: ' + (err.message || ''));
    } finally {
      isUploadingCover.value = false;
      input.value = '';
    }
  }
};

const saveExperience = async () => {
  if (isSavingExp.value) return;
  isSavingExp.value = true;
  triggerToast('Guardando tour en la nube...');

  try {
    const itinerary = expForm.value.itineraryRaw
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split('-').map(p => p.trim());
        return {
          dayOrTime: parts[0] || 'Todo el día',
          title: parts[1] || 'Actividad',
          description: parts[2] || parts[1] || 'Sin descripción'
        };
      });

    const gallery = expForm.value.galleryUrls.map((url, i) => ({
      url,
      alt: `${expForm.value.title} - Foto ${i + 1}`
    }));

    const included = expForm.value.includedRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const notIncluded = expForm.value.notIncludedRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const guarantees = expForm.value.guaranteesRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedExp: Omit<Experience, 'id' | 'slug'> = {
      status: 'active',
      title: expForm.value.title,
      subtitle: expForm.value.subtitle,
      summary: expForm.value.summary,
      description: expForm.value.description,
      destinationId: expForm.value.destinationId,
      difficulty: expForm.value.difficulty,
      pricing: {
        currency: 'CLP',
        basePrice: Number(expForm.value.basePrice)
      },
      coverImage: {
        url: expForm.value.coverImageUrl || 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
        alt: expForm.value.title
      },
      heroBannerUrl: expForm.value.heroBannerUrl || expForm.value.coverImageUrl || '',
      guarantees: guarantees.length > 0 ? guarantees : [
        'Prestador SERNATUR: Registro Oficial de Turismo N° 84219',
        'Seguro Incluido: Cobertura de rescate y asistencia en montaña',
        'Garantía Climática: Reprogramación 100% garantizada por clima',
        'Pago Cifrado: Transbank Webpay Plus estándar PCI-DSS'
      ],
      gallery,
      tags: expForm.value.tags.split(',').map(t => t.trim()).filter(Boolean),
      categories: expForm.value.categories.split(',').map(c => c.trim()).filter(Boolean),
      schedule: expForm.value.schedule,
      meetingPoint: expForm.value.meetingPoint,
      cancellationPolicy: expForm.value.cancellationPolicy,
      itinerary,
      duration: { value: 8, unit: 'hours' },
      languages: expForm.value.languages && expForm.value.languages.length > 0 ? [...expForm.value.languages] : ['Español', 'Inglés'],
      capacity: { min: 2, max: 12 },
      included: included.length > 0 ? included : ['Guía certificado', 'Seguro de accidentes', 'Equipo técnico'],
      notIncluded: notIncluded.length > 0 ? notIncluded : ['Propinas', 'Gastos personales']
    };

    if (modalMode.value === 'add') {
      await contentStore.addExperience(parsedExp);
      triggerToast('¡Servicio añadido al catálogo y publicado en la nube!');
    } else if (editingExpId.value) {
      await contentStore.updateExperience(editingExpId.value, parsedExp);
      triggerToast('¡Servicio actualizado correctamente en la nube!');
    }

    showExpModal.value = false;
  } catch (err: any) {
    alert('Error al guardar el tour: ' + (err.message || ''));
  } finally {
    isSavingExp.value = false;
  }
};

const copyTourLink = async (exp: Experience) => {
  const url = `${window.location.origin}/experiencias/${exp.slug}`;
  try {
    await navigator.clipboard.writeText(url);
    triggerToast('¡Enlace directo copiado al portapapeles!');
  } catch {
    prompt('Copia este enlace directo del tour:', url);
  }
};

const shareTourWhatsApp = (exp: Experience) => {
  const url = `${window.location.origin}/experiencias/${exp.slug}`;
  const text = encodeURIComponent(
    `🏔️ *${exp.title}* - Wamani Experience\n` +
    `📍 Destino: ${exp.destinationId}\n` +
    `💰 Valor: ${formatPrice(exp.pricing.basePrice)}\n\n` +
    `Revisa todos los detalles, qué incluye e itinerario aquí:\n${url}`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

const duplicateExperience = (exp: Experience) => {
  const cloned: Omit<Experience, 'id' | 'slug'> = {
    status: exp.status,
    title: `${exp.title} (Copia)`,
    subtitle: exp.subtitle,
    summary: exp.summary,
    description: exp.description,
    destinationId: exp.destinationId,
    difficulty: exp.difficulty,
    pricing: { ...exp.pricing },
    coverImage: { ...exp.coverImage },
    gallery: [...(exp.gallery || [])],
    tags: [...exp.tags],
    categories: [...exp.categories],
    schedule: exp.schedule,
    meetingPoint: exp.meetingPoint,
    cancellationPolicy: exp.cancellationPolicy,
    itinerary: exp.itinerary ? JSON.parse(JSON.stringify(exp.itinerary)) : [],
    duration: { ...exp.duration },
    languages: [...exp.languages],
    capacity: { ...exp.capacity },
    included: [...exp.included],
    notIncluded: [...exp.notIncluded]
  };
  contentStore.addExperience(cloned);
  triggerToast('¡Tour duplicado con éxito en el catálogo!');
};

const deleteExp = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este servicio del catálogo?')) {
    contentStore.deleteExperience(id);
    triggerToast('Servicio eliminado.');
  }
};

// --- 2. HOME CARDS / SERVICES MANAGEMENT ---
const showServiceItemModal = ref(false);
const serviceItemMode = ref<'add' | 'edit'>('add');
const editingServiceItemId = ref<string | null>(null);

const serviceItemForm = ref({
  id: '',
  title: '',
  subtitle: '',
  coverImage: '',
  descriptionRaw: '',
  targetAudience: '',
  characteristicsRaw: '',
  galleryRaw: ''
});

const openAddServiceItemModal = () => {
  serviceItemMode.value = 'add';
  editingServiceItemId.value = null;
  serviceItemForm.value = {
    id: `serv-${Date.now()}`,
    title: '',
    subtitle: '',
    coverImage: 'https://images.unsplash.com/photo-1576082761138-0cc8404a3487?auto=format&fit=crop&w=1200&q=80',
    descriptionRaw: '',
    targetAudience: '',
    characteristicsRaw: '',
    galleryRaw: ''
  };
  showServiceItemModal.value = true;
};

const openEditServiceItemModal = (item: ServiceItem) => {
  serviceItemMode.value = 'edit';
  editingServiceItemId.value = item.id;
  serviceItemForm.value = {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    coverImage: item.coverImage,
    descriptionRaw: item.description ? item.description.join('\n\n') : '',
    targetAudience: item.targetAudience || '',
    characteristicsRaw: item.characteristics ? item.characteristics.join('\n') : '',
    galleryRaw: item.gallery ? item.gallery.join('\n') : ''
  };
  showServiceItemModal.value = true;
};

const handleServiceCoverUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    triggerToast('Optimizando imagen de portada...');
    try {
      serviceItemForm.value.coverImage = await uploadImageToStorageOrBase64(file, { maxWidth: 1000, quality: 0.76, folder: 'services' });
      triggerToast('¡Imagen optimizada y guardada!');
    } catch (err: any) {
      alert('Error al procesar imagen: ' + (err.message || ''));
    } finally {
      input.value = '';
    }
  }
};

const saveServiceItemForm = async () => {
  const itemData: ServiceItem = {
    id: serviceItemForm.value.id || `serv-${Date.now()}`,
    title: serviceItemForm.value.title,
    subtitle: serviceItemForm.value.subtitle,
    coverImage: serviceItemForm.value.coverImage,
    description: serviceItemForm.value.descriptionRaw.split('\n\n').map(p => p.trim()).filter(Boolean),
    targetAudience: serviceItemForm.value.targetAudience,
    characteristics: serviceItemForm.value.characteristicsRaw.split('\n').map(c => c.trim()).filter(Boolean),
    gallery: serviceItemForm.value.galleryRaw.split('\n').map(g => g.trim()).filter(Boolean)
  };

  await contentStore.saveServiceItem(itemData);
  triggerToast('¡Tarjeta de Inicio guardada con éxito!');
  showServiceItemModal.value = false;
};

const deleteServiceItem = (id: string) => {
  if (confirm('¿Deseas eliminar esta tarjeta de la página de inicio?')) {
    contentStore.deleteServiceItem(id);
    triggerToast('Tarjeta eliminada.');
  }
};

// --- 2.1 TRANSPORTE & TRASLADOS MANAGEMENT ---
const transportHeaderForm = ref({
  badge: 'MOVILIDAD PRIVADA & CONFORT',
  title: 'Transporte Exclusivo & Traslados Cordilleranos',
  description: 'Conectamos los principales aeropuertos y destinos del sur de Chile con conductores profesionales, puntualidad rigurosa y vehículos acondicionados para la montaña.'
});

watch(() => contentStore.content.home?.transport, (val) => {
  if (val) {
    transportHeaderForm.value = {
      badge: val.badge || 'MOVILIDAD PRIVADA & CONFORT',
      title: val.title || 'Transporte Exclusivo & Traslados Cordilleranos',
      description: val.description || ''
    };
  }
}, { immediate: true });

const saveTransportHeader = () => {
  contentStore.updateTransportHeader({ ...transportHeaderForm.value });
  triggerToast('¡Encabezado de la sección de Transporte actualizado con éxito!');
};

const showTransportModal = ref(false);
const transportModalMode = ref<'add' | 'edit'>('add');
const editingTransportId = ref<string | null>(null);

const transportCardForm = ref<TransportServiceCard>({
  id: '',
  badge: '',
  featuredBadge: '',
  title: '',
  description: '',
  icon: 'bi-car-front-fill',
  imageUrl: '',
  features: [],
  buttonText: 'Cotizar Traslado',
  buttonStyle: 'outline',
  whatsAppTag: ''
});

const transportFeaturesText = ref('');

const openAddTransportModal = () => {
  transportModalMode.value = 'add';
  editingTransportId.value = null;
  transportCardForm.value = {
    id: `trans-${Date.now()}`,
    badge: 'Aeropuertos ZCO / PMC',
    featuredBadge: '',
    title: '',
    description: '',
    icon: 'bi-airplane-engines',
    imageUrl: '',
    features: [
      'Monitoreo de vuelo en tiempo real',
      'Recepción personalizada con letrero',
      'Asistencia completa con equipaje'
    ],
    buttonText: 'Cotizar Traslado',
    buttonStyle: 'outline',
    whatsAppTag: ''
  };
  transportFeaturesText.value = transportCardForm.value.features.join('\n');
  showTransportModal.value = true;
};

const openEditTransportModal = (srv: TransportServiceCard) => {
  transportModalMode.value = 'edit';
  editingTransportId.value = srv.id;
  transportCardForm.value = {
    id: srv.id,
    badge: srv.badge || '',
    featuredBadge: srv.featuredBadge || '',
    title: srv.title || '',
    description: srv.description || '',
    icon: srv.icon || 'bi-car-front-fill',
    imageUrl: srv.imageUrl || '',
    features: Array.isArray(srv.features) ? [...srv.features] : [],
    buttonText: srv.buttonText || 'Cotizar Traslado',
    buttonStyle: srv.buttonStyle || 'outline',
    whatsAppTag: srv.whatsAppTag || ''
  };
  transportFeaturesText.value = transportCardForm.value.features.join('\n');
  showTransportModal.value = true;
};

const handleTransportImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    triggerToast('Optimizando fotografía del servicio...');
    try {
      const url = await uploadImageToStorageOrBase64(file, { maxWidth: 1000, quality: 0.76, folder: 'transport' });
      transportCardForm.value.imageUrl = url;
      triggerToast('¡Fotografía optimizada y cargada!');
    } catch (err: any) {
      alert('Error al procesar la imagen: ' + (err.message || ''));
    } finally {
      input.value = '';
    }
  }
};

const removeTransportImage = () => {
  transportCardForm.value.imageUrl = '';
};

const saveTransportCardForm = async () => {
  const lines = transportFeaturesText.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const serviceToSave: TransportServiceCard = {
    ...transportCardForm.value,
    id: editingTransportId.value || transportCardForm.value.id || `trans-${Date.now()}`,
    features: lines
  };

  await contentStore.saveTransportService(serviceToSave);
  showTransportModal.value = false;
  triggerToast(transportModalMode.value === 'add' ? '¡Servicio de transporte añadido con éxito!' : '¡Servicio de transporte actualizado con éxito!');
};

const deleteTransportService = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este servicio de transporte?')) {
    contentStore.deleteTransportService(id);
    triggerToast('Servicio de transporte eliminado.');
  }
};

// --- 3. ADVISORS & TEAM MANAGEMENT ---
const showAdvisorModal = ref(false);
const advisorMode = ref<'add' | 'edit'>('add');
const editingAdvisorId = ref<string | null>(null);

const advisorForm = ref({
  id: '',
  name: '',
  role: '',
  image: '',
  bio: ''
});

const openAddAdvisorModal = () => {
  advisorMode.value = 'add';
  editingAdvisorId.value = null;
  advisorForm.value = {
    id: `adv-${Date.now()}`,
    name: '',
    role: '',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    bio: ''
  };
  showAdvisorModal.value = true;
};

const openEditAdvisorModal = (adv: Advisor) => {
  advisorMode.value = 'edit';
  editingAdvisorId.value = adv.id;
  advisorForm.value = {
    id: adv.id,
    name: adv.name,
    role: adv.role,
    image: adv.image,
    bio: adv.bio
  };
  showAdvisorModal.value = true;
};

const handleAdvisorImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    if (file.size > 10000000) {
      alert('La imagen supera los 10MB.');
      return;
    }
    try {
      advisorForm.value.image = await uploadImageToStorageOrBase64(file, { maxWidth: 600, quality: 0.8, folder: 'advisors' });
      triggerToast('Imagen de integrante subida.');
    } catch {
      alert('No se pudo procesar la fotografía.');
    } finally {
      input.value = '';
    }
  }
};

const saveAdvisorForm = async () => {
  const advData: Advisor = {
    id: advisorForm.value.id || `adv-${Date.now()}`,
    name: advisorForm.value.name,
    role: advisorForm.value.role,
    image: advisorForm.value.image,
    bio: advisorForm.value.bio
  };

  await contentStore.saveAdvisor(advData);
  triggerToast('¡Ficha de Integrante guardada!');
  showAdvisorModal.value = false;
};

const deleteAdvisor = (id: string) => {
  if (confirm('¿Eliminar a este integrante del equipo/advisors?')) {
    contentStore.deleteAdvisor(id);
    triggerToast('Integrante eliminado.');
  }
};

// --- 4. CRM & BOOKINGS ---
const showCrmModal = ref(false);
const crmSearchQuery = ref('');
const crmStatusFilter = ref<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

const crmForm = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerRut: '',
  experienceTitle: '',
  bookingDate: '',
  pax: 2,
  totalPrice: 100000,
  paymentMethod: 'manual' as 'webpay' | 'transfer' | 'cash' | 'manual',
  status: 'pending' as 'pending' | 'confirmed' | 'cancelled',
  notes: ''
});

// CRM State & Details Modal
const selectedBookingForDetails = ref<any | null>(null);
const showBookingDetailsModal = ref(false);

const openBookingDetailsModal = (booking: any) => {
  selectedBookingForDetails.value = booking;
  showBookingDetailsModal.value = true;
};

const copyManifestToClipboard = () => {
  if (!selectedBookingForDetails.value) return;
  const b = selectedBookingForDetails.value;
  let text = `📋 FICHA DE RESERVA WAMANI - ${b.buyOrder || b.id}\n`;
  text += `Tour/Expedición: ${b.experienceTitle}\n`;
  text += `Fecha de Salida: ${b.bookingDate} | Pasajeros: ${b.pax} PAX\n`;
  text += `Titular: ${b.customerName} (${b.customerRut || 'N/A'}) | Tel: ${b.customerPhone || 'N/A'} | Email: ${b.customerEmail || 'N/A'}\n`;
  text += `Estado: ${b.status?.toUpperCase()} | Pago: ${b.paymentMethod?.toUpperCase()} | Monto: $${(b.totalPrice || 0).toLocaleString('es-CL')}\n`;
  if (b.notes) text += `Notas: ${b.notes}\n`;
  text += `\n--- NÓMINA OFICIAL DE PASAJEROS ---\n`;
  if (b.passengers && b.passengers.length > 0) {
    b.passengers.forEach((p: any, idx: number) => {
      text += `[PAX #${idx + 1}] ${p.fullName} | DOC: ${p.documentNumber || p.documentId || 'N/A'} | EDAD: ${p.age || 'N/A'} | TEL: ${p.phone || 'N/A'}\n`;
      if (p.emergencyContactName || p.emergencyContactPhone) {
        text += `   ↳ Contacto Emergencia: ${p.emergencyContactName || ''} (${p.emergencyContactPhone || ''})\n`;
      }
      if (p.medicalConditions) {
        text += `   ↳ Ficha Médica / Alergias: ${p.medicalConditions}\n`;
      }
    });
  } else {
    text += `[PAX #1 - Titular] ${b.customerName} | DOC: ${b.customerRut || 'N/A'} | TEL: ${b.customerPhone || 'N/A'}\n`;
  }
  navigator.clipboard.writeText(text);
  triggerToast('¡Nómina de pasajeros copiada al portapapeles!');
};

// Fuente de verdad unificada de todas las reservas y prospectos
const allCrmBookings = computed(() => {
  const storeList = contentStore.bookings.map(b => ({
    id: b.id,
    buyOrder: b.buyOrder || `WAM-${b.id.slice(-6)}`,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    customerRut: b.customerRut || 'N/A',
    customerDocumentType: b.customerDocumentType || 'rut',
    experienceTitle: b.experienceTitle,
    bookingDate: b.bookingDate,
    pax: b.pax || 1,
    totalPrice: b.totalPrice || 0,
    paymentMethod: b.paymentMethod || 'manual',
    status: b.status || 'pending',
    source: b.source || 'automatic',
    authorizationCode: b.authorizationCode,
    cardLast4: b.cardLast4,
    notes: b.notes,
    passengers: b.passengers || [],
    createdAt: b.createdAt
  }));

  // Extra órdenes de Supabase si existen y no están en store
  const existingIds = new Set(storeList.map(b => b.id));
  const extraSupabase = (supabaseOrders.value || []).filter((so: any) => !existingIds.has(so.id)).map((so: any) => ({
    id: so.id,
    buyOrder: so.buy_order || so.id,
    customerName: so.customer_name || 'Cliente Webpay',
    customerEmail: so.customer_email || 'N/A',
    customerPhone: so.customer_phone || 'N/A',
    customerRut: so.customer_rut || 'N/A',
    customerDocumentType: 'rut',
    experienceTitle: so.order_items_v2?.[0]?.tour_title || 'Expedición Wamani',
    bookingDate: so.created_at ? new Date(so.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    pax: so.pax || 1,
    totalPrice: so.total_price_clp || 0,
    paymentMethod: so.payment_method || 'webpay',
    status: so.payment_status || 'confirmed',
    source: 'automatic',
    authorizationCode: so.authorization_code,
    cardLast4: so.card_last_four,
    notes: so.notes || '',
    passengers: so.passengers || [],
    createdAt: so.created_at || new Date().toISOString()
  }));

  return [...storeList, ...extraSupabase];
});

const totalRevenue = computed(() => {
  return allCrmBookings.value
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
});

const pendingBookingsCount = computed(() => {
  return allCrmBookings.value.filter(b => b.status === 'pending').length;
});

const totalPax = computed(() => {
  return allCrmBookings.value
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.pax || 0), 0);
});

const filteredBookings = computed(() => {
  return allCrmBookings.value.filter(b => {
    const q = crmSearchQuery.value.toLowerCase();
    const matchesSearch = (b.customerName || '').toLowerCase().includes(q) || 
                          (b.customerEmail || '').toLowerCase().includes(q) ||
                          (b.customerRut || '').toLowerCase().includes(q) ||
                          (b.buyOrder || '').toLowerCase().includes(q) ||
                          (b.experienceTitle || '').toLowerCase().includes(q);
    const matchesStatus = crmStatusFilter.value === 'all' || b.status === crmStatusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const openAddCrmModal = () => {
  crmForm.value = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerRut: '',
    experienceTitle: contentStore.experiences[0]?.title || 'Ascenso al Volcán Villarrica',
    bookingDate: new Date().toISOString().split('T')[0],
    pax: 2,
    totalPrice: 120000,
    paymentMethod: 'manual',
    status: 'confirmed',
    notes: ''
  };
  showCrmModal.value = true;
};

const saveBooking = () => {
  const buyOrder = `WAM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  contentStore.addBooking({
    customerName: crmForm.value.customerName,
    customerEmail: crmForm.value.customerEmail,
    customerPhone: crmForm.value.customerPhone,
    customerRut: crmForm.value.customerRut,
    experienceTitle: crmForm.value.experienceTitle,
    bookingDate: crmForm.value.bookingDate,
    pax: Number(crmForm.value.pax),
    totalPrice: Number(crmForm.value.totalPrice),
    paymentMethod: crmForm.value.paymentMethod,
    status: crmForm.value.status,
    buyOrder,
    notes: crmForm.value.notes,
    source: 'manual',
    passengers: [
      {
        fullName: crmForm.value.customerName,
        documentType: 'rut',
        documentNumber: crmForm.value.customerRut || 'N/A',
        phone: crmForm.value.customerPhone
      }
    ]
  });
  triggerToast('Venta registrada manualmente en el CRM.');
  showCrmModal.value = false;
};

const updateBookingStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
  contentStore.updateBookingStatus(id, status);
  triggerToast('Estado de reserva actualizado.');
};

const deleteBooking = (id: string) => {
  if (confirm('¿Deseas eliminar este registro de reserva del CRM?')) {
    contentStore.deleteBooking(id);
    triggerToast('Reserva eliminada.');
  }
};

const exportCrmToCsv = () => {
  const headers = ['ID', 'Orden Compra', 'Cliente', 'RUT/Pasaporte', 'Email', 'Telefono', 'Experiencia', 'Fecha', 'Pasajeros', 'Total CLP', 'Metodo Pago', 'Cod Autorizacion', 'Origen', 'Estado', 'Nomina Pasajeros', 'Notas'];
  const rows = allCrmBookings.value.map(b => {
    const passengersText = (b.passengers || []).map((p: any, i: number) => 
      `Pax ${i+1}: ${p.fullName} (${p.documentNumber})`
    ).join(' | ');
    return [
      `"${b.id}"`,
      `"${b.buyOrder || ''}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerRut || ''}"`,
      `"${(b.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(b.experienceTitle || '').replace(/"/g, '""')}"`,
      `"${b.bookingDate || ''}"`,
      b.pax,
      b.totalPrice,
      `"${b.paymentMethod || ''}"`,
      `"${b.authorizationCode || ''}"`,
      `"${b.source || ''}"`,
      `"${b.status || ''}"`,
      `"${passengersText.replace(/"/g, '""')}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `reservas_wamani_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  triggerToast('Archivo CSV oficial de reservas descargado.');
};

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
};

// --- 5. SECTIONS FORMS (HOME, ABOUT, CONTACT, GATEWAY) ---
const homeForm = ref({ ...contentStore.content.home });
const aboutForm = ref({ ...contentStore.content.about });
const contactForm = ref({ ...contentStore.content.contact });
const gatewayForm = ref({ 
  transbank: { ...contentStore.content.gateway.transbank },
  bankTransfer: { ...contentStore.content.gateway.bankTransfer },
  emailNotifications: { ...contentStore.content.gateway.emailNotifications }
});

watch(() => contentStore.content.about, (newAbout) => {
  if (newAbout) {
    aboutForm.value = { ...newAbout, advisors: [...(newAbout.advisors || [])] };
  }
}, { deep: true });

watch(() => contentStore.content.home, (newHome) => {
  if (newHome) {
    homeForm.value = JSON.parse(JSON.stringify(newHome));
  }
}, { deep: true });

watch(() => contentStore.content.contact, (newContact) => {
  if (newContact) {
    contactForm.value = { ...newContact };
  }
}, { deep: true });

watch(() => contentStore.content.gateway, (newGateway) => {
  if (newGateway) {
    gatewayForm.value = {
      transbank: { ...newGateway.transbank },
      bankTransfer: { ...newGateway.bankTransfer },
      emailNotifications: { ...newGateway.emailNotifications }
    };
  }
}, { deep: true });

const handleAboutHeroUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    if (file.size > 10000000) {
      alert('La imagen supera los 10MB.');
      return;
    }
    try {
      aboutForm.value.heroImage = await uploadImageToStorageOrBase64(file, { maxWidth: 1200, quality: 0.8, folder: 'about' });
      triggerToast('Imagen de cabecera de Nosotros optimizada y cargada.');
    } catch {
      alert('No se pudo procesar la imagen.');
    } finally {
      input.value = '';
    }
  }
};

const handleAboutHistoryUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    if (file.size > 10000000) {
      alert('La imagen supera los 10MB.');
      return;
    }
    try {
      aboutForm.value.historyImage = await uploadImageToStorageOrBase64(file, { maxWidth: 1000, quality: 0.8, folder: 'about' });
      triggerToast('Imagen de historia optimizada y cargada.');
    } catch {
      alert('No se pudo procesar la imagen.');
    } finally {
      input.value = '';
    }
  }
};

const saveHomeContent = async () => {
  await contentStore.updateContent({ home: homeForm.value });
  triggerToast('¡Contenidos de la Página de Inicio guardados!');
};

const saveAboutContent = async () => {
  await contentStore.updateContent({
    about: {
      ...aboutForm.value,
      advisors: contentStore.content.about.advisors
    }
  });
  triggerToast('¡Contenidos de la Página Nosotros guardados!');
};

const saveContactContent = async () => {
  await contentStore.updateContent({ contact: contactForm.value });
  triggerToast('¡Información de Contacto guardada!');
};

const saveGatewayContent = async () => {
  await contentStore.updateGatewaySettings(gatewayForm.value);
  triggerToast('¡Configuración de Pasarela y Transferencias guardada con éxito!');
};

// --- PROMOTIONS & DISCOUNT CODES ---
const showDiscountModal = ref(false);
const discountMode = ref<'add' | 'edit'>('add');
const editingDiscountId = ref<string | null>(null);

const discountForm = ref({
  code: '',
  type: 'percentage' as 'percentage' | 'fixed_amount',
  value: 10,
  isActive: true
});

const openAddDiscountModal = () => {
  discountMode.value = 'add';
  editingDiscountId.value = null;
  discountForm.value = {
    code: '',
    type: 'percentage',
    value: 10,
    isActive: true
  };
  showDiscountModal.value = true;
};

const openEditDiscountModal = (discount: any) => {
  discountMode.value = 'edit';
  editingDiscountId.value = discount.id;
  discountForm.value = {
    code: discount.code,
    type: discount.type,
    value: discount.value,
    isActive: discount.isActive
  };
  showDiscountModal.value = true;
};

const saveDiscount = () => {
  if (discountMode.value === 'add') {
    contentStore.addDiscountCode({
      code: discountForm.value.code.toUpperCase(),
      type: discountForm.value.type,
      value: Number(discountForm.value.value),
      isActive: discountForm.value.isActive
    });
    triggerToast('Código de descuento añadido exitosamente.');
  } else if (editingDiscountId.value) {
    contentStore.updateDiscountCode(editingDiscountId.value, {
      code: discountForm.value.code.toUpperCase(),
      type: discountForm.value.type,
      value: Number(discountForm.value.value),
      isActive: discountForm.value.isActive
    });
    triggerToast('Código de descuento actualizado.');
  }
  showDiscountModal.value = false;
};

const deleteDiscount = (id: string) => {
  if (confirm('¿Deseas eliminar este código de descuento?')) {
    contentStore.deleteDiscountCode(id);
    triggerToast('Código eliminado.');
  }
};

const toggleDiscountStatus = (id: string, currentStatus: boolean) => {
  contentStore.updateDiscountCode(id, { isActive: !currentStatus });
  triggerToast(currentStatus ? 'Código desactivado.' : 'Código activado.');
};

// --- 10. PACKAGES MANAGEMENT ---
const showPackageModal = ref(false);
const packageMode = ref<'add' | 'edit'>('add');
const editingPackageId = ref<string | null>(null);

const packageForm = ref({
  title: '',
  description: '',
  imageUrl: '',
  includedTourIds: [] as string[],
  badgeText: '',
  pricingType: 'percentage' as 'percentage' | 'fixed_discount' | 'manual',
  discountPercentage: 15,
  fixedDiscountAmount: 20000,
  manualBundlePrice: 0,
  isActive: true
});

// Suma total original calculada en vivo según los tours seleccionados
const calculatedOriginalPrice = computed(() => {
  let total = 0;
  for (const tourId of packageForm.value.includedTourIds) {
    const exp = contentStore.experiences.find(e => e.id === tourId || e.slug === tourId);
    if (exp) {
      total += exp.pricing.basePrice;
    }
  }
  return total;
});

// Precio de oferta final calculado automáticamente
const calculatedBundlePrice = computed(() => {
  const orig = calculatedOriginalPrice.value;
  if (orig <= 0) return 0;
  
  if (packageForm.value.pricingType === 'percentage') {
    const pct = Math.min(100, Math.max(0, packageForm.value.discountPercentage));
    return Math.round(orig * (1 - pct / 100));
  } else if (packageForm.value.pricingType === 'fixed_discount') {
    return Math.max(0, orig - packageForm.value.fixedDiscountAmount);
  } else {
    return Math.max(0, packageForm.value.manualBundlePrice);
  }
});

// Ahorro total calculado
const calculatedSavings = computed(() => {
  return Math.max(0, calculatedOriginalPrice.value - calculatedBundlePrice.value);
});

// Porcentaje efectivo de ahorro
const calculatedEffectivePercentage = computed(() => {
  if (calculatedOriginalPrice.value <= 0) return 0;
  return Math.round((calculatedSavings.value / calculatedOriginalPrice.value) * 100);
});

const openAddPackageModal = () => {
  packageMode.value = 'add';
  editingPackageId.value = null;
  packageForm.value = {
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    includedTourIds: [],
    badgeText: 'Ahorra 15%',
    pricingType: 'percentage',
    discountPercentage: 15,
    fixedDiscountAmount: 20000,
    manualBundlePrice: 0,
    isActive: true
  };
  showPackageModal.value = true;
};

const openEditPackageModal = (pkg: any) => {
  packageMode.value = 'edit';
  editingPackageId.value = pkg.id;
  
  const orig = pkg.originalPrice || 0;
  const bundle = pkg.bundlePrice || 0;
  const savings = Math.max(0, orig - bundle);
  const pct = orig > 0 ? Math.round((savings / orig) * 100) : 15;

  packageForm.value = {
    title: pkg.title,
    description: pkg.description,
    imageUrl: pkg.imageUrl,
    includedTourIds: [...pkg.includedTourIds],
    badgeText: pkg.badgeText || '',
    pricingType: 'percentage',
    discountPercentage: pct > 0 ? pct : 15,
    fixedDiscountAmount: savings,
    manualBundlePrice: bundle,
    isActive: pkg.isActive
  };
  showPackageModal.value = true;
};

const toggleTourSelection = (tourId: string) => {
  const index = packageForm.value.includedTourIds.indexOf(tourId);
  if (index >= 0) {
    packageForm.value.includedTourIds.splice(index, 1);
  } else {
    packageForm.value.includedTourIds.push(tourId);
  }
};

const savePackage = () => {
  if (packageForm.value.includedTourIds.length === 0) {
    alert('Debes seleccionar al menos 1 tour para armar el paquete.');
    return;
  }

  const finalBundlePrice = calculatedBundlePrice.value > 0 ? calculatedBundlePrice.value : 50000;
  const finalOriginalPrice = calculatedOriginalPrice.value > 0 ? calculatedOriginalPrice.value : finalBundlePrice;

  let badge = packageForm.value.badgeText.trim();
  if (!badge && calculatedEffectivePercentage.value > 0) {
    badge = `Ahorra ${calculatedEffectivePercentage.value}%`;
  }

  const dataToSave = {
    title: packageForm.value.title.trim(),
    description: packageForm.value.description.trim(),
    imageUrl: packageForm.value.imageUrl.trim() || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    includedTourIds: [...packageForm.value.includedTourIds],
    badgeText: badge,
    bundlePrice: finalBundlePrice,
    originalPrice: finalOriginalPrice,
    isActive: packageForm.value.isActive
  };

  if (packageMode.value === 'add') {
    contentStore.addPackage(dataToSave);
    triggerToast('Paquete de tours creado exitosamente.');
  } else if (editingPackageId.value) {
    contentStore.updatePackage(editingPackageId.value, dataToSave);
    triggerToast('Paquete de tours actualizado.');
  }

  showPackageModal.value = false;
};

const deletePackage = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este paquete promocional?')) {
    contentStore.deletePackage(id);
    triggerToast('Paquete eliminado.');
  }
};

const togglePackageStatus = (id: string, currentStatus: boolean) => {
  contentStore.updatePackage(id, { isActive: !currentStatus });
  triggerToast(currentStatus ? 'Paquete desactivado.' : 'Paquete publicado.');
};

// Formulario de Información Legal & SERNATUR
const legalForm = ref({
  businessName: contentStore.content.legal.businessName,
  rut: contentStore.content.legal.rut,
  sernaturRegistry: contentStore.content.legal.sernaturRegistry,
  sernaturUrl: contentStore.content.legal.sernaturUrl,
  addressLegal: contentStore.content.legal.addressLegal,
  city: contentStore.content.legal.city,
  region: contentStore.content.legal.region,
  legalRepresentative: contentStore.content.legal.legalRepresentative,
  supportEmail: contentStore.content.legal.supportEmail,
  emergencyPhone: contentStore.content.legal.emergencyPhone,
  insurancePolicy: contentStore.content.legal.insurancePolicy
});

const saveLegalContent = () => {
  contentStore.updateContent({ legal: { ...legalForm.value } });
  triggerToast('¡Datos Legales y Registro SERNATUR guardados exitosamente!');
};

// ==============================================================================
// 12. COTIZADOR OFICIAL DE SERVICIOS (ENTERPRISE QUOTE GENERATOR)
// ==============================================================================
export interface QuoteItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const quoteForm = ref({
  quoteNumber: `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  date: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  clientName: '',
  clientRut: '',
  clientEmail: '',
  clientPhone: '',
  clientCity: 'Chile',
  destination: 'Pucón / Araucanía Lacustre',
  activityDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  paxTotal: 2,
  taxMode: 'iva_incluido' as 'iva_incluido' | 'factura' | 'exento' | 'neto_mas_iva',
  discountAmount: 0,
  notes: 'Precios finales con IVA incluido (19%). Incluye acompañamiento de guías certificados, seguro de accidentes personales y transporte privado según programa. Válido por 15 días corridos.',
  items: [
    {
      id: 'it-1',
      title: 'Ascenso al Volcán Villarrica (Cumbre)',
      description: 'Guiado profesional con guías UIAGM/UIMLA, equipo técnico completo (botas, crampones, piolet, casco) y traslados.',
      quantity: 2,
      unitPrice: 115000
    }
  ] as QuoteItem[]
});

const selectedTourToQuote = ref('');
const selectedPackageToQuote = ref('');

const addTourToQuote = () => {
  if (!selectedTourToQuote.value) return;
  const tour = contentStore.experiences.find(e => e.id === selectedTourToQuote.value);
  if (tour) {
    quoteForm.value.items.push({
      id: `it-${Date.now()}`,
      title: tour.title,
      description: tour.summary || `Experiencia guiada en ${tour.destinationId}.`,
      quantity: quoteForm.value.paxTotal || 1,
      unitPrice: tour.pricing.basePrice
    });
    selectedTourToQuote.value = '';
    triggerToast('Tour añadido a la cotización.');
  }
};

const addPackageToQuote = () => {
  if (!selectedPackageToQuote.value) return;
  const pkg = contentStore.tourPackages.find(p => p.id === selectedPackageToQuote.value);
  if (pkg) {
    quoteForm.value.items.push({
      id: `it-${Date.now()}`,
      title: `Paquete: ${pkg.title}`,
      description: pkg.description || 'Paquete combinado de experiencias con tarifa promocional.',
      quantity: 1,
      unitPrice: pkg.bundlePrice
    });
    selectedPackageToQuote.value = '';
    triggerToast('¡Paquete de tours añadido a la cotización!');
  }
};

const addCustomItemToQuote = () => {
  quoteForm.value.items.push({
    id: `it-${Date.now()}`,
    title: 'Servicio de Transporte Privado / Guía Adicional',
    description: 'Traslado exclusivo ida y vuelta con chofer profesional y tracción 4x4.',
    quantity: 1,
    unitPrice: 65000
  });
};

const removeQuoteItem = (index: number) => {
  if (quoteForm.value.items.length > 1) {
    quoteForm.value.items.splice(index, 1);
  } else {
    alert('La cotización debe tener al menos un ítem.');
  }
};

// Subtotal de los ítems con precios publicados
const quoteSubtotal = computed(() => {
  return quoteForm.value.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
});

const quoteDiscount = computed(() => {
  return Number(quoteForm.value.discountAmount) || 0;
});

const quoteBase = computed(() => {
  return Math.max(0, quoteSubtotal.value - quoteDiscount.value);
});

// Los precios publicados ya tienen el IVA (19%) incluido por defecto en Chile
const quoteNeto = computed(() => {
  if (quoteForm.value.taxMode === 'neto_mas_iva' || quoteForm.value.taxMode === 'exento') {
    return quoteBase.value;
  }
  return Math.round(quoteBase.value / 1.19);
});

const quoteIva = computed(() => {
  if (quoteForm.value.taxMode === 'exento') {
    return 0;
  }
  if (quoteForm.value.taxMode === 'neto_mas_iva') {
    return Math.round(quoteBase.value * 0.19);
  }
  return quoteBase.value - quoteNeto.value;
});

const quoteTotal = computed(() => {
  if (quoteForm.value.taxMode === 'neto_mas_iva') {
    return quoteBase.value + quoteIva.value;
  }
  return quoteBase.value;
});

const printQuote = () => {
  window.print();
};

const isGeneratingPdf = ref(false);
const showWhatsAppPdfModal = ref(false);

const downloadQuotePdf = async (): Promise<File | null> => {
  const element = document.getElementById('quote-preview-paper');
  if (!element) return null;

  isGeneratingPdf.value = true;
  triggerToast('Generando PDF oficial en 1 sola página...');

  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: [6, 8, 6, 8],
      filename: `Cotizacion-${quoteForm.value.quoteNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };

    const worker = html2pdf().set(opt).from(element);
    const pdfBlob: Blob = await worker.output('blob');
    await worker.save();

    triggerToast('¡PDF oficial de 1 página descargado con éxito!');
    return new File([pdfBlob], `Cotizacion-${quoteForm.value.quoteNumber}.pdf`, { type: 'application/pdf' });
  } catch (err: any) {
    console.error('Error al generar PDF con html2pdf:', err);
    triggerToast('Abriendo ventana de impresión oficial...');
    window.print();
    return null;
  } finally {
    isGeneratingPdf.value = false;
  }
};

const sendQuoteWhatsApp = async () => {
  // Descarga y genera el PDF de 1 página
  const pdfFile = await downloadQuotePdf();

  const itemsText = quoteForm.value.items.map((it, idx) => 
    `${idx + 1}. *${it.title}*\n   • ${it.quantity} pax x ${formatPrice(it.unitPrice)} = *${formatPrice(it.quantity * it.unitPrice)}*`
  ).join('\n');

  const text = encodeURIComponent(
    `🏔️ *COTIZACIÓN OFICIAL WAMANI EXPERIENCE* 🏔️\n` +
    `*Folio:* ${quoteForm.value.quoteNumber}\n` +
    `*Cliente:* ${quoteForm.value.clientName || 'Estimado(a) Viajero(a)'}\n` +
    `*Fecha Propuesta:* ${quoteForm.value.activityDate || 'A coordinar'}\n` +
    `*Pasajeros:* ${quoteForm.value.paxTotal} personas\n` +
    `*Destino:* ${quoteForm.value.destination}\n\n` +
    `📋 *DETALLE DE SERVICIOS:*\n${itemsText}\n\n` +
    (quoteDiscount.value > 0 ? `🔹 Descuento Especial: -${formatPrice(quoteDiscount.value)}\n` : '') +
    `💰 *TOTAL FINAL (IVA 19% INCLUIDO):* *${formatPrice(quoteTotal.value)} CLP*\n` +
    `   _(Neto: ${formatPrice(quoteNeto.value)} + IVA 19%: ${formatPrice(quoteIva.value)})_\n\n` +
    `📎 *Te adjuntamos el archivo PDF formal de 1 página con membrete oficial, itinerarios y datos bancarios.*\n\n` +
    `📌 *Condiciones:* ${quoteForm.value.notes}\n` +
    `📅 *Validez:* Oferta vigente hasta ${quoteForm.value.validUntil}\n\n` +
    `💳 *Datos de Pago:* Transferencia Banco Santander (Cta Cte 89-01234-5 / RUT 78.199.034-5) o Webpay Plus.\n\n` +
    `_Wamani Experience SpA • Reg. SERNATUR N° 84219 • Pucón, Chile_`
  );

  const phone = quoteForm.value.clientPhone.replace(/[^0-9]/g, '');
  const waUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;

  // Si el navegador soporta compartir archivos directamente (móvil o Web Share API con files)
  if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Cotización ${quoteForm.value.quoteNumber} - Wamani Experience`,
        text: decodeURIComponent(text)
      });
      return;
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') return;
      console.warn('Share falló, procediendo por web:', shareErr);
    }
  }

  // En navegador web de escritorio: abre WhatsApp y muestra modal para adjuntar el PDF descargado
  window.open(waUrl, '_blank');
  showWhatsAppPdfModal.value = true;
};

const sendQuoteEmail = () => {
  const subject = encodeURIComponent(`Cotización Oficial Wamani Experience - ${quoteForm.value.quoteNumber}`);
  const itemsText = quoteForm.value.items.map((it, idx) => 
    `${idx + 1}. ${it.title} (${it.quantity} pax x ${formatPrice(it.unitPrice)}) = ${formatPrice(it.quantity * it.unitPrice)}`
  ).join('\n');

  const body = encodeURIComponent(
    `Estimado(a) ${quoteForm.value.clientName || 'Cliente'},\n\n` +
    `Junto con saludar, enviamos la cotización oficial para sus actividades con Wamani Experience.\n\n` +
    `Folio: ${quoteForm.value.quoteNumber}\n` +
    `Fecha de Emisión: ${quoteForm.value.date}\n` +
    `Fecha Estimada de Actividad: ${quoteForm.value.activityDate}\n` +
    `Total Pasajeros: ${quoteForm.value.paxTotal}\n` +
    `Destino: ${quoteForm.value.destination}\n\n` +
    `DETALLE DE SERVICIOS:\n` +
    `${itemsText}\n\n` +
    (quoteDiscount.value > 0 ? `Descuento Aplicado: -${formatPrice(quoteDiscount.value)}\n` : '') +
    `TOTAL FINAL A PAGAR: ${formatPrice(quoteTotal.value)} CLP (IVA 19% Incluido)\n` +
    `Neto: ${formatPrice(quoteNeto.value)} CLP | IVA (19%): ${formatPrice(quoteIva.value)} CLP\n\n` +
    `CONDICIONES Y NOTAS:\n${quoteForm.value.notes}\n\n` +
    `DATOS DE PAGO:\n` +
    `Banco Santander Chile - Cuenta Corriente N° 89-01234-5\n` +
    `Titular: Wamani Experience SpA - RUT: 78.199.034-5\n` +
    `Correo de Notificación: experiencewamani@gmail.com\n\n` +
    `Atentamente,\n` +
    `Equipo Wamani Experience SpA\n` +
    `Pucón, Región de La Araucanía, Chile\n` +
    `Registro Oficial SERNATUR N° 84219`
  );

  window.location.href = `mailto:${quoteForm.value.clientEmail}?subject=${subject}&body=${body}`;
};

// ==============================================================================
// 13. GESTOR DE GALERÍA FOTOGRÁFICA
// ==============================================================================
const newGalleryForm = ref({
  title: '',
  category: 'Montaña',
  caption: '',
  images: [] as string[]
});

const handleGalleryFilesUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length > 0) {
    triggerToast(`Optimizando y procesando ${files.length} fotografías...`);
    try {
      const urls = await uploadMultipleImagesToStorage(files, { maxWidth: 1200, quality: 0.78, folder: 'gallery_main' });
      urls.forEach(url => {
        newGalleryForm.value.images.push(url);
      });
      triggerToast('¡Fotografías optimizadas y listas para publicar!');
    } catch (err: any) {
      alert('Error al comprimir imágenes: ' + (err.message || ''));
    } finally {
      input.value = '';
    }
  }
};

const removeNewGalleryImg = (index: number) => {
  newGalleryForm.value.images.splice(index, 1);
};

const saveGalleryImages = async () => {
  if (newGalleryForm.value.images.length === 0) {
    alert('Por favor selecciona al menos una fotografía para subir.');
    return;
  }

  for (let i = 0; i < newGalleryForm.value.images.length; i++) {
    const url = newGalleryForm.value.images[i];
    await contentStore.addGalleryImage({
      url,
      title: newGalleryForm.value.title || `Fotografía Wamani ${contentStore.galleryImages.length + i + 1}`,
      category: newGalleryForm.value.category,
      caption: newGalleryForm.value.caption
    });
  }

  newGalleryForm.value = {
    title: '',
    category: 'Montaña',
    caption: '',
    images: []
  };

  triggerToast('¡Fotografías publicadas exitosamente en la galería web!');
};

const deleteGalleryImg = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta fotografía de la galería pública?')) {
    contentStore.deleteGalleryImage(id);
    triggerToast('Fotografía eliminada de la galería.');
  }
};

// ==============================================================================
// 13.1 EDICIÓN DE TEXTOS DE GALERÍA FOTOGRÁFICA
// ==============================================================================
const showEditGalleryModal = ref(false);
const editingGalleryForm = ref<{
  id: string;
  url: string;
  title: string;
  category: string;
  caption: string;
}>({
  id: '',
  url: '',
  title: '',
  category: 'Montaña',
  caption: ''
});

const openEditGalleryModal = (img: GalleryImage) => {
  editingGalleryForm.value = {
    id: img.id,
    url: img.url,
    title: img.title || '',
    category: img.category || 'Montaña',
    caption: img.caption || ''
  };
  showEditGalleryModal.value = true;
};

const saveEditGalleryForm = () => {
  if (!editingGalleryForm.value.title.trim()) {
    alert('Por favor ingresa un título para la fotografía.');
    return;
  }
  contentStore.updateGalleryImage({
    id: editingGalleryForm.value.id,
    url: editingGalleryForm.value.url,
    title: editingGalleryForm.value.title.trim(),
    category: editingGalleryForm.value.category,
    caption: editingGalleryForm.value.caption.trim(),
    createdAt: new Date().toISOString()
  });
  showEditGalleryModal.value = false;
  triggerToast('¡Textos de la fotografía actualizados exitosamente!');
};
</script>

<template>
  <div class="admin-container min-vh-100 py-5 font-sans">
    <!-- 1. LOGIN PIN SECURITY OVERLAY -->
    <div v-if="!isAuthenticated" class="login-overlay d-flex align-items-center justify-content-center px-3">
      <div class="card p-5 border-0 login-card text-center text-white" style="max-width: 440px; border-radius: 28px; background: #147E79; border: 1px solid rgba(231, 220, 195, 0.4); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);">
        <img src="/Logo Wamani.png" alt="Wamani Logo" height="85" class="mb-4 mx-auto d-block" />
        <h2 class="h3 fw-bold font-serif mb-2 text-white">Panel de Control Wamani</h2>
        <p class="small text-white opacity-85 mb-4">Ingresa el PIN de seguridad asignado para administrar todo el sitio web.</p>
        
        <form @submit.prevent="handleLogin" class="w-100">
          <div class="mb-4">
            <input 
              v-model="pinInput" 
              type="password" 
              class="form-control text-center py-3 fs-3 tracking-widest admin-input text-white" 
              placeholder="••••••••" 
              required
              autofocus
            />
            <div v-if="loginError" class="badge bg-danger text-white mt-3 p-2 d-block fs-6">
              <i class="bi bi-exclamation-circle me-1"></i> PIN incorrecto, intenta de nuevo.
            </div>
          </div>
          <button type="submit" class="btn btn-accent w-100 py-3 fw-bold tracking-wide text-dark-mountain">
            <i class="bi bi-unlock-fill me-2"></i> Desbloquear Panel
          </button>
        </form>
      </div>
    </div>

    <!-- 2. MAIN ADMIN CONSOLE PANEL -->
    <div v-else class="container py-3">
      <!-- HEADER CONSOLE -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3 admin-header-card p-4 rounded-4">
        <div>
          <span class="badge bg-accent text-dark-mountain px-3 py-2 mb-2 tracking-wide fw-bold">
            <i class="bi bi-shield-lock-fill me-1"></i> ADMINISTRACIÓN GENERAL WAMANI
          </span>
          <h1 class="h2 fw-bold text-white font-serif mb-1">Gestor Total del Sitio Web</h1>
          <p class="text-white opacity-85 mb-0 small">Administra tours, textos del inicio, página nosotros, integrantes, contacto y reservas CRM en tiempo real.</p>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <a href="/" target="_blank" class="btn btn-outline-accent px-3 py-2 fw-semibold d-flex align-items-center" title="Abrir sitio web en vivo">
            <i class="bi bi-box-arrow-up-right me-2"></i>Ver Sitio Web
          </a>
          <button class="btn btn-outline-light px-3 py-2 d-flex align-items-center" @click="isAuthenticated = false" title="Cerrar Sesión">
            <i class="bi bi-box-arrow-right me-1"></i> Salir
          </button>
        </div>
      </div>

      <!-- TABS CONTROL -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm p-2 rounded-4 admin-tabs-card overflow-hidden">
            <ul class="nav nav-pills nav-fill gap-2 flex-nowrap overflow-auto py-1 px-1 custom-scrollbar">
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'services' }"
                  @click="activeTab = 'services'"
                >
                  <i class="bi bi-compass-fill me-2"></i>Catálogo Tours ({{ contentStore.experiences.length }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'cards-home' }"
                  @click="activeTab = 'cards-home'"
                >
                  <i class="bi bi-grid-3x3-gap-fill me-2"></i>Tarjetas Inicio
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'content-home' }"
                  @click="activeTab = 'content-home'"
                >
                  <i class="bi bi-house-door-fill me-2"></i>Textos Inicio
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'transport-mgmt' }"
                  @click="activeTab = 'transport-mgmt'"
                >
                  <i class="bi bi-car-front-fill me-2 text-accent"></i>Transporte & Traslados
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'content-about' }"
                  @click="activeTab = 'content-about'"
                >
                  <i class="bi bi-building me-2"></i>Nosotros
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'advisors' }"
                  @click="activeTab = 'advisors'"
                >
                  <i class="bi bi-people-fill me-2"></i>Equipo & Asesores
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'contact' }"
                  @click="activeTab = 'contact'"
                >
                  <i class="bi bi-telephone-fill me-2"></i>Contacto & Redes
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 fw-bold rounded-3 transition-all" :class="{ active: activeTab === 'crm' }" @click="activeTab = 'crm'">
                  <i class="bi bi-graph-up-arrow me-2"></i>CRM Reservas
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 fw-bold rounded-3 transition-all" :class="{ active: activeTab === 'promotions' }" @click="activeTab = 'promotions'">
                  <i class="bi bi-ticket-perforated me-2"></i>Códigos Descuento
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 fw-bold rounded-3 transition-all" :class="{ active: activeTab === 'packages' }" @click="activeTab = 'packages'">
                  <i class="bi bi-box-seam me-2"></i>Paquetes de Tours ({{ contentStore.tourPackages.length }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'gateway' }"
                  @click="activeTab = 'gateway'"
                >
                  <i class="bi bi-credit-card-2-front-fill me-2"></i>Pasarela & Ajustes
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'legal' }"
                  @click="activeTab = 'legal'"
                >
                  <i class="bi bi-shield-check me-2"></i>Legal & SERNATUR
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'quote-generator' }"
                  @click="activeTab = 'quote-generator'"
                >
                  <i class="bi bi-file-earmark-spreadsheet-fill me-2 text-accent"></i>Cotizador Oficial
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'gallery-mgmt' }"
                  @click="activeTab = 'gallery-mgmt'"
                >
                  <i class="bi bi-images me-2 text-accent"></i>Galería Fotográfica ({{ contentStore.galleryImages.length }})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TAB PANEL 1: CATALOGO GENERAL DE TOURS (SERVICES) -->
      <div v-if="activeTab === 'services'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">Catálogo General de Tours & Experiencias</h3>
              <p class="small text-white opacity-85 mb-0">Crea, edita, duplica o elimina experiencias con itinerarios, precios y fotografías.</p>
            </div>
            <div class="d-flex gap-2">
              <input 
                v-model="expSearchQuery" 
                type="text" 
                class="form-control form-control-sm admin-input text-white" 
                placeholder="Buscar tour por título o lugar..."
                style="min-width: 220px;"
              />
              <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain text-nowrap" @click="openAddModal">
                <i class="bi bi-plus-lg me-2"></i>Nuevo Tour
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle admin-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style="width: 80px;">Imagen</th>
                  <th scope="col">Título y Resumen</th>
                  <th scope="col" style="width: 150px;">Ubicación</th>
                  <th scope="col" style="width: 130px;">Dificultad</th>
                  <th scope="col" style="width: 140px;">Precio Base</th>
                  <th scope="col" class="text-end" style="width: 180px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exp in filteredExperiences" :key="exp.id">
                  <td>
                    <img :src="exp.coverImage.url" alt="Preview" class="rounded-3 object-fit-cover shadow-sm" style="width: 60px; height: 60px;">
                  </td>
                  <td>
                    <div class="fw-bold text-white fs-6">{{ exp.title }}</div>
                    <div class="small text-white opacity-75 text-truncate" style="max-width: 320px;">{{ exp.summary }}</div>
                    <div class="mt-1 d-flex align-items-center gap-1">
                      <span class="badge bg-dark bg-opacity-75 border border-secondary border-opacity-40 text-accent font-monospace" style="font-size: 0.7rem;">
                        <i class="bi bi-translate me-1"></i>{{ formatLanguages(exp.languages) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge admin-pill-badge px-2 py-1">
                      <i class="bi bi-geo-alt-fill me-1 text-accent"></i>{{ exp.destinationId }}
                    </span>
                  </td>
                  <td>
                    <span class="badge text-uppercase px-2 py-1 fw-bold" :class="{
                      'bg-emerald': exp.difficulty === 'easy',
                      'bg-amber': exp.difficulty === 'moderate',
                      'bg-rose': exp.difficulty === 'hard' || exp.difficulty === 'expert'
                    }">
                      {{ exp.difficulty === 'easy' ? 'Fácil' : (exp.difficulty === 'moderate' ? 'Moderada' : 'Exigente') }}
                    </span>
                  </td>
                  <td class="fw-bold text-accent font-monospace fs-6">
                    {{ formatPrice(exp.pricing.basePrice) }}
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-1 px-2 py-1" @click="copyTourLink(exp)" title="Copiar enlace directo del tour para clientes o redes sociales">
                      <i class="bi bi-link-45deg"></i>
                    </button>
                    <a :href="'/experiencias/' + exp.slug" target="_blank" class="btn btn-sm btn-outline-success me-1 px-2 py-1" title="Ver página individual del tour en vivo">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-warning me-1 px-2 py-1" @click="shareTourWhatsApp(exp)" title="Compartir enlace por WhatsApp">
                      <i class="bi bi-whatsapp"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-light me-1 px-2 py-1" @click="duplicateExperience(exp)" title="Duplicar / Clonar este Tour">
                      <i class="bi bi-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-accent me-1 px-2 py-1" @click="openEditModal(exp)" title="Editar Tour">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="deleteExp(exp.id)" title="Eliminar Tour">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredExperiences.length === 0">
                  <td colspan="6" class="text-center py-5 text-white opacity-75">
                    <i class="bi bi-search fs-2 d-block mb-2 text-accent"></i>
                    No se encontraron tours coincidentes con tu búsqueda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB PANEL 2: HOME CARDS (GESTOR DE TARJETAS DE SERVICIOS DEL HOME) -->
      <div v-if="activeTab === 'cards-home'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">Tarjetas de Servicios de la Página de Inicio</h3>
              <p class="small text-white opacity-85 mb-0">Edita las fotos de portada, características y modales de las 4 tarjetas del Inicio.</p>
            </div>
            <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain" @click="openAddServiceItemModal">
              <i class="bi bi-plus-lg me-2"></i>Nueva Tarjeta
            </button>
          </div>

          <div class="row g-4">
            <div v-for="item in contentStore.content.home.services.items" :key="item.id" class="col-12 col-md-6 col-lg-6 col-xl-3">
              <div class="card admin-sub-card rounded-4 shadow-sm overflow-hidden h-100">
                <div class="position-relative" style="height: 180px;">
                  <img :src="item.coverImage" :alt="item.title" class="w-100 h-100 object-fit-cover">
                  <span class="badge bg-accent text-dark-mountain position-absolute top-0 start-0 m-3 px-3 py-1 text-uppercase tracking-wide fw-bold" style="font-size: 0.7rem;">
                    {{ item.subtitle }}
                  </span>
                </div>
                <div class="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <h4 class="h5 fw-bold text-white mb-2">{{ item.title }}</h4>
                    <p class="small text-white opacity-85 lh-sm text-truncate-2 mb-3">
                      {{ item.description ? item.description[0] : '' }}
                    </p>
                  </div>
                  <div class="d-flex gap-2 pt-3 border-top border-secondary border-opacity-25">
                    <button class="btn btn-sm btn-outline-accent w-100 fw-bold py-2" @click="openEditServiceItemModal(item)">
                      <i class="bi bi-pencil-square me-1"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-3 py-2" @click="deleteServiceItem(item.id)" title="Eliminar Tarjeta">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB PANEL 3: TEXTOS INICIO -->
      <div v-if="activeTab === 'content-home'" class="tab-pane-content">
        <form @submit.prevent="saveHomeContent" class="row g-4">
          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-camera-video-fill me-2"></i>Hero Principal (Pantalla de Entrada)
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título Principal Gigante</label>
                <input v-model="homeForm.hero.title" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Subtítulo / Lema</label>
                <input v-model="homeForm.hero.subtitle" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">URL del Video de Fondo (.mp4)</label>
                <input v-model="homeForm.hero.videoUrl" type="text" class="form-control admin-input text-white">
              </div>
              <!-- Previsualización de video si existe -->
              <div v-if="homeForm.hero.videoUrl" class="mt-3 p-2 rounded-3 border border-secondary border-opacity-25" style="background-color: #0D5B57;">
                <span class="small text-accent d-block mb-1 fw-bold">Vista previa del video:</span>
                <video :src="homeForm.hero.videoUrl" autoplay muted loop playsinline class="w-100 rounded object-fit-cover" style="max-height: 140px;"></video>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-card-text me-2"></i>Encabezado de Servicios & Destinos
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título de la Sección Servicios</label>
                <input v-model="homeForm.services.title" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Descripción de la Sección Servicios</label>
                <textarea v-model="homeForm.services.description" class="form-control admin-input text-white" rows="3"></textarea>
              </div>

              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mt-4 mb-3">
                <i class="bi bi-geo-alt-fill me-2"></i>Sección Destinos & Buscador
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título Destinos</label>
                <input v-model="homeForm.destinations.title" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Descripción Destinos</label>
                <input v-model="homeForm.destinations.description" type="text" class="form-control admin-input text-white">
              </div>
            </div>
          </div>

          <div class="col-12 text-end">
            <button type="submit" class="btn btn-accent px-5 py-3 fw-bold text-dark-mountain shadow-sm">
              <i class="bi bi-save me-2"></i>Guardar Textos de Inicio
            </button>
          </div>
        </form>
      </div>

      <!-- TAB PANEL: TRANSPORTE & TRASLADOS -->
      <div v-if="activeTab === 'transport-mgmt'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm mb-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1">SECCIÓN PORTADA</span>
                <h3 class="h4 fw-bold mb-0 text-white font-serif">Transporte Exclusivo & Traslados Cordilleranos</h3>
              </div>
              <p class="small text-white opacity-85 mb-0">Gestiona los textos de cabecera, tarjetas de servicios, fotografías, características y botones de consulta por WhatsApp.</p>
            </div>
            <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow" @click="openAddTransportModal">
              <i class="bi bi-plus-lg me-2"></i>Nuevo Servicio de Transporte
            </button>
          </div>

          <!-- 1. ENCABEZADO EDITORIAL DE LA SECCIÓN -->
          <div class="admin-sub-card p-4 rounded-4 mb-4 border border-secondary border-opacity-25">
            <h4 class="h6 fw-bold text-accent mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-type-h1"></i> Encabezado Editorial de la Sección
            </h4>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label small fw-bold text-white mb-1">Subtítulo / Badge Superior</label>
                <input v-model="transportHeaderForm.badge" type="text" class="form-control admin-input text-white" placeholder="Ej: MOVILIDAD PRIVADA & CONFORT">
              </div>
              <div class="col-12 col-md-8">
                <label class="form-label small fw-bold text-white mb-1">Título Principal de la Sección</label>
                <input v-model="transportHeaderForm.title" type="text" class="form-control admin-input text-white" placeholder="Ej: Transporte Exclusivo & Traslados Cordilleranos">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold text-white mb-1">Descripción / Bajada</label>
                <textarea v-model="transportHeaderForm.description" rows="2" class="form-control admin-input text-white" placeholder="Describe el servicio de transporte y conectividad en el sur..."></textarea>
              </div>
              <div class="col-12 d-flex justify-content-end">
                <button type="button" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow" @click="saveTransportHeader">
                  <i class="bi bi-check2-circle me-1"></i> Guardar Encabezado de Transporte
                </button>
              </div>
            </div>
          </div>

          <!-- 2. TARJETAS DE SERVICIOS -->
          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h6 fw-bold text-accent mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-grid-3x3-gap-fill"></i> Tarjetas de Servicios de Transporte ({{ (contentStore.content.home?.transport?.services || []).length }})
              </h4>
            </div>

            <div class="row g-4">
              <div 
                v-for="srv in (contentStore.content.home?.transport?.services || [])" 
                :key="srv.id" 
                class="col-12 col-md-6 col-lg-4"
              >
                <div class="card admin-sub-card rounded-4 shadow-sm overflow-hidden h-100 d-flex flex-column border border-secondary border-opacity-25">
                  <!-- Header de la tarjeta: Imagen si tiene o Icono -->
                  <div v-if="srv.imageUrl" class="position-relative overflow-hidden ratio ratio-16x9">
                    <img :src="srv.imageUrl" :alt="srv.title" class="w-100 h-100 object-fit-cover">
                    <span v-if="srv.featuredBadge" class="badge bg-accent text-dark-mountain position-absolute top-0 end-0 m-2 px-2 py-1 small fw-bold">
                      {{ srv.featuredBadge }}
                    </span>
                    <span class="badge bg-dark bg-opacity-75 text-accent position-absolute bottom-0 start-0 m-2 px-2 py-1 small fw-bold text-uppercase">
                      {{ srv.badge }}
                    </span>
                  </div>
                  <div v-else class="p-4 pb-2 d-flex justify-content-between align-items-start">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-3 p-3" style="background: rgba(231, 220, 195, 0.12); border: 1px solid rgba(231, 220, 195, 0.25);">
                      <i :class="[srv.icon || 'bi-car-front-fill', 'fs-3', 'text-accent']"></i>
                    </div>
                    <div class="d-flex flex-column align-items-end gap-1">
                      <span v-if="srv.featuredBadge" class="badge bg-accent text-dark-mountain small fw-bold">
                        {{ srv.featuredBadge }}
                      </span>
                      <span class="badge bg-dark bg-opacity-75 text-accent text-uppercase small fw-bold">
                        {{ srv.badge }}
                      </span>
                    </div>
                  </div>

                  <div class="card-body p-4 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <h4 class="h5 fw-bold text-white mb-2">{{ srv.title }}</h4>
                      <p class="small text-white opacity-85 lh-sm mb-3">
                        {{ srv.description }}
                      </p>

                      <!-- Lista de características -->
                      <ul v-if="srv.features && srv.features.length" class="list-unstyled small text-white opacity-85 mb-3">
                        <li v-for="(feat, fIdx) in srv.features.slice(0, 3)" :key="fIdx" class="d-flex align-items-center gap-2 mb-1">
                          <i class="bi bi-check-circle-fill text-accent" style="font-size: 0.8rem;"></i>
                          <span class="text-truncate">{{ feat }}</span>
                        </li>
                        <li v-if="srv.features.length > 3" class="text-white-50" style="font-size: 0.75rem;">
                          +{{ srv.features.length - 3 }} características más
                        </li>
                      </ul>
                    </div>

                    <div class="pt-3 border-top border-secondary border-opacity-25 mt-auto">
                      <div class="d-flex justify-content-between align-items-center mb-2 small text-white-50">
                        <span>Botón: <strong class="text-accent">{{ srv.buttonText }}</strong></span>
                        <span class="badge" :class="srv.buttonStyle === 'solid' ? 'bg-accent text-dark-mountain' : 'border border-accent text-accent'">
                          {{ srv.buttonStyle === 'solid' ? 'Sólido' : 'Outline' }}
                        </span>
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-accent w-100 fw-bold py-2" @click="openEditTransportModal(srv)">
                          <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger px-3 py-2" @click="deleteTransportService(srv.id)" title="Eliminar Servicio">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Estado vacío -->
              <div v-if="!(contentStore.content.home?.transport?.services || []).length" class="col-12">
                <div class="text-center p-5 rounded-4 admin-sub-card text-white-50">
                  <i class="bi bi-car-front fs-1 d-block mb-3 text-accent opacity-50"></i>
                  <p class="mb-3">No hay servicios de transporte configurados.</p>
                  <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain" @click="openAddTransportModal">
                    <i class="bi bi-plus-lg me-2"></i>Añadir Primer Servicio
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- TAB PANEL 4: NOSOTROS -->
      <div v-if="activeTab === 'content-about'" class="tab-pane-content">
        <form @submit.prevent="saveAboutContent" class="row g-4">
          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-image me-2"></i>Cabecera (Hero) & Historia
              </h4>
              
              <!-- Imagen de Cabecera (Hero / Volcán Villarrica) -->
              <div class="mb-4 p-3 rounded-3 admin-sub-card">
                <label class="form-label small fw-bold text-white mb-2">Imagen de Fondo Cabecera (Volcán Villarrica / Hero)</label>
                <div class="d-flex gap-3 align-items-center mb-2">
                  <img v-if="aboutForm.heroImage" :src="aboutForm.heroImage" class="rounded-3 object-fit-cover shadow flex-shrink-0" style="width: 90px; height: 60px;" alt="Preview Hero">
                  <div class="flex-grow-1">
                    <input type="file" class="form-control form-control-sm mb-2 admin-input text-white" accept="image/*" @change="handleAboutHeroUpload">
                    <input v-model="aboutForm.heroImage" type="text" class="form-control form-control-sm admin-input text-white" placeholder="O pega URL de imagen...">
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título Hero Principal</label>
                <input v-model="aboutForm.heroTitle" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Subtítulo Hero</label>
                <input v-model="aboutForm.heroSubtitle" type="text" class="form-control admin-input text-white">
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título Historia ("Nacidos")</label>
                <input v-model="aboutForm.historyTitle" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Subtítulo Historia ("en la Araucanía")</label>
                <input v-model="aboutForm.historySubtitle" type="text" class="form-control admin-input text-white">
              </div>

              <!-- Imagen de Historia ("Nacidos en la Araucanía") -->
              <div class="mb-3 p-3 rounded-3 admin-sub-card">
                <label class="form-label small fw-bold text-white mb-2">Fotografía Sección Historia ("Nacidos en la Araucanía")</label>
                <div class="d-flex gap-3 align-items-center mb-2">
                  <img v-if="aboutForm.historyImage" :src="aboutForm.historyImage" class="rounded-3 object-fit-cover shadow flex-shrink-0" style="width: 90px; height: 60px;" alt="Preview Historia">
                  <div class="flex-grow-1">
                    <input type="file" class="form-control form-control-sm mb-2 admin-input text-white" accept="image/*" @change="handleAboutHistoryUpload">
                    <input v-model="aboutForm.historyImage" type="text" class="form-control form-control-sm admin-input text-white" placeholder="O pega URL de imagen...">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-feather me-2"></i>Párrafos, Misión y Visión
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Párrafo 1 Historia</label>
                <textarea v-model="aboutForm.historyText1" class="form-control admin-input text-white" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Párrafo 2 Historia</label>
                <textarea v-model="aboutForm.historyText2" class="form-control admin-input text-white" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Nuestra Misión</label>
                <textarea v-model="aboutForm.mission" class="form-control admin-input text-white" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Nuestra Visión</label>
                <textarea v-model="aboutForm.vision" class="form-control admin-input text-white" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Acreditaciones SERNATUR & Marca Chile -->
          <div class="col-12">
            <div class="admin-module-card p-4 rounded-4 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-award-fill me-2"></i>Acreditaciones & Sellos Oficiales
              </h4>
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="p-4 rounded-4 admin-sub-card">
                    <h5 class="fw-bold h6 text-accent mb-3"><i class="bi bi-patch-check-fill me-2"></i>SERNATUR</h5>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white">Texto Título</label>
                      <input v-model="aboutForm.accreditations.sernatur.text" type="text" class="form-control admin-input text-white">
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white">Subtexto</label>
                      <input v-model="aboutForm.accreditations.sernatur.subtext" type="text" class="form-control admin-input text-white">
                    </div>
                    <div>
                      <label class="form-label small fw-bold text-white">Imagen URL / Path</label>
                      <input v-model="aboutForm.accreditations.sernatur.imageUrl" type="text" class="form-control admin-input text-white">
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="p-4 rounded-4 admin-sub-card">
                    <h5 class="fw-bold h6 text-accent mb-3"><i class="bi bi-flag-fill me-2"></i>MARCA CHILE</h5>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white">Texto Título</label>
                      <input v-model="aboutForm.accreditations.marcaChile.text" type="text" class="form-control admin-input text-white">
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white">Subtexto</label>
                      <input v-model="aboutForm.accreditations.marcaChile.subtext" type="text" class="form-control admin-input text-white">
                    </div>
                    <div>
                      <label class="form-label small fw-bold text-white">Imagen URL / Path</label>
                      <input v-model="aboutForm.accreditations.marcaChile.imageUrl" type="text" class="form-control admin-input text-white">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 text-end">
            <button type="submit" class="btn btn-accent px-5 py-3 fw-bold text-dark-mountain shadow-sm">
              <i class="bi bi-save me-2"></i>Guardar Cambios de Nosotros
            </button>
          </div>
        </form>
      </div>

      <!-- TAB PANEL 5: ADVISORS / EQUIPO -->
      <div v-if="activeTab === 'advisors'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">Gestor de Equipo & Asesores ({{ contentStore.content.about.advisors.length }})</h3>
              <p class="small text-white opacity-85 mb-0">Administra los profesionales que componen el equipo y consejo asesor de Wamani.</p>
            </div>
            <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain" @click="openAddAdvisorModal">
              <i class="bi bi-plus-lg me-2"></i>Añadir Integrante
            </button>
          </div>

          <!-- Título y subtítulo de la sección Advisors -->
          <div class="row g-3 mb-4 p-4 admin-sub-card rounded-4">
            <div class="col-md-6">
              <label class="form-label small fw-bold text-white">Título de la Sección Advisors</label>
              <input v-model="aboutForm.advisorsTitle" type="text" class="form-control admin-input text-white" placeholder="Nuestro Equipo & Asesores">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-white">Subtítulo de la Sección Advisors</label>
              <input v-model="aboutForm.advisorsSubtitle" type="text" class="form-control admin-input text-white" placeholder="Profesionales apasionados...">
            </div>
          </div>

          <div class="row g-4">
            <div v-for="adv in contentStore.content.about.advisors" :key="adv.id" class="col-12 col-md-6 col-lg-4">
              <div class="card admin-sub-card rounded-4 shadow-sm p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex gap-3 align-items-center mb-3">
                    <img :src="adv.image" :alt="adv.name" class="rounded-circle object-fit-cover flex-shrink-0 shadow" style="width: 75px; height: 75px; border: 2px solid #E7DCC3;">
                    <div>
                      <h4 class="h5 fw-bold text-white mb-1">{{ adv.name }}</h4>
                      <span class="badge bg-accent text-dark-mountain fw-bold px-2 py-1" style="font-size: 0.72rem;">{{ adv.role }}</span>
                    </div>
                  </div>
                  <p class="small text-white opacity-90 mb-3 lh-base">{{ adv.bio }}</p>
                </div>
                <div class="d-flex gap-2 pt-3 border-top border-secondary border-opacity-25">
                  <button class="btn btn-sm btn-outline-accent w-100 fw-bold" @click="openEditAdvisorModal(adv)">
                    <i class="bi bi-pencil-square me-1"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-outline-danger px-3" @click="deleteAdvisor(adv.id)" title="Eliminar Integrante">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB PANEL 6: CONTACTO & REDES -->
      <div v-if="activeTab === 'contact'" class="tab-pane-content">
        <form @submit.prevent="saveContactContent" class="row g-4">
          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-telephone-inbound-fill me-2"></i>Información de Contacto Directo
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Teléfono Visible</label>
                <input v-model="contactForm.phone" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Número WhatsApp (sin espacios ni +)</label>
                <input v-model="contactForm.whatsappNumber" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Mensaje Predeterminado WhatsApp</label>
                <input v-model="contactForm.whatsappMessage" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Correo Electrónico</label>
                <input v-model="contactForm.email" type="email" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Dirección Física de Oficina</label>
                <input v-model="contactForm.address" type="text" class="form-control admin-input text-white">
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="admin-module-card p-4 rounded-4 h-100 shadow-sm">
              <h4 class="h6 text-accent fw-bold text-uppercase tracking-wider mb-3">
                <i class="bi bi-share-fill me-2"></i>Redes Sociales & TripAdvisor
              </h4>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">URL Instagram</label>
                <input v-model="contactForm.instagramUrl" type="url" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">URL TripAdvisor</label>
                <input v-model="contactForm.tripadvisorUrl" type="url" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">ID Widget Elfsight TripAdvisor (Reseñas)</label>
                <input v-model="homeForm.reviews.elfsightWidgetId" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Título Sección Reseñas</label>
                <input v-model="homeForm.reviews.title" type="text" class="form-control admin-input text-white">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-white">Descripción Sección Reseñas</label>
                <textarea v-model="homeForm.reviews.description" class="form-control admin-input text-white" rows="2"></textarea>
              </div>
            </div>
          </div>

          <div class="col-12 text-end">
            <button type="submit" class="btn btn-accent px-5 py-3 fw-bold text-dark-mountain shadow-sm">
              <i class="bi bi-save me-2"></i>Guardar Contacto y Redes
            </button>
          </div>
        </form>
      </div>

      <!-- TAB PANEL 7: CRM -->
      <div v-if="activeTab === 'crm'" class="tab-pane-content">
        <!-- METRICAS KPI -->
        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <div class="card admin-kpi-card rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
              <h5 class="text-white opacity-85 small fw-bold text-uppercase mb-2"><i class="bi bi-cash-stack me-2 text-accent"></i>Ingresos Confirmados</h5>
              <h3 class="fw-bold text-accent mb-0 display-6">{{ formatPrice(totalRevenue) }}</h3>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card admin-kpi-card rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
              <h5 class="text-white opacity-85 small fw-bold text-uppercase mb-2"><i class="bi bi-hourglass-split me-2 text-amber"></i>Reservas Pendientes</h5>
              <h3 class="fw-bold text-amber mb-0 display-6">{{ pendingBookingsCount }}</h3>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card admin-kpi-card rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
              <h5 class="text-white opacity-85 small fw-bold text-uppercase mb-2"><i class="bi bi-people-fill me-2 text-info"></i>Total Pasajeros</h5>
              <h3 class="fw-bold text-info mb-0 display-6">{{ totalPax }}</h3>
            </div>
          </div>
        </div>

        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">CRM / Control de Reservas ({{ allCrmBookings.length }})</h3>
              <p class="small text-white opacity-85 mb-0">Gestión de prospectos WhatsApp, ventas Webpay y nómina oficial de pasajeros.</p>
            </div>
            
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <input v-model="crmSearchQuery" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Buscar cliente, RUT u orden..." style="min-width: 200px;">
              <select v-model="crmStatusFilter" class="form-select form-select-sm admin-input text-white" style="min-width: 160px;">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
              <button class="btn btn-outline-accent btn-sm px-3 fw-bold text-nowrap d-flex align-items-center" @click="exportCrmToCsv" title="Descargar todas las reservas con nómina de pasajeros en CSV">
                <i class="bi bi-file-earmark-excel me-1"></i> Exportar CSV
              </button>
              <button class="btn btn-accent btn-sm px-3 fw-bold text-dark-mountain text-nowrap d-flex align-items-center" @click="openAddCrmModal">
                <i class="bi bi-plus-circle-fill me-1"></i> Venta Manual
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle admin-table mb-0">
              <thead>
                <tr>
                  <th scope="col">Orden / Cliente</th>
                  <th scope="col">Experiencia / Tour</th>
                  <th scope="col" style="width: 120px;">Fecha</th>
                  <th scope="col" style="width: 70px;" class="text-center">Pax</th>
                  <th scope="col" style="width: 130px;">Total</th>
                  <th scope="col" style="width: 150px;">Canal / Pago</th>
                  <th scope="col" style="width: 140px;">Estado</th>
                  <th scope="col" class="text-end" style="width: 110px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in filteredBookings" :key="b.id">
                  <td>
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="badge bg-dark text-accent border border-secondary border-opacity-25 font-monospace" style="font-size: 0.72rem;">{{ b.buyOrder }}</span>
                      <span v-if="b.customerRut && b.customerRut !== 'N/A'" class="badge bg-dark bg-opacity-50 text-white border border-secondary border-opacity-25" style="font-size: 0.7rem;">{{ b.customerRut }}</span>
                    </div>
                    <div class="fw-bold text-white fs-6">{{ b.customerName }}</div>
                    <div class="small text-white opacity-75" style="font-size: 0.78rem;">
                      <i class="bi bi-envelope me-1 text-accent"></i>{{ b.customerEmail }} | 
                      <i class="bi bi-telephone ms-1 me-1 text-accent"></i>{{ b.customerPhone }}
                    </div>
                    <div v-if="b.notes" class="small text-warning mt-1" style="font-size: 0.72rem;">
                      <i class="bi bi-chat-text-fill me-1"></i>{{ b.notes }}
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold text-white mb-1">{{ b.experienceTitle }}</div>
                    <div v-if="b.passengers && b.passengers.length > 0" class="badge bg-info bg-opacity-25 text-info border border-info border-opacity-25" style="font-size: 0.68rem;">
                      <i class="bi bi-people-fill me-1"></i>{{ b.passengers.length }} en nómina
                    </div>
                  </td>
                  <td class="text-white opacity-90 font-monospace">{{ b.bookingDate }}</td>
                  <td class="text-center font-monospace fw-bold text-white fs-6">{{ b.pax }}</td>
                  <td class="fw-bold text-accent font-monospace fs-6">{{ formatPrice(b.totalPrice) }}</td>
                  <td>
                    <div v-if="b.paymentMethod === 'webpay'" class="d-flex flex-column">
                      <span class="badge bg-primary text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem;"><i class="bi bi-credit-card-2-front-fill me-1"></i>Webpay Plus</span>
                      <span v-if="b.authorizationCode" class="small text-accent font-monospace mt-1" style="font-size: 0.68rem;">Auth: {{ b.authorizationCode }}</span>
                    </div>
                    <div v-else-if="b.paymentMethod === 'whatsapp'" class="d-flex flex-column">
                      <span class="badge text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem; background-color: #25D366;"><i class="bi bi-whatsapp me-1"></i>WhatsApp Lead</span>
                    </div>
                    <div v-else-if="b.paymentMethod === 'transfer'" class="d-flex flex-column">
                      <span class="badge bg-teal text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem; background-color: #0d9488;"><i class="bi bi-bank me-1"></i>Transferencia</span>
                    </div>
                    <div v-else class="d-flex flex-column">
                      <span class="badge bg-secondary text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem;"><i class="bi bi-person-fill me-1"></i>Venta Manual</span>
                    </div>
                  </td>
                  <td>
                    <select 
                      v-model="b.status" 
                      @change="updateBookingStatus(b.id, b.status)"
                      class="form-select form-select-sm fw-bold border-0 text-center" 
                      :class="{
                        'bg-amber text-white': b.status === 'pending',
                        'bg-emerald text-white': b.status === 'confirmed',
                        'bg-rose text-white': b.status === 'cancelled'
                      }"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-accent px-2 py-1 me-1" @click="openBookingDetailsModal(b)" title="Ver Ficha y Nómina de Pasajeros">
                      <i class="bi bi-card-checklist"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="deleteBooking(b.id)" title="Eliminar Registro">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredBookings.length === 0">
                  <td colspan="8" class="text-center py-5 text-white opacity-75">
                    <i class="bi bi-inbox fs-2 d-block mb-2 text-accent"></i>
                    No hay reservas registradas coincidentes en el CRM.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB PANEL: PROMOCIONES Y DESCUENTOS -->
      <div v-if="activeTab === 'promotions'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">Códigos de Descuento ({{ contentStore.discountCodes.length }})</h3>
              <p class="small text-white opacity-85 mb-0">Crea códigos promocionales para aplicar rebajas en el carrito de compras.</p>
            </div>
            <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain" @click="openAddDiscountModal">
              <i class="bi bi-plus-lg me-2"></i>Nuevo Código
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle admin-table mb-0">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Valor</th>
                  <th scope="col" style="width: 120px;" class="text-center">Estado</th>
                  <th scope="col" class="text-end" style="width: 150px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="discount in contentStore.discountCodes" :key="discount.id">
                  <td>
                    <span class="badge bg-dark text-accent border border-secondary border-opacity-25 font-monospace fs-6 px-3 py-2">
                      {{ discount.code }}
                    </span>
                  </td>
                  <td>
                    <span class="text-white">
                      <i class="bi me-2 text-accent" :class="discount.type === 'percentage' ? 'bi-percent' : 'bi-currency-dollar'"></i>
                      {{ discount.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo' }}
                    </span>
                  </td>
                  <td class="fw-bold text-accent fs-6">
                    {{ discount.type === 'percentage' ? discount.value + '%' : formatPrice(discount.value) }}
                  </td>
                  <td class="text-center">
                    <button 
                      class="btn btn-sm w-100 fw-bold border-0" 
                      :class="discount.isActive ? 'btn-outline-success text-success bg-success bg-opacity-10' : 'btn-outline-secondary text-secondary bg-secondary bg-opacity-10'"
                      @click="toggleDiscountStatus(discount.id, discount.isActive)"
                      :title="discount.isActive ? 'Desactivar' : 'Activar'"
                    >
                      <i class="bi me-1" :class="discount.isActive ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'"></i>
                      {{ discount.isActive ? 'Activo' : 'Inactivo' }}
                    </button>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-accent me-1 px-2 py-1" @click="openEditDiscountModal(discount)" title="Editar Código">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="deleteDiscount(discount.id)" title="Eliminar Código">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="contentStore.discountCodes.length === 0">
                  <td colspan="5" class="text-center py-5 text-white opacity-75">
                    <i class="bi bi-tags fs-2 d-block mb-2 text-accent"></i>
                    No hay códigos de descuento creados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB PANEL: GESTIÓN DE PAQUETES Y COMBOS DE TOURS -->
      <div v-if="activeTab === 'packages'" class="tab-pane-content">
        <div class="admin-module-card p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 class="h5 fw-bold mb-1 text-white">
                <i class="bi bi-box-seam me-2 text-accent"></i>
                Paquetes de Tours & Combos Multitour ({{ contentStore.tourPackages.length }})
              </h3>
              <p class="small text-white opacity-85 mb-0">
                Arma combos de 2 o más experiencias y asígnales descuentos porcentuales o montos fijos para el inicio.
              </p>
            </div>
            <button class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain d-flex align-items-center gap-2" @click="openAddPackageModal">
              <i class="bi bi-plus-lg"></i> Nuevo Paquete
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle admin-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style="width: 80px;">Portada</th>
                  <th scope="col">Título del Paquete</th>
                  <th scope="col">Tours Incluidos</th>
                  <th scope="col">Valor Normal</th>
                  <th scope="col">Precio Combo</th>
                  <th scope="col" style="width: 120px;" class="text-center">Estado</th>
                  <th scope="col" class="text-end" style="width: 140px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pkg in contentStore.tourPackages" :key="pkg.id">
                  <td>
                    <img 
                      :src="pkg.imageUrl" 
                      alt="Cover" 
                      class="rounded-3 object-fit-cover shadow-sm border border-secondary border-opacity-25" 
                      style="width: 65px; height: 50px;"
                    >
                  </td>
                  <td>
                    <div class="fw-bold text-white fs-6 mb-1">{{ pkg.title }}</div>
                    <div class="d-flex align-items-center gap-2">
                      <span v-if="pkg.badgeText" class="badge bg-accent text-dark-mountain fw-bold" style="font-size: 0.68rem;">
                        {{ pkg.badgeText }}
                      </span>
                      <span class="small text-white opacity-75 text-truncate" style="max-width: 280px; font-size: 0.78rem;">
                        {{ pkg.description }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column gap-1">
                      <span class="badge bg-dark text-accent border border-secondary border-opacity-25 align-self-start" style="font-size: 0.72rem;">
                        {{ pkg.includedTourIds.length }} experiencias
                      </span>
                      <div class="small text-white opacity-75" style="font-size: 0.75rem;">
                        {{ pkg.includedTourIds.map(id => contentStore.experiences.find(e => e.id === id)?.title || id).join(' + ') }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-white opacity-50 text-decoration-line-through small">
                      {{ formatPrice(pkg.originalPrice) }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-accent fs-6">{{ formatPrice(pkg.bundlePrice) }}</div>
                    <span v-if="pkg.originalPrice > pkg.bundlePrice" class="badge bg-success bg-opacity-25 text-success small" style="font-size: 0.68rem;">
                      -{{ formatPrice(pkg.originalPrice - pkg.bundlePrice) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button 
                      class="btn btn-sm w-100 fw-bold border-0" 
                      :class="pkg.isActive ? 'btn-outline-success text-success bg-success bg-opacity-10' : 'btn-outline-secondary text-secondary bg-secondary bg-opacity-10'"
                      @click="togglePackageStatus(pkg.id, pkg.isActive)"
                      :title="pkg.isActive ? 'Desactivar de la portada' : 'Publicar en la portada'"
                    >
                      <i class="bi me-1" :class="pkg.isActive ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'"></i>
                      {{ pkg.isActive ? 'Publicado' : 'Oculto' }}
                    </button>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-accent me-1 px-2 py-1" @click="openEditPackageModal(pkg)" title="Editar Paquete">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="deletePackage(pkg.id)" title="Eliminar Paquete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="contentStore.tourPackages.length === 0">
                  <td colspan="7" class="text-center py-5 text-white opacity-75">
                    <i class="bi bi-box-seam fs-2 d-block mb-2 text-accent"></i>
                    No has creado ningún paquete promocional aún. Haz clic en "Nuevo Paquete" para armar el primero.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB PANEL 8: PASARELA DE PAGO, TRANSFERENCIAS & CIBERSEGURIDAD -->
      <div v-if="activeTab === 'gateway'" class="tab-pane-content">
        <form @submit.prevent="saveGatewayContent" class="row g-4">
          
          <!-- 1. TRANSBANK WEBPAY PLUS -->
          <div class="col-12 col-lg-6">
            <div class="admin-module-card p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="p-2 rounded-circle bg-primary bg-opacity-25 text-accent d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-credit-card-2-front-fill fs-5"></i>
                  </span>
                  <div>
                    <h3 class="h5 fw-bold mb-0 text-white">Transbank Webpay Plus</h3>
                    <span class="small text-white opacity-75">Pasarela de pago automática con tarjetas de crédito/débito</span>
                  </div>
                </div>
                <div class="form-check form-switch">
                  <input v-model="gatewayForm.transbank.isEnabled" class="form-check-input" type="checkbox" role="switch" id="tbkSwitch">
                </div>
              </div>

              <div class="p-3 rounded-3 mb-3" style="background-color: #0D5B57; border: 1px solid rgba(231, 220, 195, 0.25);">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-white mb-1">Ambiente de Operación</label>
                  <select v-model="gatewayForm.transbank.environment" class="form-select admin-input text-white fw-bold">
                    <option value="INTEGRATION">🧪 Integración (Sandbox de Pruebas Oficial Transbank)</option>
                    <option value="PRODUCTION">🔒 Producción (Ventas Reales con Contrato Transbank)</option>
                  </select>
                  <span class="small text-white opacity-75 d-block mt-1" style="font-size: 0.75rem;">
                    {{ gatewayForm.transbank.environment === 'INTEGRATION' ? 'En modo Integración se aceptan tarjetas de prueba de Transbank sin cargos reales.' : 'En modo Producción se procesan cargos bancarios reales a los clientes.' }}
                  </span>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-bold text-white mb-1">Código de Comercio (Commerce Code)</label>
                  <input v-model="gatewayForm.transbank.commerceCode" type="text" class="form-control admin-input text-white font-monospace" placeholder="Ej: 597055555532 o código asignado por Transbank">
                </div>

                <div>
                  <label class="form-label small fw-bold text-white mb-1">API Key Secreta (Token Privado)</label>
                  <input v-model="gatewayForm.transbank.apiKey" type="password" class="form-control admin-input text-white font-monospace" placeholder="Llave de autenticación Transbank">
                  <span class="small text-accent opacity-90 d-block mt-1" style="font-size: 0.72rem;">
                    <i class="bi bi-shield-check me-1"></i>Las llaves se comunican únicamente con el microservicio backend aislado.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. TRANSFERENCIA BANCARIA DIRECTA -->
          <div class="col-12 col-lg-6">
            <div class="admin-module-card p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="p-2 rounded-circle bg-teal bg-opacity-25 text-accent d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: rgba(20, 126, 121, 0.25);">
                    <i class="bi bi-bank fs-5"></i>
                  </span>
                  <div>
                    <h3 class="h5 fw-bold mb-0 text-white">Transferencia Bancaria</h3>
                    <span class="small text-white opacity-75">Datos bancarios visibles en el Checkout para pago manual</span>
                  </div>
                </div>
                <div class="form-check form-switch">
                  <input v-model="gatewayForm.bankTransfer.isEnabled" class="form-check-input" type="checkbox" role="switch" id="transferSwitch">
                </div>
              </div>

              <div class="p-3 rounded-3" style="background-color: #0D5B57; border: 1px solid rgba(231, 220, 195, 0.25);">
                <div class="row g-2 mb-2">
                  <div class="col-sm-6">
                    <label class="form-label small fw-bold text-white mb-1">Banco</label>
                    <input v-model="gatewayForm.bankTransfer.bankName" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Banco Santander Chile">
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label small fw-bold text-white mb-1">Tipo de Cuenta</label>
                    <input v-model="gatewayForm.bankTransfer.accountType" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Cuenta Corriente">
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label small fw-bold text-white mb-1">N° de Cuenta</label>
                    <input v-model="gatewayForm.bankTransfer.accountNumber" type="text" class="form-control form-control-sm admin-input text-white font-monospace" placeholder="89-01234-5">
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label small fw-bold text-white mb-1">RUT Empresa</label>
                    <input v-model="gatewayForm.bankTransfer.accountRut" type="text" class="form-control form-control-sm admin-input text-white font-monospace" placeholder="77.890.123-4">
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-bold text-white mb-1">Titular / Razón Social</label>
                    <input v-model="gatewayForm.bankTransfer.accountHolder" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Wamani SpA">
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-bold text-white mb-1">Email para Comprobantes</label>
                    <input v-model="gatewayForm.bankTransfer.notificationEmail" type="email" class="form-control form-control-sm admin-input text-white" placeholder="pagos@wamani.cl">
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-bold text-white mb-1">Instrucciones Adicionales</label>
                    <textarea v-model="gatewayForm.bankTransfer.instructions" class="form-control form-control-sm admin-input text-white" rows="2"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. CORREOS TRANSACCIONALES Y CIBERSEGURIDAD EN VIVO -->
          <div class="col-12">
            <div class="admin-module-card p-4 rounded-4 shadow-sm">
              <div class="row g-4">
                
                <!-- Notificaciones por Email -->
                <div class="col-md-6">
                  <h4 class="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                    <i class="bi bi-envelope-check-fill text-accent fs-5"></i>
                    Notificaciones Automáticas por Correo
                  </h4>
                  <div class="p-3 rounded-3" style="background-color: #0D5B57; border: 1px solid rgba(231, 220, 195, 0.25);">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white mb-1">Email Administrador (Recibe copia de cada reserva)</label>
                      <input v-model="gatewayForm.emailNotifications.adminEmail" type="email" class="form-control admin-input text-white" placeholder="reservas@wamani.cl">
                    </div>
                    <div class="form-check form-switch mb-2">
                      <input v-model="gatewayForm.emailNotifications.sendVoucherToCustomer" class="form-check-input" type="checkbox" id="emailCustSwitch">
                      <label class="form-check-label small text-white fw-semibold" for="emailCustSwitch">
                        Enviar Voucher oficial en PDF/HTML al cliente automáticamente tras el pago
                      </label>
                    </div>
                    <span class="small text-white opacity-75" style="font-size: 0.75rem;">
                      <i class="bi bi-info-circle text-accent me-1"></i>
                      Configura las credenciales SMTP en el archivo <code>server/.env</code> para habilitar el servidor de correo en producción.
                    </span>
                  </div>
                </div>

                <!-- Checklist de Ciberseguridad -->
                <div class="col-md-6">
                  <h4 class="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                    <i class="bi bi-shield-lock-fill text-accent fs-5"></i>
                    Estado de Ciberseguridad del Sistema
                  </h4>
                  <div class="p-3 rounded-3" style="background-color: #0D5B57; border: 1px solid rgba(231, 220, 195, 0.25);">
                    <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
                      <li class="d-flex align-items-center justify-content-between text-white pb-2 border-bottom border-secondary border-opacity-25">
                        <span><i class="bi bi-check-circle-fill text-success me-2"></i>Cumplimiento PCI-DSS</span>
                        <span class="badge bg-success">Activo (Sin retención de CVV)</span>
                      </li>
                      <li class="d-flex align-items-center justify-content-between text-white pb-2 border-bottom border-secondary border-opacity-25">
                        <span><i class="bi bi-check-circle-fill text-success me-2"></i>Protector Anti Fuerza Bruta</span>
                        <span class="badge bg-success">Activo (Lockout 60s tras 5 fallos)</span>
                      </li>
                      <li class="d-flex align-items-center justify-content-between text-white pb-2 border-bottom border-secondary border-opacity-25">
                        <span><i class="bi bi-check-circle-fill text-success me-2"></i>Cabeceras HTTP HSTS / CSP</span>
                        <span class="badge bg-accent text-dark-mountain fw-bold">Configuradas (Nginx/Vercel)</span>
                      </li>
                      <li class="d-flex align-items-center justify-content-between text-white">
                        <span><i class="bi bi-check-circle-fill text-success me-2"></i>Aislamiento de Claves Privadas</span>
                        <span class="badge bg-success">Zero Frontend Secrets</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              <div class="text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
                <button type="submit" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain">
                  <i class="bi bi-save2-fill me-2"></i>Guardar Ajustes de Pasarela
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>

    <!-- TAB PANEL 9: INFORMACIÓN LEGAL, RAZÓN SOCIAL & SERNATUR -->
    <div v-if="activeTab === 'legal'" class="tab-pane-content">
      <div class="admin-module-card p-4 rounded-4 shadow-sm">
        <form @submit.prevent="saveLegalContent" class="row g-4">
          <!-- Bloque Identificación Corporativa -->
          <div class="col-12">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 gap-3">
              <div>
                <span class="badge bg-accent text-dark-mountain px-3 py-1 mb-2 fw-bold text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                  Decreto 6/2021 & Ley 19.496
                </span>
                <h3 class="h5 fw-bold text-white mb-1">
                  <i class="bi bi-building-check me-2 text-accent"></i>Información Corporativa & Prestador Oficial
                </h3>
                <p class="small text-white opacity-85 mb-0">Datos legales y tributarios mostrados en el footer, comprobantes oficiales de compra y contratos de adhesión.</p>
              </div>
              <button type="submit" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow-sm flex-shrink-0">
                <i class="bi bi-save2-fill me-2"></i>Guardar Ajustes Legales
              </button>
            </div>

            <div class="p-3 rounded-4 admin-sub-card mb-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Razón Social Legal de la Empresa *</label>
                  <input v-model="legalForm.businessName" type="text" class="form-control admin-input text-white" required placeholder="Wamani Turismo y Expediciones SpA">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">RUT Comercial de la Empresa *</label>
                  <input v-model="legalForm.rut" type="text" class="form-control admin-input text-white" required placeholder="77.890.123-4">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Representante Legal *</label>
                  <input v-model="legalForm.legalRepresentative" type="text" class="form-control admin-input text-white" required placeholder="Nombre del Representante">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Correo Oficial de Soporte y Reclamos *</label>
                  <input v-model="legalForm.supportEmail" type="email" class="form-control admin-input text-white" required placeholder="contacto@wamani.cl">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Domicilio Legal y Comercial *</label>
                  <input v-model="legalForm.addressLegal" type="text" class="form-control admin-input text-white" required placeholder="Av. Bernardo O'Higgins 425">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold text-white">Ciudad / Comuna *</label>
                  <input v-model="legalForm.city" type="text" class="form-control admin-input text-white" required placeholder="Pucón">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold text-white">Región y País *</label>
                  <input v-model="legalForm.region" type="text" class="form-control admin-input text-white" required placeholder="Región de La Araucanía, Chile">
                </div>
              </div>
            </div>
          </div>

          <!-- Bloque SERNATUR & Turismo Aventura -->
          <div class="col-12">
            <h4 class="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-patch-check-fill text-accent fs-5"></i>
              Acreditación y Registro Oficial SERNATUR (Ley N° 20.423)
            </h4>
            <div class="p-3 rounded-4 admin-sub-card">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Número de Registro Oficial SERNATUR *</label>
                  <input v-model="legalForm.sernaturRegistry" type="text" class="form-control admin-input text-white" required placeholder="84219">
                  <span class="small text-white opacity-75 mt-1 d-block" style="font-size: 0.75rem;">
                    Identificador oficial visible en el footer, página nosotros y comprobantes de reserva.
                  </span>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">URL Oficial de Verificación Ciudadana SERNATUR</label>
                  <input v-model="legalForm.sernaturUrl" type="url" class="form-control admin-input text-white" required placeholder="https://serviciosturisticos.sernatur.cl/">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Teléfono de Asistencia y Emergencias 24/7 *</label>
                  <input v-model="legalForm.emergencyPhone" type="text" class="form-control admin-input text-white" required placeholder="+56 9 8567 3376">
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3">
            <button type="submit" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow-sm">
              <i class="bi bi-save2-fill me-2"></i>Guardar Información Legal & SERNATUR
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- TAB PANEL 12: COTIZADOR OFICIAL DE SERVICIOS -->
    <div v-if="activeTab === 'quote-generator'" class="tab-pane-content">
      <div class="admin-module-card p-4 rounded-4 shadow-sm mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1">OFICIAL</span>
              <h3 class="h4 fw-bold mb-0 text-white font-serif">Cotizador de Servicios Wamani Experience</h3>
            </div>
            <p class="small text-white opacity-85 mb-0">Genera propuestas y presupuestos formales para clientes, empresas o grupos con descarga en PDF y envío directo.</p>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button 
              class="btn btn-accent fw-bold text-dark-mountain d-flex align-items-center gap-2 shadow-sm" 
              :disabled="isGeneratingPdf"
              @click="downloadQuotePdf"
            >
              <span v-if="isGeneratingPdf" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-file-earmark-pdf-fill fs-5"></i>
              <span>{{ isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF (1 Página)' }}</span>
            </button>
            <button 
              class="btn btn-whatsapp-custom fw-bold d-flex align-items-center gap-2 shadow-sm" 
              :disabled="isGeneratingPdf"
              @click="sendQuoteWhatsApp"
            >
              <i class="bi bi-whatsapp fs-5"></i>
              <span>Enviar por WhatsApp (con PDF)</span>
            </button>
            <button class="btn btn-outline-light fw-semibold d-flex align-items-center gap-2" @click="printQuote" title="Vista de impresión directa">
              <i class="bi bi-printer-fill"></i> Imprimir
            </button>
            <button class="btn btn-outline-light fw-semibold d-flex align-items-center gap-2" @click="sendQuoteEmail">
              <i class="bi bi-envelope-fill"></i> Por Correo
            </button>
          </div>
        </div>

        <div class="row g-4">
          <!-- Columna Izquierda: Parámetros y Formulario -->
          <div class="col-12 col-xl-5">
            <div class="p-3 rounded-4 admin-sub-card mb-3">
              <h4 class="h6 fw-bold text-accent mb-3"><i class="bi bi-person-badge-fill me-2"></i>1. Datos del Cliente / Empresa</h4>
              <div class="row g-2">
                <div class="col-12">
                  <label class="form-label small fw-semibold text-white mb-1">Nombre Completo / Razón Social *</label>
                  <input v-model="quoteForm.clientName" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Ej: Marcela Gómez / Inversiones Austral SpA">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">RUT / DNI / Pasaporte</label>
                  <input v-model="quoteForm.clientRut" type="text" class="form-control form-control-sm admin-input text-white" placeholder="12.345.678-9">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Teléfono / WhatsApp *</label>
                  <input v-model="quoteForm.clientPhone" type="text" class="form-control form-control-sm admin-input text-white" placeholder="+56 9 1234 5678">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Correo Electrónico</label>
                  <input v-model="quoteForm.clientEmail" type="email" class="form-control form-control-sm admin-input text-white" placeholder="cliente@correo.com">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Ciudad / País</label>
                  <input v-model="quoteForm.clientCity" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Santiago, Chile">
                </div>
              </div>
            </div>

            <div class="p-3 rounded-4 admin-sub-card mb-3">
              <h4 class="h6 fw-bold text-accent mb-3"><i class="bi bi-calendar2-week-fill me-2"></i>2. Parámetros de la Actividad</h4>
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Folio Cotización</label>
                  <input v-model="quoteForm.quoteNumber" type="text" class="form-control form-control-sm admin-input text-white font-monospace">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Fecha Emisión</label>
                  <input v-model="quoteForm.date" type="date" class="form-control form-control-sm admin-input text-white">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Fecha de la Actividad</label>
                  <input v-model="quoteForm.activityDate" type="date" class="form-control form-control-sm admin-input text-white">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-white mb-1">Válido Hasta</label>
                  <input v-model="quoteForm.validUntil" type="date" class="form-control form-control-sm admin-input text-white">
                </div>
                <div class="col-8">
                  <label class="form-label small fw-semibold text-white mb-1">Destino Principal</label>
                  <input v-model="quoteForm.destination" type="text" class="form-control form-control-sm admin-input text-white">
                </div>
                <div class="col-4">
                  <label class="form-label small fw-semibold text-white mb-1">Total Pax</label>
                  <input v-model="quoteForm.paxTotal" type="number" min="1" class="form-control form-control-sm admin-input text-white">
                </div>
              </div>
            </div>

            <div class="p-3 rounded-4 admin-sub-card mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="h6 fw-bold text-accent mb-0"><i class="bi bi-cart-check-fill me-2"></i>3. Añadir Servicios & Paquetes</h4>
                <button class="btn btn-sm btn-outline-accent py-1" type="button" @click="addCustomItemToQuote">
                  <i class="bi bi-plus-lg me-1"></i>Ítem Libre
                </button>
              </div>

              <!-- Selector rápido desde Catálogo de Tours -->
              <label class="form-label small text-white-50 mb-1" style="font-size: 0.72rem;">Añadir Tour Individual:</label>
              <div class="input-group input-group-sm mb-3">
                <select v-model="selectedTourToQuote" class="form-select admin-input text-white">
                  <option value="">-- Seleccionar Tour del Catálogo --</option>
                  <option v-for="t in contentStore.experiences" :key="t.id" :value="t.id">
                    {{ t.title }} ({{ formatPrice(t.pricing.basePrice) }} p/p)
                  </option>
                </select>
                <button class="btn btn-accent fw-bold text-dark-mountain" type="button" @click="addTourToQuote">
                  Añadir Tour
                </button>
              </div>

              <!-- Selector rápido desde Paquetes de Tours -->
              <label class="form-label small text-white-50 mb-1" style="font-size: 0.72rem;">Añadir Paquete de Tours / Combo:</label>
              <div class="input-group input-group-sm mb-3">
                <select v-model="selectedPackageToQuote" class="form-select admin-input text-white">
                  <option value="">-- Seleccionar Paquete de Tours --</option>
                  <option v-for="pkg in contentStore.tourPackages" :key="pkg.id" :value="pkg.id">
                    📦 {{ pkg.title }} ({{ formatPrice(pkg.bundlePrice) }})
                  </option>
                </select>
                <button class="btn btn-accent fw-bold text-dark-mountain" type="button" @click="addPackageToQuote">
                  Añadir Paquete
                </button>
              </div>

              <!-- Lista editable de ítems -->
              <div class="d-flex flex-column gap-2">
                <div v-for="(it, idx) in quoteForm.items" :key="it.id" class="p-2 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <input v-model="it.title" type="text" class="form-control form-control-sm admin-input text-white fw-bold py-1" placeholder="Nombre del servicio">
                    <button class="btn btn-sm btn-outline-danger py-0 px-2 flex-shrink-0" @click="removeQuoteItem(idx)" title="Quitar ítem">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  <input v-model="it.description" type="text" class="form-control form-control-sm admin-input text-white mb-2 py-0" style="font-size: 0.78rem;" placeholder="Detalle / Inclusiones...">
                  <div class="row g-2">
                    <div class="col-5">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text bg-dark text-white-50 border-secondary border-opacity-25" style="font-size: 0.72rem;">Cant/Pax</span>
                        <input v-model="it.quantity" type="number" min="1" class="form-control admin-input text-white text-center">
                      </div>
                    </div>
                    <div class="col-7">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text bg-dark text-white-50 border-secondary border-opacity-25" style="font-size: 0.72rem;">$ Unit</span>
                        <input v-model="it.unitPrice" type="number" step="1000" class="form-control admin-input text-white text-end font-monospace">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Descuentos y Condiciones -->
            <div class="p-3 rounded-4 admin-sub-card">
              <h4 class="h6 fw-bold text-accent mb-3"><i class="bi bi-percent me-2"></i>4. Descuentos & Régimen Tributario</h4>
              <div class="row g-2 mb-3">
                <div class="col-12 col-md-5">
                  <label class="form-label small fw-semibold text-white mb-1">Descuento Global ($CLP)</label>
                  <input v-model="quoteForm.discountAmount" type="number" step="1000" class="form-control form-control-sm admin-input text-white font-monospace">
                </div>
                <div class="col-12 col-md-7">
                  <label class="form-label small fw-semibold text-white mb-1">Régimen de IVA & Facturación</label>
                  <select v-model="quoteForm.taxMode" class="form-select form-select-sm admin-input text-white">
                    <option value="iva_incluido">Precios Publicados (IVA 19% Incluido)</option>
                    <option value="factura">Factura Comercial (Desglose Neto + IVA)</option>
                    <option value="exento">Exento IVA (Turismo Receptivo Extranjero)</option>
                    <option value="neto_mas_iva">Precios son Netos (+19% IVA adicional)</option>
                  </select>
                </div>
                <div class="col-12">
                  <span class="small text-white-50" style="font-size: 0.73rem;">
                    <i class="bi bi-info-circle me-1"></i>En el modo estándar, los precios del catálogo ya contienen el IVA 19% y el Total a pagar no se infla.
                  </span>
                </div>
                <div class="col-12 mt-2">
                  <label class="form-label small fw-semibold text-white mb-1">Términos, Medios de Pago & Notas</label>
                  <textarea v-model="quoteForm.notes" rows="3" class="form-control form-control-sm admin-input text-white"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Vista Previa Oficial Descargable en 1 Página -->
          <div class="col-12 col-xl-7">
            <div 
              id="quote-preview-paper" 
              class="quote-preview-paper p-4 rounded-4 shadow-lg position-relative mx-auto" 
              style="max-width: 820px; background: #FFFFFF; border: 1.5px solid #BDD7D1; color: #082826; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;"
            >
              <!-- Barra de acento de marca en la parte superior (Gradiente Verde Corporativo Wamani) -->
              <div 
                class="position-absolute top-0 start-0 w-100 rounded-top-4" 
                style="height: 6px; background: linear-gradient(90deg, #082826 0%, #0D5B57 70%, #177C77 100%);"
              ></div>

              <!-- 1. CABECERA CORPORATIVA DE LA COTIZACIÓN -->
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 pt-1" style="border-color: #C4DDD7 !important;">
                <div class="d-flex gap-3 align-items-center">
                  <div class="rounded-3 d-flex align-items-center justify-content-center shadow-xs" style="background: #F0F6F5; border: 1.5px solid #C4DDD7; width: 60px; height: 60px; padding: 4px;">
                    <img src="/Logo Wamani.png" alt="Wamani Logo" height="50" width="50" class="object-fit-contain">
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <h2 class="h4 fw-bold font-serif mb-0" style="color: #082826; letter-spacing: 0.03em;">WAMANI EXPERIENCE</h2>
                      <span style="background: rgba(13, 91, 87, 0.12); color: #082826; border: 1px solid rgba(13, 91, 87, 0.25); border-radius: 9999px; padding: 2px 10px; font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                        Turismo & Ecoturismo
                      </span>
                    </div>
                    <div class="lh-sm" style="font-size: 0.73rem; color: #082826;">
                      <div>
                        <strong>R.U.T.:</strong> {{ contentStore.content.legal.rut }} &nbsp;&bull;&nbsp; 
                        <strong>SERNATUR:</strong> N° {{ contentStore.content.legal.sernaturRegistry }} &nbsp;&bull;&nbsp; 
                        <span>{{ contentStore.content.legal.city }}, Chile</span>
                      </div>
                      <div class="mt-0.5">
                        <strong>Contacto:</strong> {{ contentStore.content.contact.email }} &nbsp;&bull;&nbsp; 
                        <strong>Tel:</strong> {{ contentStore.content.contact.phone }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tarjeta de Folio y Fecha en Verde Wamani -->
                <div class="text-end">
                  <div class="rounded-3 text-center overflow-hidden shadow-xs" style="background: #F0F6F5; border: 1.5px solid #C4DDD7; min-width: 185px;">
                    <div style="background: #082826; color: #FFFFFF; padding: 4px 10px; font-size: 0.67rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;">
                      COTIZACIÓN OFICIAL
                    </div>
                    <div style="padding: 7px 10px;">
                      <div style="font-family: monospace; font-size: 1.05rem; font-weight: 800; color: #082826; line-height: 1.2;">{{ quoteForm.quoteNumber }}</div>
                      <div style="font-size: 0.72rem; color: #082826; margin-top: 2px;">Fecha: <strong>{{ quoteForm.date }}</strong></div>
                    </div>
                  </div>
                  <div style="font-size: 0.71rem; color: #0D5B57; font-weight: 700; text-align: right; margin-top: 4px;">
                    <i class="bi bi-clock-history me-1"></i>Válida hasta: {{ quoteForm.validUntil }}
                  </div>
                </div>
              </div>

              <!-- 2. BLOQUE CLIENTE & EXPERIENCIA (EN TONOS VERDE ALPINO) -->
              <div 
                class="row g-2 mb-3 rounded-3 shadow-xs" 
                style="background: #F0F6F5; border: 1.5px solid #C4DDD7; border-left: 5px solid #082826; padding: 12px 14px; margin-left: 0; margin-right: 0;"
              >
                <!-- Destinatario / Cliente -->
                <div class="col-sm-6 border-end" style="border-color: #C4DDD7 !important; padding-right: 14px;">
                  <div style="color: #0D5B57; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;">
                    <i class="bi bi-person-fill me-1"></i> DATOS DEL CLIENTE / DESTINATARIO
                  </div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #082826; margin-bottom: 2px;">
                    {{ quoteForm.clientName || 'Cliente Particular' }}
                  </div>
                  <div style="font-size: 0.74rem; color: #082826; line-height: 1.4;">
                    <span v-if="quoteForm.clientRut"><strong>RUT:</strong> {{ quoteForm.clientRut }} &nbsp;&bull;&nbsp; </span>
                    <span>{{ quoteForm.clientCity || 'Chile' }}</span>
                  </div>
                  <div style="font-size: 0.74rem; color: #082826; line-height: 1.4;">
                    <span v-if="quoteForm.clientPhone"><strong>Tel:</strong> {{ quoteForm.clientPhone }}</span>
                    <span v-if="quoteForm.clientPhone && quoteForm.clientEmail"> &nbsp;&bull;&nbsp; </span>
                    <span v-if="quoteForm.clientEmail"><strong>Correo:</strong> {{ quoteForm.clientEmail }}</span>
                  </div>
                </div>

                <!-- Detalle de la Propuesta / Destino -->
                <div class="col-sm-6 ps-sm-3">
                  <div style="color: #0D5B57; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;">
                    <i class="bi bi-compass-fill me-1"></i> DETALLES DE LA EXPERIENCIA
                  </div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #082826; margin-bottom: 2px;">
                    {{ quoteForm.destination || 'Pucón / Araucanía Lacustre' }}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 0.74rem; color: #082826;">
                    <span><strong>Fecha Programa:</strong> {{ quoteForm.activityDate }}</span>
                    <span style="background: #082826; color: #FFFFFF; font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
                      <i class="bi bi-people-fill me-1"></i>{{ quoteForm.paxTotal }} Pasajeros
                    </span>
                  </div>
                </div>
              </div>

              <!-- 3. TABLA DE SERVICIOS COTIZADOS -->
              <div class="table-responsive mb-3 rounded-3 overflow-hidden shadow-xs" style="border: 1.5px solid #C4DDD7;">
                <table class="table align-middle table-sm mb-0">
                  <thead style="background: #082826; color: #FFFFFF;">
                    <tr>
                      <th class="py-2 ps-3 text-center" style="font-size: 0.72rem; width: 35px; border: none; letter-spacing: 0.06em;">#</th>
                      <th class="py-2" style="font-size: 0.72rem; border: none; letter-spacing: 0.06em;">DESCRIPCIÓN DEL SERVICIO & INCLUSIONES</th>
                      <th class="py-2 text-center" style="font-size: 0.72rem; width: 85px; border: none; letter-spacing: 0.06em;">PAX / CANT</th>
                      <th class="py-2 text-end" style="font-size: 0.72rem; width: 110px; border: none; letter-spacing: 0.06em;">VALOR UNIT.</th>
                      <th class="py-2 text-end pe-3" style="font-size: 0.72rem; width: 125px; border: none; letter-spacing: 0.06em;">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(it, idx) in quoteForm.items" 
                      :key="it.id" 
                      :style="{ background: idx % 2 === 0 ? '#FFFFFF' : '#F5F9F8' }"
                      style="border-bottom: 1px solid #D6E8E4;"
                    >
                      <td class="ps-3 text-center fw-bold" style="font-size: 0.76rem; color: #0D5B57;">{{ idx + 1 }}</td>
                      <td class="py-2">
                        <strong class="d-block" style="color: #082826; font-size: 0.84rem;">{{ it.title }}</strong>
                        <span class="lh-sm d-block" style="color: #082826; opacity: 0.85; font-size: 0.72rem;">{{ it.description }}</span>
                      </td>
                      <td class="text-center fw-bold py-2" style="color: #082826; font-size: 0.8rem;">{{ it.quantity }}</td>
                      <td class="text-end font-monospace py-2" style="color: #082826; font-size: 0.8rem;">{{ formatPrice(it.unitPrice) }}</td>
                      <td class="text-end pe-3 font-monospace fw-bold py-2" style="color: #082826; font-size: 0.84rem;">{{ formatPrice(it.quantity * it.unitPrice) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 4. SECCIÓN INFERIOR BALANCEADA EN 2 COLUMNAS (TOTALMENTE INTEGRADA EN TONOS VERDE) -->
              <div class="row g-3 mb-3">
                <!-- Columna Izquierda: Medios de Pago, Banco Santander, Webpay y Monedas -->
                <div class="col-sm-6">
                  <div class="rounded-3 h-100 d-flex flex-column justify-content-between shadow-xs" style="background: #F0F6F5; border: 1.5px solid #C4DDD7; border-left: 5px solid #082826; padding: 14px;">
                    <div>
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <div style="color: #0D5B57; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">
                          <i class="bi bi-shield-check me-1"></i> CONDICIONES & MEDIOS DE PAGO
                        </div>
                        <span style="background: #082826; color: #FFFFFF; font-size: 0.64rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                          IVA 19% INCLUIDO
                        </span>
                      </div>

                      <!-- Notas y Condiciones -->
                      <div class="lh-sm mb-2" style="font-size: 0.72rem; color: #082826; line-height: 1.4;">
                        {{ quoteForm.notes }}
                      </div>

                      <!-- Recuadro Blanco Banco Santander -->
                      <div class="rounded-2 lh-sm mb-2" style="background: #FFFFFF; border: 1.5px solid #C4DDD7; font-size: 0.72rem; color: #082826; padding: 9px 12px;">
                        <div class="d-flex align-items-center gap-1 fw-bold mb-1" style="color: #082826;">
                          <i class="bi bi-bank2" style="color: #0D5B57;"></i>
                          <span>Banco Santander Chile &bull; Cta. Corriente N° 89-01234-5</span>
                        </div>
                        <div><strong>Titular:</strong> Wamani Experience SpA &nbsp;&bull;&nbsp; <strong>RUT:</strong> 78.199.034-5</div>
                        <div><strong>Comprobante a:</strong> experiencewamani@gmail.com</div>
                      </div>
                    </div>

                    <!-- Badges de Pago: Webpay, CLP y Referencia Monedas -->
                    <div class="d-flex flex-wrap align-items-center gap-2 pt-2 border-top" style="border-color: #D6E8E4 !important;">
                      <!-- Webpay Badge -->
                      <div class="d-inline-flex align-items-center gap-1.5 fw-bold" style="background: #FFFFFF; border: 1px solid #C4DDD7; border-radius: 6px; padding: 3px 8px; font-size: 0.68rem; color: #082826;">
                        <span>Pagar con</span>
                        <img src="/webpay-logo-transparent.png" alt="Webpay.cl" style="height: 14px; width: auto; object-fit: contain;" />
                      </div>

                      <!-- CLP Badge -->
                      <span style="background: rgba(13, 91, 87, 0.1); color: #082826; border: 1px solid rgba(13, 91, 87, 0.2); border-radius: 6px; padding: 3px 8px; font-size: 0.68rem; font-weight: 700;">
                        Moneda Oficial: CLP
                      </span>

                      <!-- Divisas de Referencia -->
                      <span style="background: #082826; color: #FFFFFF; border-radius: 6px; padding: 3px 8px; font-size: 0.66rem; font-weight: 600;">
                        USD ${{ (quoteTotal * 0.0011).toFixed(0) }} | BRL R${{ (quoteTotal * 0.0055).toFixed(0) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Columna Derecha: Desglose y Cajón de TOTAL A PAGAR (CORREGIDO SIN SUPERPOSICIONES) -->
                <div class="col-sm-6">
                  <div class="rounded-3 h-100 d-flex flex-column justify-content-between shadow-xs" style="background: #F0F6F5; border: 1.5px solid #C4DDD7; padding: 14px;">
                    <div>
                      <div class="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom" style="border-color: #D6E8E4 !important;">
                        <div style="color: #0D5B57; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">
                          <i class="bi bi-receipt me-1"></i> RESUMEN DE LIQUIDACIÓN
                        </div>
                        <span style="font-family: monospace; font-weight: 700; color: #082826; font-size: 0.72rem;">{{ quoteForm.items.length }} ítem(s)</span>
                      </div>

                      <div class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.75rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">Subtotal Servicios:</span>
                        <span style="font-family: monospace; font-weight: 700; color: #082826;">{{ formatPrice(quoteSubtotal) }}</span>
                      </div>

                      <div v-if="quoteDiscount > 0" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.75rem; border-color: #D6E8E4 !important; color: #0D5B57;">
                        <span class="fw-semibold"><i class="bi bi-tag-fill me-1"></i>Descuento Especial:</span>
                        <span style="font-family: monospace; font-weight: 700;">-{{ formatPrice(quoteDiscount) }}</span>
                      </div>

                      <!-- Desglose de IVA según taxMode -->
                      <div v-if="quoteForm.taxMode === 'iva_incluido'" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.72rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">I.V.A. (19% Incluido en tarifa):</span>
                        <span style="font-family: monospace; font-weight: 700; color: #0D5B57;">{{ formatPrice(quoteIva) }}</span>
                      </div>
                      <div v-else-if="quoteForm.taxMode === 'factura'" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.74rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">Neto Facturable:</span>
                        <span style="font-family: monospace; font-weight: 600; color: #082826;">{{ formatPrice(quoteNeto) }}</span>
                      </div>
                      <div v-if="quoteForm.taxMode === 'factura'" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.74rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">I.V.A. (19%):</span>
                        <span style="font-family: monospace; font-weight: 700; color: #082826;">+{{ formatPrice(quoteIva) }}</span>
                      </div>
                      <div v-else-if="quoteForm.taxMode === 'exento'" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.72rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">Régimen Tributario:</span>
                        <span class="fw-bold" style="color: #0D5B57;">Exento IVA (Turismo Receptivo)</span>
                      </div>
                      <div v-else-if="quoteForm.taxMode === 'neto_mas_iva'" class="d-flex justify-content-between py-1 border-bottom" style="font-size: 0.74rem; border-color: #D6E8E4 !important;">
                        <span style="color: #082826;">I.V.A. (19% adicional):</span>
                        <span style="font-family: monospace; font-weight: 700; color: #082826;">+{{ formatPrice(quoteIva) }}</span>
                      </div>
                    </div>

                    <!-- CAJÓN DESTACADO VERDE BOSQUE: TOTAL A PAGAR (ESPACIADO EXACTO Y TEXTOS PERFECTAMENTE ENMARCADOS) -->
                    <div 
                      class="shadow-sm" 
                      style="background: #082826; border-radius: 10px; padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;"
                    >
                      <div>
                        <div style="color: #FFFFFF; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; line-height: 1.2;">
                          TOTAL A PAGAR:
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.75); font-size: 0.65rem; line-height: 1.2;">
                          Valores finales en pesos chilenos
                        </div>
                      </div>
                      <div class="text-end">
                        <div style="font-family: monospace; font-weight: 800; color: #FFFFFF; font-size: 1.32rem; letter-spacing: 0.02em; line-height: 1.1;">
                          {{ formatPrice(quoteTotal) }} CLP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. PIE DE PÁGINA INSTITUCIONAL SERNATUR -->
              <div class="d-flex justify-content-between align-items-center pt-2.5 border-top" style="border-color: #C4DDD7 !important; font-size: 0.68rem;">
                <div class="d-flex align-items-center gap-2">
                  <img src="/sernatur.webp" alt="Sernatur" height="24">
                  <span style="color: #082826; font-weight: 700;">Agencia Oficial de Turismo Acreditada en SERNATUR Chile N° 84219</span>
                </div>
                <span style="color: #082826; opacity: 0.85; font-weight: 500;">Wamani Experience SpA &bull; Av. Bernardo O'Higgins 425, Pucón, Chile</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL AVISO WHATSAPP PDF DESCARGADO -->
    <div v-if="showWhatsAppPdfModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg text-white text-center" style="max-width: 480px; border-radius: 24px;">
        <div class="mb-3">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-2" style="background: rgba(37, 211, 102, 0.15); border: 2px solid #25D366;">
            <i class="bi bi-file-earmark-pdf-fill text-accent fs-1"></i>
          </div>
          <h4 class="h5 fw-bold text-white mb-1">¡PDF Oficial Listo para WhatsApp!</h4>
          <p class="small text-white opacity-85 mb-0">
            El archivo <strong class="text-accent">{{ `Cotizacion-${quoteForm.quoteNumber}.pdf` }}</strong> se ha descargado automáticamente en tu equipo y se abrió el chat de WhatsApp.
          </p>
        </div>

        <div class="p-3 rounded-3 text-start mb-3" style="background: rgba(255,255,255,0.06); border: 1px dashed rgba(231,220,195,0.4); font-size: 0.8rem;">
          <div class="fw-bold text-accent mb-1"><i class="bi bi-info-circle me-1"></i>Paso final:</div>
          <div class="text-white opacity-85">
            Solo arrastra o adjunta el archivo PDF descargado desde tu carpeta de <em>Descargas</em> al chat de WhatsApp para que el cliente reciba la cotización formal en 1 página.
          </div>
        </div>

        <div class="d-flex justify-content-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-light px-3 py-2" @click="downloadQuotePdf">
            <i class="bi bi-arrow-clockwise me-1"></i> Re-descargar PDF
          </button>
          <button type="button" class="btn btn-sm btn-accent px-4 py-2 fw-bold text-dark-mountain shadow" @click="showWhatsAppPdfModal = false">
            <i class="bi bi-check-lg me-1"></i> ¡Entendido!
          </button>
        </div>
      </div>
    </div>

    <!-- TAB PANEL 13: GESTOR DE GALERÍA FOTOGRÁFICA -->
    <div v-if="activeTab === 'gallery-mgmt'" class="tab-pane-content">
      <div class="admin-module-card p-4 rounded-4 shadow-sm mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1">{{ contentStore.galleryImages.length }} FOTOS</span>
              <h3 class="h4 fw-bold mb-0 text-white font-serif">Galería Fotográfica Oficial</h3>
            </div>
            <p class="small text-white opacity-85 mb-0">Sube fotografías de expediciones sin límite de peso (se comprimen automáticamente). Se exhiben en la portada web.</p>
          </div>
        </div>

        <!-- Formulario para subir nuevas fotos a la galería -->
        <div class="p-4 rounded-4 admin-sub-card mb-4">
          <h4 class="h6 fw-bold text-accent mb-3"><i class="bi bi-cloud-arrow-up-fill me-2"></i>Subir Nuevas Fotografías a la Galería</h4>
          
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold text-white mb-1">Título de la Fotografía</label>
              <input v-model="newGalleryForm.title" type="text" class="form-control admin-input text-white" placeholder="Ej: Cumbre Volcán Villarrica al Atardecer">
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold text-white mb-1">Categoría</label>
              <select v-model="newGalleryForm.category" class="form-select admin-input text-white">
                <option value="Montaña">Montaña</option>
                <option value="Bosques">Bosques</option>
                <option value="Termas">Termas</option>
                <option value="Lagos">Lagos</option>
                <option value="Aventura">Aventura</option>
                <option value="Flora & Fauna">Flora & Fauna</option>
              </select>
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold text-white mb-1">Leyenda / Pie de Foto (Opcional)</label>
              <input v-model="newGalleryForm.caption" type="text" class="form-control admin-input text-white" placeholder="Ej: Expedición guiada en sector Las Peinetas">
            </div>

            <div class="col-12">
              <label class="form-label small fw-bold text-white mb-1">Seleccionar Imágenes (Cualquier tamaño; compresión interna automática)</label>
              <input type="file" multiple accept="image/*" class="form-control admin-input text-white" @change="handleGalleryFilesUpload">
            </div>

            <!-- Miniaturas en cola para subir -->
            <div v-if="newGalleryForm.images.length > 0" class="col-12">
              <label class="small text-white opacity-85 d-block mb-2">Imágenes listas para publicar ({{ newGalleryForm.images.length }}):</label>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="(imgUrl, idx) in newGalleryForm.images" :key="idx" class="position-relative rounded-3 overflow-hidden border border-secondary shadow-sm" style="width: 90px; height: 90px;">
                  <img :src="imgUrl" class="w-100 h-100 object-fit-cover" alt="Preview">
                  <button type="button" class="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center" style="width: 22px; height: 22px;" @click="removeNewGalleryImg(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <div class="mt-3">
                <button type="button" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow" @click="saveGalleryImages">
                  <i class="bi bi-check2-circle me-1"></i> Publicar en la Galería Oficial
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Grilla de fotos existentes en la galería -->
        <h4 class="h6 fw-bold text-white mb-3"><i class="bi bi-images me-2 text-accent"></i>Fotografías Activas en la Web ({{ contentStore.galleryImages.length }})</h4>
        
        <div class="row g-3">
          <div v-for="gImg in contentStore.galleryImages" :key="gImg.id" class="col-12 col-sm-6 col-md-4 col-xl-3">
            <div class="rounded-4 overflow-hidden position-relative border border-secondary border-opacity-25 shadow-sm h-100 d-flex flex-column justify-content-between" style="background: rgba(255, 255, 255, 0.05);">
              <div class="position-relative" style="height: 180px;">
                <img :src="gImg.url" :alt="gImg.title" class="w-100 h-100 object-fit-cover">
                <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center shadow" style="width: 28px; height: 28px;" @click="deleteGalleryImg(gImg.id)" title="Eliminar foto">
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <div class="p-3 text-white d-flex flex-column justify-content-between flex-grow-1">
                <div class="mb-2">
                  <strong class="d-block small fw-bold mb-1 text-white">{{ gImg.title }}</strong>
                  <p v-if="gImg.caption" class="small text-white opacity-80 mb-0" style="font-size: 0.8rem; line-height: 1.4;">{{ gImg.caption }}</p>
                  <p v-else class="small text-white-50 fst-italic mb-0" style="font-size: 0.75rem;">Sin descripción asignada</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline-accent w-100 d-flex align-items-center justify-content-center gap-1.5 py-1.5 mt-2" @click="openEditGalleryModal(gImg)">
                  <i class="bi bi-pencil-square"></i> Editar Textos
                </button>
              </div>
            </div>
          </div>

          <div v-if="contentStore.galleryImages.length === 0" class="col-12 text-center py-5 text-white opacity-75">
            <i class="bi bi-image fs-1 text-accent d-block mb-3"></i>
            Aún no hay fotografías en la galería. Sube tus primeras fotos arriba.
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL EDITAR TEXTOS DE FOTOGRAFÍA DE GALERÍA -->
    <div v-if="showEditGalleryModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg text-white" style="width: 100%; max-width: 580px; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-pencil-square text-accent"></i>
            Editar Textos de la Fotografía
          </h3>
          <button class="btn-close btn-close-white" @click="showEditGalleryModal = false"></button>
        </div>

        <form @submit.prevent="saveEditGalleryForm" class="d-flex flex-column gap-3">
          <!-- Vista previa de la foto -->
          <div class="rounded-3 overflow-hidden ratio ratio-16x9 border border-secondary border-opacity-25 mb-1">
            <img :src="editingGalleryForm.url" class="w-100 h-100 object-fit-cover" alt="Preview">
          </div>

          <div>
            <label class="form-label small fw-bold text-white mb-1">Título de la Fotografía</label>
            <input v-model="editingGalleryForm.title" type="text" class="form-control admin-input text-white" placeholder="Ej: Volcán Villarrica al Amanecer" required>
          </div>

          <div>
            <label class="form-label small fw-bold text-white mb-1">Leyenda / Descripción Completa</label>
            <textarea v-model="editingGalleryForm.caption" rows="3" class="form-control admin-input text-white" placeholder="Describe la postal, ubicación o experiencia..."></textarea>
            <span class="small text-white-50 mt-1 d-block" style="font-size: 0.72rem;">Este texto se verá completo en la tarjeta de la galería sin cortes.</span>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
            <button type="button" class="btn btn-outline-light px-3 py-2 fw-semibold" @click="showEditGalleryModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow">
              <i class="bi bi-check2-circle me-1"></i> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR TARJETA DE INICIO (SERVICE ITEM) -->
    <div v-if="showServiceItemModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 800px; max-height: 90vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-grid-3x3-gap-fill me-2 text-accent"></i>
            {{ serviceItemMode === 'add' ? 'Añadir Nueva Tarjeta al Inicio' : 'Editar Tarjeta de Inicio' }}
          </h3>
          <button class="btn-close btn-close-white" @click="showServiceItemModal = false"></button>
        </div>

        <form @submit.prevent="saveServiceItemForm" class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Título de la Tarjeta</label>
            <input v-model="serviceItemForm.title" type="text" class="form-control admin-input text-white" required placeholder="Ej: Experiencias Privadas">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Subtítulo Corto (Badge Superior)</label>
            <input v-model="serviceItemForm.subtitle" type="text" class="form-control admin-input text-white" required placeholder="Ej: Exclusividad Total">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-2">Imagen de Portada (Sube una imagen o pega la URL)</label>
            <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div v-if="serviceItemForm.coverImage" class="rounded-3 border border-secondary border-opacity-25 overflow-hidden flex-shrink-0" style="width: 120px; height: 90px;">
                <img :src="serviceItemForm.coverImage" class="w-100 h-100 object-fit-cover" alt="Vista previa">
              </div>
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleServiceCoverUpload">
                <input v-model="serviceItemForm.coverImage" type="text" class="form-control admin-input text-white" placeholder="O pega una URL externa de imagen...">
              </div>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Descripción (Un párrafo por cada doble salto de línea)</label>
            <textarea v-model="serviceItemForm.descriptionRaw" class="form-control admin-input text-white" rows="4" required placeholder="Ingresa los párrafos de explicación..."></textarea>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Público Objetivo (A quién va dirigido)</label>
            <input v-model="serviceItemForm.targetAudience" type="text" class="form-control admin-input text-white" placeholder="Ej: Familias, parejas y grupos privados...">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Características (Una característica por línea)</label>
            <textarea v-model="serviceItemForm.characteristicsRaw" class="form-control admin-input text-white" rows="4" placeholder="Ej:&#10;Servicio exclusivo&#10;Flexibilidad de horarios&#10;Guía certificado"></textarea>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Galería de Imágenes del Modal (Una URL de imagen por línea)</label>
            <textarea v-model="serviceItemForm.galleryRaw" class="form-control admin-input text-white text-monospace" rows="3" placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."></textarea>
          </div>

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showServiceItemModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain">Guardar Tarjeta</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR / AÑADIR SERVICIO DE TRANSPORTE -->
    <div v-if="showTransportModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 780px; max-height: 90vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-car-front-fill text-accent"></i>
            {{ transportModalMode === 'add' ? 'Añadir Servicio de Transporte' : 'Editar Servicio de Transporte' }}
          </h3>
          <button class="btn-close btn-close-white" @click="showTransportModal = false"></button>
        </div>

        <form @submit.prevent="saveTransportCardForm" class="row g-3">
          
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold text-white mb-1">Título del Servicio *</label>
            <input v-model="transportCardForm.title" type="text" class="form-control admin-input text-white" required placeholder="Ej: Traslados Aeropuerto VIP">
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold text-white mb-1">Badge Categoría / Subtítulo *</label>
            <input v-model="transportCardForm.badge" type="text" class="form-control admin-input text-white" required placeholder="Ej: Aeropuertos ZCO / PMC">
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold text-white mb-1">Badge Destacado (Opcional)</label>
            <input v-model="transportCardForm.featuredBadge" type="text" class="form-control admin-input text-white" placeholder="Ej: MÁS SOLICITADO (dejar vacío si no es destacado)">
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold text-white mb-1">Ícono Bootstrap</label>
            <div class="input-group">
              <span class="input-group-text bg-dark border-secondary text-accent">
                <i :class="transportCardForm.icon || 'bi-car-front-fill'"></i>
              </span>
              <input v-model="transportCardForm.icon" type="text" class="form-control admin-input text-white" placeholder="bi-airplane-engines">
            </div>
            <!-- Botones de sugerencias de íconos -->
            <div class="d-flex gap-1 mt-2 flex-wrap">
              <span class="small text-white-50 me-1" style="font-size: 0.72rem;">Sugerencias:</span>
              <button 
                type="button" 
                v-for="ic in ['bi-airplane-engines', 'bi-car-front-fill', 'bi-people-fill', 'bi-bus-front', 'bi-compass', 'bi-shield-check', 'bi-luggage-fill', 'bi-geo-alt-fill']" 
                :key="ic"
                class="btn btn-sm btn-outline-secondary py-0 px-2 text-white"
                style="font-size: 0.72rem;"
                @click="transportCardForm.icon = ic"
              >
                <i :class="ic"></i>
              </button>
            </div>
          </div>

          <!-- IMAGEN DE LA TARJETA (SUBIR O URL) -->
          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-1">Fotografía / Imagen de Portada (Opcional)</label>
            <p class="small text-white-50 mb-2" style="font-size: 0.78rem;">
              Si subes una foto, se mostrará en la cabecera de la tarjeta con efecto visual al pasar el cursor. Si la dejas vacía, se mostrará el ícono.
            </p>

            <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div v-if="transportCardForm.imageUrl" class="rounded-3 border border-secondary border-opacity-25 overflow-hidden flex-shrink-0 position-relative" style="width: 140px; height: 90px;">
                <img :src="transportCardForm.imageUrl" class="w-100 h-100 object-fit-cover" alt="Vista previa">
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-0 px-1" @click="removeTransportImage" title="Quitar imagen">
                  <i class="bi bi-x"></i>
                </button>
              </div>
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleTransportImageUpload">
                <input v-model="transportCardForm.imageUrl" type="text" class="form-control admin-input text-white" placeholder="O pega una URL externa de imagen (https://...)">
              </div>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-1">Descripción del Servicio *</label>
            <textarea v-model="transportCardForm.description" rows="3" class="form-control admin-input text-white" required placeholder="Describe qué incluye el servicio, destinos cubiertos, tipo de vehículos y comodidades..."></textarea>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-1">Puntos Clave / Características (Un ítem por línea)</label>
            <textarea v-model="transportFeaturesText" rows="4" class="form-control admin-input text-white font-monospace" placeholder="Monitoreo de vuelo en tiempo real&#10;Recepción personalizada con letrero&#10;Asistencia completa con equipaje"></textarea>
            <span class="small text-white-50 mt-1 d-block" style="font-size: 0.72rem;">Cada línea se renderizará como un ítem con ícono de verificación.</span>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-white mb-1">Texto del Botón</label>
            <input v-model="transportCardForm.buttonText" type="text" class="form-control admin-input text-white" placeholder="Ej: Cotizar Traslado">
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-white mb-1">Estilo Visual del Botón</label>
            <select v-model="transportCardForm.buttonStyle" class="form-select admin-input text-white">
              <option value="outline">Delineado (Outline)</option>
              <option value="solid">Sólido Beige (Destacado)</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-white mb-1">Etiqueta de WhatsApp (Opcional)</label>
            <input v-model="transportCardForm.whatsAppTag" type="text" class="form-control admin-input text-white" placeholder="Ej: Traslado Aeropuerto">
          </div>

          <div class="col-12 d-flex justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-25 mt-3">
            <button type="button" class="btn btn-outline-light px-4 py-2 fw-semibold" @click="showTransportModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-accent px-4 py-2 fw-bold text-dark-mountain shadow">
              <i class="bi bi-check2-circle me-1"></i> Guardar Servicio
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL EDITAR ADVISOR / EQUIPO -->
    <div v-if="showAdvisorModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 600px; max-height: 85vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-people-fill me-2 text-accent"></i>
            {{ advisorMode === 'add' ? 'Añadir Integrante / Asesor' : 'Editar Integrante / Asesor' }}
          </h3>
          <button class="btn-close btn-close-white" @click="showAdvisorModal = false"></button>
        </div>

        <form @submit.prevent="saveAdvisorForm" class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Nombre Completo</label>
            <input v-model="advisorForm.name" type="text" class="form-control admin-input text-white" required placeholder="Ej: Camilo Tamayo">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Cargo / Rol</label>
            <input v-model="advisorForm.role" type="text" class="form-control admin-input text-white" required placeholder="Ej: Director de Operaciones">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-2">Fotografía (Sube una foto o pega una URL)</label>
            <div class="d-flex gap-3 align-items-center">
              <img v-if="advisorForm.image" :src="advisorForm.image" class="rounded-circle object-fit-cover flex-shrink-0 shadow" style="width: 70px; height: 70px; border: 2px solid #E7DCC3;" alt="Vista previa">
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleAdvisorImageUpload">
                <input v-model="advisorForm.image" type="text" class="form-control form-control-sm admin-input text-white" placeholder="O URL de imagen...">
              </div>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Resumen Biográfico / Bio</label>
            <textarea v-model="advisorForm.bio" class="form-control admin-input text-white" rows="3" required placeholder="Escribe una reseña corta del perfil profesional..."></textarea>
          </div>

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showAdvisorModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain">Guardar Integrante</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR TOUR (EXP) -->
    <div v-if="showExpModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 800px; max-height: 90vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-compass-fill me-2 text-accent"></i>
            {{ modalMode === 'add' ? 'Añadir Nuevo Tour al Catálogo' : 'Editar Tour del Catálogo' }}
          </h3>
          <button class="btn-close btn-close-white" @click="showExpModal = false"></button>
        </div>

        <form @submit.prevent="saveExperience" class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Título de la Experiencia</label>
            <input v-model="expForm.title" type="text" class="form-control admin-input text-white" required placeholder="Ej: Ascenso al Volcán Villarrica">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Subtítulo Corto</label>
            <input v-model="expForm.subtitle" type="text" class="form-control admin-input text-white" placeholder="Ej: Desafío extremo en la nieve">
          </div>
          
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Ubicación / Destino</label>
            <input v-model="expForm.destinationId" type="text" class="form-control admin-input text-white" required placeholder="Ej: Pucón">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Dificultad</label>
            <select v-model="expForm.difficulty" class="form-select admin-input text-white">
              <option value="easy">Fácil</option>
              <option value="moderate">Moderada</option>
              <option value="hard">Difícil</option>
              <option value="expert">Experto</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Precio Base (CLP)</label>
            <input v-model="expForm.basePrice" type="number" class="form-control admin-input text-white" required>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Horario</label>
            <input v-model="expForm.schedule" type="text" class="form-control admin-input text-white" placeholder="08:00 - 15:00">
          </div>

          <!-- Idiomas en que se realiza el Tour -->
          <div class="col-12">
            <label class="form-label small fw-bold text-white d-flex align-items-center justify-content-between mb-2">
              <span class="d-flex align-items-center gap-1.5">
                <i class="bi bi-translate text-accent"></i>
                <span>Idiomas del Tour (en qué idioma se realiza el guiado)</span>
              </span>
              <span class="badge bg-dark border border-secondary border-opacity-50 text-accent font-monospace" style="font-size: 0.75rem;">
                {{ formatLanguages(expForm.languages) }}
              </span>
            </label>
            
            <div class="p-3 rounded-4 admin-sub-card">
              <span class="small text-white opacity-85 d-block mb-2 fw-semibold" style="font-size: 0.78rem;">
                Selecciona uno o más idiomas disponibles para este guiado:
              </span>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <button 
                  v-for="lang in availableLanguageOptions" 
                  :key="lang.id"
                  type="button" 
                  class="btn btn-sm d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 transition-all"
                  :class="isLanguageSelected(lang.id) ? 'btn-accent text-dark-mountain fw-bold shadow-sm' : 'btn-outline-secondary text-white'"
                  @click="toggleLanguage(lang.id)"
                >
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.label }}</span>
                  <i v-if="isLanguageSelected(lang.id)" class="bi bi-check2 ms-1"></i>
                </button>
              </div>

              <!-- Agregar otro idioma personalizado -->
              <div class="row g-2 align-items-center">
                <div class="col-12 col-sm-8">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-dark border-secondary border-opacity-25 text-white">
                      <i class="bi bi-globe"></i>
                    </span>
                    <input 
                      v-model="expForm.customLanguageInput" 
                      type="text" 
                      class="form-control admin-input text-white" 
                      placeholder="Escribe otro idioma (ej: Italiano, Chino) y pulsa Añadir..."
                      @keyup.enter.prevent="addCustomLanguage"
                    >
                    <button 
                      type="button" 
                      class="btn btn-sm btn-accent fw-bold text-dark-mountain px-3"
                      @click="addCustomLanguage"
                    >
                      <i class="bi bi-plus-lg me-1"></i>Añadir Idioma
                    </button>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <span class="small text-white opacity-75" style="font-size: 0.75rem;">
                    Se reflejará en la ficha del tour y reserva.
                  </span>
                </div>
              </div>

              <!-- Idiomas seleccionados actualmente -->
              <div v-if="expForm.languages && expForm.languages.length > 0" class="d-flex flex-wrap gap-1.5 mt-2 pt-2 border-top border-secondary border-opacity-25 align-items-center">
                <span class="small text-white opacity-75 me-2" style="font-size: 0.75rem;">Idiomas activos:</span>
                <span 
                  v-for="(l, idx) in expForm.languages" 
                  :key="idx"
                  class="badge bg-secondary bg-opacity-50 text-white border border-secondary border-opacity-50 d-inline-flex align-items-center gap-1.5 px-2.5 py-1"
                  style="font-size: 0.75rem;"
                >
                  {{ l }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-white p-0" 
                    style="width: 10px; height: 10px; font-size: 0.55rem;"
                    @click="removeLanguage(idx)"
                    title="Quitar idioma"
                  ></button>
                </span>
              </div>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-2">Imagen de Portada (Archivo local o URL)</label>
            <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div v-if="isUploadingCover" class="rounded-3 border border-secondary border-opacity-25 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 flex-shrink-0" style="width: 100px; height: 100px;">
                <div class="spinner-border spinner-border-sm text-accent" role="status"></div>
              </div>
              <div v-else-if="expForm.coverImageUrl" class="rounded-3 border border-secondary border-opacity-25 overflow-hidden flex-shrink-0" style="width: 100px; height: 100px;">
                <img :src="expForm.coverImageUrl" class="w-100 h-100 object-fit-cover" alt="Vista previa">
              </div>
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleImageUpload">
                <input v-model="expForm.coverImageUrl" type="text" class="form-control admin-input text-white" placeholder="URL de la imagen...">
              </div>
            </div>
          </div>

          <!-- Imagen de Fondo de Cabecera (Banner del Tour) -->
          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-2 d-flex justify-content-between align-items-center">
              <span><i class="bi bi-aspect-ratio me-1 text-accent"></i>Imagen de Fondo de Cabecera (Banner del Título) - Opcional</span>
              <span class="badge bg-secondary text-white" style="font-size: 0.72rem;">Panorámica HD</span>
            </label>
            <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div v-if="isUploadingHero" class="rounded-3 border border-secondary border-opacity-25 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 flex-shrink-0" style="width: 140px; height: 75px;">
                <div class="spinner-border spinner-border-sm text-accent" role="status"></div>
              </div>
              <div v-else-if="expForm.heroBannerUrl" class="rounded-3 border border-secondary border-opacity-25 overflow-hidden flex-shrink-0" style="width: 140px; height: 75px;">
                <img :src="expForm.heroBannerUrl" class="w-100 h-100 object-fit-cover" alt="Vista previa Banner">
              </div>
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleHeroBannerUpload">
                <input v-model="expForm.heroBannerUrl" type="text" class="form-control admin-input text-white" placeholder="O pega una URL directa del banner panorámico...">
                <span class="small text-white opacity-75 d-block mt-1" style="font-size: 0.75rem;">
                  Esta imagen se mostrará en alta resolución detrás del título y subtítulo centrado. Si se deja vacía, se usará la imagen de portada.
                </span>
              </div>
            </div>
          </div>

          <!-- Galería de Fotos Adicionales -->
          <div class="col-12">
            <div class="p-3 rounded-4 admin-sub-card">
              <label class="form-label small fw-bold text-white mb-2 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-images me-2 text-accent"></i>Galería de Fotos Adicionales (Imágenes secundarias del tour)</span>
                <span class="badge bg-accent text-dark-mountain fw-bold">{{ expForm.galleryUrls.length }} fotos</span>
              </label>

              <!-- Subir múltiples fotos locales o agregar URL -->
              <div v-if="isUploadingGallery" class="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-2">
                <span class="spinner-border spinner-border-sm" role="status"></span>
                <span>Subiendo y optimizando fotografías para la galería...</span>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-12 col-sm-6">
                  <input type="file" multiple class="form-control form-control-sm admin-input text-white" accept="image/*" @change="handleMultipleGalleryUpload">
                  <span class="small text-white opacity-75" style="font-size: 0.75rem;">Selecciona una o varias imágenes locales (máx 2MB c/u)</span>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="input-group input-group-sm">
                    <input v-model="expForm.galleryUrlInput" type="text" class="form-control admin-input text-white" placeholder="O pega una URL de foto..." @keyup.enter.prevent="addGalleryUrl">
                    <button class="btn btn-accent fw-bold text-dark-mountain" type="button" @click="addGalleryUrl">
                      <i class="bi bi-plus-circle-fill me-1"></i>Añadir
                    </button>
                  </div>
                </div>
              </div>

              <!-- Thumbnails Grid de la Galería -->
              <div v-if="expForm.galleryUrls.length > 0" class="d-flex flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
                <div v-for="(imgUrl, idx) in expForm.galleryUrls" :key="idx" class="position-relative rounded-3 overflow-hidden border border-secondary border-opacity-25 shadow-sm" style="width: 85px; height: 85px;">
                  <img :src="imgUrl" class="w-100 h-100 object-fit-cover" :alt="'Foto ' + (idx + 1)">
                  <button 
                    type="button"
                    class="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 22px; height: 22px; font-size: 0.75rem; opacity: 0.95;"
                    @click="removeGalleryImage(idx)"
                    title="Eliminar foto de la galería"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-3 text-white opacity-75 small">
                <i class="bi bi-image fs-4 d-block mb-1 text-accent"></i>
                Aún no hay fotos adicionales. Sube varias imágenes o agrega URLs para enriquecer la galería del tour.
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Etiquetas (separadas por coma)</label>
            <input v-model="expForm.tags" type="text" class="form-control admin-input text-white" placeholder="Montaña, Nieve, Volcán">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Categorías (separadas por coma)</label>
            <input v-model="expForm.categories" type="text" class="form-control admin-input text-white" placeholder="Aventura, Ecoturismo">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Punto de Encuentro</label>
            <input v-model="expForm.meetingPoint" type="text" class="form-control admin-input text-white">
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-white">Políticas de Cancelación</label>
            <input v-model="expForm.cancellationPolicy" type="text" class="form-control admin-input text-white">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Resumen Corto</label>
            <input v-model="expForm.summary" type="text" class="form-control admin-input text-white" required max="140">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Descripción Completa</label>
            <textarea v-model="expForm.description" class="form-control admin-input text-white" rows="4" required></textarea>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Itinerario (`HH:MM - Título - Descripción`)</label>
            <textarea v-model="expForm.itineraryRaw" class="form-control admin-input text-white text-monospace" rows="5"></textarea>
          </div>

          <!-- Qué Incluye y Qué No Incluye -->
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white d-flex align-items-center gap-1">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>Qué Incluye el Tour (un ítem por línea)</span>
            </label>
            <textarea 
              v-model="expForm.includedRaw" 
              class="form-control admin-input text-white" 
              rows="4" 
              placeholder="Guía certificado&#10;Seguro de accidentes&#10;Equipo técnico completo&#10;Transporte ida y vuelta"
            ></textarea>
            <span class="small text-white opacity-75 d-block mt-1" style="font-size: 0.75rem;">Aparecerá en la sección 'Qué incluye' con check verde.</span>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white d-flex align-items-center gap-1">
              <i class="bi bi-x-circle-fill text-danger"></i>
              <span>Qué NO Incluye el Tour (un ítem por línea)</span>
            </label>
            <textarea 
              v-model="expForm.notIncludedRaw" 
              class="form-control admin-input text-white" 
              rows="4" 
              placeholder="Propinas voluntarias&#10;Gastos personales&#10;Alimentación no descrita"
            ></textarea>
            <span class="small text-white opacity-75 d-block mt-1" style="font-size: 0.75rem;">Aparecerá en la sección 'Qué no incluye' con cruz roja.</span>
          </div>

          <!-- Garantías Oficiales del Tour (Personalizables) -->
          <div class="col-12">
            <label class="form-label small fw-bold text-white d-flex align-items-center justify-content-between">
              <span class="d-flex align-items-center gap-1">
                <i class="bi bi-shield-check text-accent"></i>
                <span>Garantías Oficiales del Tour (un ítem por línea)</span>
              </span>
              <span class="badge bg-accent text-dark-mountain fw-bold" style="font-size: 0.72rem;">Sellos Oficiales</span>
            </label>
            <textarea 
              v-model="expForm.guaranteesRaw" 
              class="form-control admin-input text-white" 
              rows="4" 
              placeholder="Prestador SERNATUR: Registro Oficial de Turismo N° 84219&#10;Seguro Incluido: Cobertura de rescate y asistencia en montaña&#10;Garantía Climática: Reprogramación 100% garantizada por clima&#10;Pago Cifrado: Transbank Webpay Plus estándar internacional PCI-DSS"
            ></textarea>
            <span class="small text-white opacity-75 d-block mt-1" style="font-size: 0.75rem;">
              Aparecerán en el bloque oficial de garantías en la página de reserva del tour. Formato recomendado: <code>Título: Detalle</code>.
            </span>
          </div>

          <div class="col-12" v-if="modalMode === 'edit' && editingExpId">
            <div class="p-2 px-3 rounded-3 admin-sub-card d-flex align-items-center justify-content-between">
              <span class="small text-white opacity-85">
                <i class="bi bi-link-45deg text-accent me-1"></i>Enlace oficial del tour:
                <code class="text-accent ms-1">/experiencias/{{ contentStore.experiences.find(e => e.id === editingExpId)?.slug }}</code>
              </span>
              <a :href="'/experiencias/' + contentStore.experiences.find(e => e.id === editingExpId)?.slug" target="_blank" class="btn btn-sm btn-outline-accent py-1 px-3 fw-semibold" style="font-size: 0.75rem;">
                <i class="bi bi-box-arrow-up-right me-1"></i>Ver en vivo
              </a>
            </div>
          </div>

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" :disabled="isSavingExp" @click="showExpModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain d-inline-flex align-items-center gap-2" :disabled="isSavingExp || isUploadingCover || isUploadingHero || isUploadingGallery">
              <span v-if="isSavingExp" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-check2-circle"></i>
              <span>{{ isSavingExp ? 'Guardando en la nube...' : 'Guardar Tour' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL CRM VENTA MANUAL -->
    <div v-if="showCrmModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 600px; max-height: 85vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-cart-plus-fill me-2 text-accent"></i>Registrar Venta / Reserva Manual
          </h3>
          <button class="btn-close btn-close-white" @click="showCrmModal = false"></button>
        </div>

        <form @submit.prevent="saveBooking" class="row g-3">
          <div class="col-md-7">
            <label class="form-label small fw-bold text-white">Nombre Completo del Cliente *</label>
            <input v-model="crmForm.customerName" type="text" class="form-control admin-input text-white" required placeholder="Nombre y Apellido">
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-bold text-white">RUT / Pasaporte *</label>
            <input v-model="crmForm.customerRut" type="text" class="form-control admin-input text-white" required placeholder="12.345.678-9 o Pasaporte">
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Correo Electrónico *</label>
            <input v-model="crmForm.customerEmail" type="email" class="form-control admin-input text-white" required placeholder="correo@ejemplo.com">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Teléfono de Contacto *</label>
            <input v-model="crmForm.customerPhone" type="text" class="form-control admin-input text-white" required placeholder="+56 9 1234 5678">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Experiencia / Tour Reservado</label>
            <select v-model="crmForm.experienceTitle" class="form-select admin-input text-white" required>
              <option v-for="exp in contentStore.experiences" :key="exp.id" :value="exp.title">
                {{ exp.title }} (${{ exp.pricing.basePrice.toLocaleString('es-CL') }})
              </option>
              <option value="Tour Personalizado / A Medida">Tour Personalizado / A Medida</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Fecha del Servicio</label>
            <input v-model="crmForm.bookingDate" type="date" class="form-control admin-input text-white" required>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-white">N° Pasajeros</label>
            <input v-model="crmForm.pax" type="number" class="form-control admin-input text-white" required min="1">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-white">Monto Total (CLP)</label>
            <input v-model="crmForm.totalPrice" type="number" class="form-control admin-input text-white" required>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Método de Pago</label>
            <select v-model="crmForm.paymentMethod" class="form-select admin-input text-white">
              <option value="manual">Manual / Presencial en Oficina</option>
              <option value="transfer">Transferencia Bancaria Directa</option>
              <option value="cash">Efectivo en Destino</option>
              <option value="webpay">Webpay Plus (POS / Enlace)</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Estado Inicial</label>
            <select v-model="crmForm.status" class="form-select admin-input text-white">
              <option value="confirmed">Confirmado (Pagado)</option>
              <option value="pending">Pendiente de Pago</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white">Notas u Observaciones del Cliente</label>
            <textarea v-model="crmForm.notes" class="form-control admin-input text-white" rows="2" placeholder="Requerimientos, restricciones médicas, abono 50%, etc."></textarea>
          </div>

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showCrmModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain">Registrar Reserva</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR DESCUENTO (PROMOCIÓN) -->
    <div v-if="showDiscountModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 500px; max-height: 85vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-ticket-perforated me-2 text-accent"></i>{{ discountMode === 'add' ? 'Nuevo Código de Descuento' : 'Editar Código' }}
          </h3>
          <button class="btn-close btn-close-white" @click="showDiscountModal = false"></button>
        </div>

        <form @submit.prevent="saveDiscount" class="row g-3">
          <div class="col-12">
            <label class="form-label small fw-bold text-white">Código (ej: VERANO20)</label>
            <input v-model="discountForm.code" type="text" class="form-control admin-input text-white text-uppercase" required>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Tipo de Descuento</label>
            <select v-model="discountForm.type" class="form-select admin-input text-white" required>
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed_amount">Monto Fijo ($)</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-white">Valor</label>
            <input v-model="discountForm.value" type="number" class="form-control admin-input text-white" required min="1">
          </div>
          <div class="col-12 mt-3">
            <div class="form-check form-switch">
              <input v-model="discountForm.isActive" class="form-check-input" type="checkbox" id="discountStatusSwitch">
              <label class="form-check-label text-white ms-2" for="discountStatusSwitch">
                Código Activo (puede usarse en el carrito)
              </label>
            </div>
          </div>
          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showDiscountModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain">Guardar Código</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL GESTIONAR PAQUETE DE TOURS -->
    <div v-if="showPackageModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click.self="showPackageModal = false">
      <div class="modal-card p-4 p-md-5 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 860px; max-height: 90vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <h3 class="h5 fw-bold text-white mb-1">
              <i class="bi bi-box-seam me-2 text-accent"></i>
              {{ packageMode === 'add' ? 'Crear Nuevo Paquete de Tours' : 'Editar Paquete' }}
            </h3>
            <p class="small text-white opacity-75 mb-0">Combina experiencias del catálogo con descuentos atractivos para tus clientes.</p>
          </div>
          <button class="btn-close btn-close-white" @click="showPackageModal = false" aria-label="Cerrar"></button>
        </div>

        <form @submit.prevent="savePackage" class="row g-4">
          
          <!-- DATOS GENERALES -->
          <div class="col-md-8">
            <label class="form-label small fw-bold text-white mb-1">Título del Paquete *</label>
            <input v-model="packageForm.title" type="text" class="form-control admin-input text-white fw-bold" required placeholder="Ej: Pack Volcanes & Aguas Termales">
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-bold text-white mb-1">Badge / Etiqueta Promocional</label>
            <input v-model="packageForm.badgeText" type="text" class="form-control admin-input text-white" placeholder="Ej: Ahorra 15%, Más Vendido">
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-1">Descripción Atractiva *</label>
            <textarea v-model="packageForm.description" class="form-control admin-input text-white" rows="2" required placeholder="Describe las ventajas de reservar este combo multitour..."></textarea>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-1">URL Foto de Portada *</label>
            <div class="d-flex gap-3 align-items-center">
              <input v-model="packageForm.imageUrl" type="url" class="form-control admin-input text-white flex-grow-1" required placeholder="https://images.unsplash.com/...">
              <div v-if="packageForm.imageUrl" class="flex-shrink-0 rounded-3 overflow-hidden border border-secondary border-opacity-50" style="width: 70px; height: 50px;">
                <img :src="packageForm.imageUrl" alt="Preview" class="w-100 h-100 object-fit-cover">
              </div>
            </div>
          </div>

          <!-- SELECTOR VISUAL DE TOURS DEL CATÁLOGO -->
          <div class="col-12 border-top border-secondary border-opacity-25 pt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label small fw-bold text-white mb-0">
                <i class="bi bi-compass me-1 text-accent"></i>
                Selecciona los Tours que Incluye este Paquete ({{ packageForm.includedTourIds.length }} seleccionados):
              </label>
              <span class="badge bg-accent text-dark-mountain fw-bold">
                Mínimo 1 tour
              </span>
            </div>
            <p class="small text-white opacity-75 mb-3" style="font-size: 0.8rem;">
              Haz clic en cualquier tour para agregarlo o quitarlo del combo. El precio total se recalculará automáticamente.
            </p>

            <!-- Grid de selección de tours -->
            <div class="row g-2 overflow-y-auto custom-scrollbar p-1" style="max-height: 280px; border-radius: 12px; background: rgba(2, 44, 42, 0.4); border: 1px solid rgba(45, 212, 191, 0.2);">
              <div 
                v-for="exp in contentStore.experiences" 
                :key="exp.id" 
                class="col-md-6"
              >
                <div 
                  class="p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all"
                  :style="{
                    background: packageForm.includedTourIds.includes(exp.id) ? 'rgba(231, 220, 195, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderColor: packageForm.includedTourIds.includes(exp.id) ? '#E7DCC3' : 'rgba(255, 255, 255, 0.1)'
                  }"
                  @click="toggleTourSelection(exp.id)"
                >
                  <!-- Checkbox interactivo -->
                  <div class="form-check m-0 ms-1">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :checked="packageForm.includedTourIds.includes(exp.id)"
                      @click.stop="toggleTourSelection(exp.id)"
                    >
                  </div>
                  
                  <!-- Thumbnail -->
                  <img :src="exp.coverImage.url" alt="Thumb" class="rounded-2 object-fit-cover flex-shrink-0" style="width: 45px; height: 45px;">

                  <!-- Datos -->
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-bold text-white small text-truncate">{{ exp.title }}</div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                      <span class="small text-white opacity-75" style="font-size: 0.72rem;">{{ exp.destinationId }}</span>
                      <span class="small fw-bold text-accent" style="font-size: 0.75rem;">{{ formatPrice(exp.pricing.basePrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="packageForm.includedTourIds.length === 0" class="text-warning small mt-2">
              <i class="bi bi-exclamation-circle me-1"></i> Debes marcar al menos un tour para calcular el precio del paquete.
            </div>
          </div>

          <!-- ESTRATEGIA DE PRECIOS & DESCUENTOS -->
          <div class="col-12 p-3 rounded-4" style="background: rgba(3, 62, 59, 0.9); border: 1px solid rgba(45, 212, 191, 0.35);">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <h5 class="h6 fw-bold text-white mb-0">
                <i class="bi bi-calculator me-1 text-accent"></i> Estrategia de Precio & Descuento
              </h5>
              
              <!-- Selector de Modo de Descuento -->
              <div class="btn-group btn-group-sm mt-2 mt-sm-0" role="group">
                <button 
                  type="button" 
                  class="btn"
                  :class="packageForm.pricingType === 'percentage' ? 'btn-accent fw-bold text-dark-mountain' : 'btn-outline-light'"
                  @click="packageForm.pricingType = 'percentage'"
                >
                  % Porcentaje
                </button>
                <button 
                  type="button" 
                  class="btn"
                  :class="packageForm.pricingType === 'fixed_discount' ? 'btn-accent fw-bold text-dark-mountain' : 'btn-outline-light'"
                  @click="packageForm.pricingType = 'fixed_discount'"
                >
                  $ Monto Descuento
                </button>
                <button 
                  type="button" 
                  class="btn"
                  :class="packageForm.pricingType === 'manual' ? 'btn-accent fw-bold text-dark-mountain' : 'btn-outline-light'"
                  @click="packageForm.pricingType = 'manual'"
                >
                  Precio Manual
                </button>
              </div>
            </div>

            <!-- Inputs según el modo -->
            <div class="row g-3 align-items-center mb-3">
              <div v-if="packageForm.pricingType === 'percentage'" class="col-md-6">
                <label class="form-label small text-white fw-bold mb-1">Porcentaje de Descuento al Combo (%)</label>
                <div class="input-group">
                  <input v-model.number="packageForm.discountPercentage" type="number" min="1" max="95" class="form-control admin-input text-white fw-bold" required>
                  <span class="input-group-text admin-input text-white border-start-0">% OFF</span>
                </div>
              </div>

              <div v-else-if="packageForm.pricingType === 'fixed_discount'" class="col-md-6">
                <label class="form-label small text-white fw-bold mb-1">Monto de Descuento ($)</label>
                <div class="input-group">
                  <span class="input-group-text admin-input text-white border-end-0">$</span>
                  <input v-model.number="packageForm.fixedDiscountAmount" type="number" min="1000" step="1000" class="form-control admin-input text-white fw-bold ps-0" required>
                </div>
              </div>

              <div v-else class="col-md-6">
                <label class="form-label small text-white fw-bold mb-1">Precio Final del Combo ($)</label>
                <div class="input-group">
                  <span class="input-group-text admin-input text-white border-end-0">$</span>
                  <input v-model.number="packageForm.manualBundlePrice" type="number" min="1000" step="1000" class="form-control admin-input text-white fw-bold ps-0" required>
                </div>
              </div>

              <!-- RESUMEN FINANCIERO EN VIVO -->
              <div class="col-md-6">
                <div class="p-3 rounded-3" style="background: rgba(2, 44, 42, 0.8); border: 1px solid rgba(45, 212, 191, 0.2);">
                  <div class="d-flex justify-content-between text-white small opacity-75 mb-1">
                    <span>Suma original ({{ packageForm.includedTourIds.length }} tours):</span>
                    <span class="text-decoration-line-through">{{ formatPrice(calculatedOriginalPrice) }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-success small mb-1">
                    <span>Descuento aplicado:</span>
                    <span class="fw-bold">-{{ formatPrice(calculatedSavings) }} ({{ calculatedEffectivePercentage }}%)</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-baseline pt-2 border-top border-secondary border-opacity-25">
                    <span class="fw-bold text-white small">Precio Oferta:</span>
                    <span class="fs-4 fw-bold text-accent">{{ formatPrice(calculatedBundlePrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SWITCH ESTADO -->
          <div class="col-12">
            <div class="form-check form-switch">
              <input v-model="packageForm.isActive" class="form-check-input" type="checkbox" id="packageStatusSwitch">
              <label class="form-check-label text-white ms-2" for="packageStatusSwitch">
                <strong>Publicar Paquete:</strong> Mostrarlo inmediatamente en el carrusel de la página de inicio
              </label>
            </div>
          </div>

          <!-- BOTONES DE ACCIÓN -->
          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showPackageModal = false">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-accent px-5 fw-bold text-dark-mountain shadow-sm"
              :disabled="packageForm.includedTourIds.length === 0"
            >
              <i class="bi bi-check-lg me-1"></i>
              {{ packageMode === 'add' ? 'Crear Paquete' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: FICHA DE RESERVA & NÓMINA DE PASAJEROS -->
    <div v-if="showBookingDetailsModal && selectedBookingForDetails" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click.self="showBookingDetailsModal = false">
      <div class="modal-card p-4 p-md-5 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 900px; max-height: 90vh; border-radius: 24px;">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3 gap-2">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 font-monospace">
                {{ selectedBookingForDetails.buyOrder || selectedBookingForDetails.id }}
              </span>
              <span 
                class="badge px-3 py-1 text-uppercase fw-bold"
                :class="{
                  'bg-warning text-dark': selectedBookingForDetails.status === 'pending',
                  'bg-success text-white': selectedBookingForDetails.status === 'confirmed',
                  'bg-danger text-white': selectedBookingForDetails.status === 'cancelled'
                }"
              >
                {{ selectedBookingForDetails.status === 'confirmed' ? 'Confirmada / Pagada' : selectedBookingForDetails.status === 'pending' ? 'Pendiente' : 'Cancelada' }}
              </span>
            </div>
            <h3 class="h4 fw-bold text-white mb-0 font-serif">
              {{ selectedBookingForDetails.experienceTitle }}
            </h3>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-accent" @click="copyManifestToClipboard" title="Copiar nómina al portapapeles">
              <i class="bi bi-clipboard-check me-1"></i> Copiar Nómina
            </button>
            <button class="btn-close btn-close-white" @click="showBookingDetailsModal = false" aria-label="Cerrar"></button>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <!-- Tarjeta Titular / Contacto -->
          <div class="col-md-6">
            <div class="p-3 rounded-4 h-100" style="background: rgba(2, 44, 42, 0.6); border: 1px solid rgba(45, 212, 191, 0.25);">
              <h5 class="small fw-bold text-accent text-uppercase mb-3 tracking-wider">
                <i class="bi bi-person-badge me-1"></i> Datos del Titular / Comprador
              </h5>
              <div class="mb-2">
                <span class="text-white opacity-75 small d-block">Nombre Completo:</span>
                <span class="fw-bold text-white">{{ selectedBookingForDetails.customerName }}</span>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">RUT / Documento:</span>
                  <span class="fw-semibold text-white">{{ selectedBookingForDetails.customerRut || 'N/A' }}</span>
                </div>
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">Teléfono / WhatsApp:</span>
                  <a 
                    v-if="selectedBookingForDetails.customerPhone" 
                    :href="'https://wa.me/' + selectedBookingForDetails.customerPhone.replace(/[^0-9]/g, '')" 
                    target="_blank" 
                    class="text-accent text-decoration-none fw-semibold"
                  >
                    <i class="bi bi-whatsapp me-1 text-success"></i>{{ selectedBookingForDetails.customerPhone }}
                  </a>
                  <span v-else class="text-white">N/A</span>
                </div>
              </div>
              <div>
                <span class="text-white opacity-75 small d-block">Correo Electrónico:</span>
                <a :href="'mailto:' + selectedBookingForDetails.customerEmail" class="text-white-50 text-decoration-none">
                  {{ selectedBookingForDetails.customerEmail || 'N/A' }}
                </a>
              </div>
            </div>
          </div>

          <!-- Tarjeta Detalles de Expedición & Pago -->
          <div class="col-md-6">
            <div class="p-3 rounded-4 h-100" style="background: rgba(2, 44, 42, 0.6); border: 1px solid rgba(45, 212, 191, 0.25);">
              <h5 class="small fw-bold text-accent text-uppercase mb-3 tracking-wider">
                <i class="bi bi-credit-card-2-front me-1"></i> Detalles de la Reserva & Pago
              </h5>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">Fecha Salida:</span>
                  <span class="fw-bold text-white">{{ selectedBookingForDetails.bookingDate }}</span>
                </div>
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">Pasajeros:</span>
                  <span class="badge bg-dark text-accent border border-accent border-opacity-25 px-2 py-1">
                    <i class="bi bi-people-fill me-1"></i>{{ selectedBookingForDetails.pax }} PAX
                  </span>
                </div>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">Método de Pago:</span>
                  <span v-if="selectedBookingForDetails.paymentMethod === 'webpay'" class="badge bg-danger text-white">
                    <i class="bi bi-credit-card me-1"></i>Transbank Webpay
                  </span>
                  <span v-else-if="selectedBookingForDetails.paymentMethod === 'whatsapp' || selectedBookingForDetails.source === 'whatsapp'" class="badge bg-success text-white">
                    <i class="bi bi-whatsapp me-1"></i>Venta WhatsApp
                  </span>
                  <span v-else-if="selectedBookingForDetails.paymentMethod === 'transfer'" class="badge bg-info text-dark">
                    <i class="bi bi-bank me-1"></i>Transferencia
                  </span>
                  <span v-else class="badge bg-secondary text-white">
                    <i class="bi bi-wallet2 me-1"></i>Manual
                  </span>
                </div>
                <div class="col-6">
                  <span class="text-white opacity-75 small d-block">Monto Total:</span>
                  <span class="fs-5 fw-bold text-accent">{{ formatPrice(selectedBookingForDetails.totalPrice || 0) }}</span>
                </div>
              </div>
              <div v-if="selectedBookingForDetails.authorizationCode" class="small text-white-50">
                <i class="bi bi-shield-check text-accent me-1"></i>Cod. Autorización: <strong class="text-white">{{ selectedBookingForDetails.authorizationCode }}</strong>
                <span v-if="selectedBookingForDetails.cardLast4"> (Tarjeta: **** {{ selectedBookingForDetails.cardLast4 }})</span>
              </div>
              <div v-if="selectedBookingForDetails.notes" class="mt-2 pt-2 border-top border-secondary border-opacity-25 small">
                <span class="text-white opacity-75 d-block">Notas:</span>
                <span class="text-white fst-italic">{{ selectedBookingForDetails.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nómina Completa de Pasajeros -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="h6 fw-bold text-white mb-0 text-uppercase tracking-wider">
              <i class="bi bi-person-lines-fill text-accent me-2"></i>
              Nómina Completa de Pasajeros ({{ (selectedBookingForDetails.passengers && selectedBookingForDetails.passengers.length > 0) ? selectedBookingForDetails.passengers.length : selectedBookingForDetails.pax }} viajeros)
            </h5>
            <span class="badge bg-emerald text-white px-2 py-1 small">
              Registro Obligatorio SERNATUR / Guía
            </span>
          </div>

          <!-- Si existen pasajeros registrados detallados -->
          <div v-if="selectedBookingForDetails.passengers && selectedBookingForDetails.passengers.length > 0" class="table-responsive rounded-3 border border-secondary border-opacity-25">
            <table class="table table-dark table-hover mb-0 align-middle small">
              <thead style="background: rgba(4, 93, 86, 0.9);">
                <tr>
                  <th scope="col" style="width: 40px;" class="text-center">#</th>
                  <th scope="col">Nombre Pasajero</th>
                  <th scope="col">RUT / Pasaporte</th>
                  <th scope="col">Edad</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Contacto de Emergencia</th>
                  <th scope="col">Ficha Médica / Alergias</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pax, idx) in selectedBookingForDetails.passengers" :key="idx">
                  <td class="text-center fw-bold text-accent">{{ idx + 1 }}</td>
                  <td class="fw-bold text-white">
                    {{ pax.fullName || 'No especificado' }}
                    <span v-if="idx === 0" class="badge bg-primary text-white ms-1" style="font-size: 0.65rem;">Titular</span>
                  </td>
                  <td>
                    <span class="badge bg-dark text-white border border-secondary border-opacity-50 font-monospace">
                      {{ pax.documentNumber || pax.documentId || selectedBookingForDetails.customerRut || 'N/A' }}
                    </span>
                  </td>
                  <td>{{ pax.age ? `${pax.age} años` : '-' }}</td>
                  <td>
                    <span v-if="pax.phone">{{ pax.phone }}</span>
                    <span v-else-if="idx === 0">{{ selectedBookingForDetails.customerPhone }}</span>
                    <span v-else class="text-white-50">-</span>
                  </td>
                  <td>
                    <div v-if="pax.emergencyContactName || pax.emergencyContactPhone">
                      <span class="d-block fw-semibold text-white">{{ pax.emergencyContactName || 'Contacto' }}</span>
                      <small class="text-accent">{{ pax.emergencyContactPhone }}</small>
                    </div>
                    <span v-else class="text-white-50">-</span>
                  </td>
                  <td>
                    <span v-if="pax.medicalConditions" class="badge bg-warning text-dark text-wrap text-start">
                      <i class="bi bi-heart-pulse-fill me-1"></i>{{ pax.medicalConditions }}
                    </span>
                    <span v-else class="text-success small"><i class="bi bi-check-circle me-1"></i>Ninguna</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Si es una venta rápida donde solo se tiene al titular -->
          <div v-else class="p-4 rounded-3 text-center" style="background: rgba(2, 44, 42, 0.4); border: 1px dashed rgba(45, 212, 191, 0.3);">
            <i class="bi bi-info-circle fs-3 text-accent mb-2 d-block"></i>
            <p class="mb-2 text-white fw-semibold">
              Esta reserva fue generada inicialmente con los datos del Titular principal:
            </p>
            <p class="mb-3 text-accent font-monospace">
              {{ selectedBookingForDetails.customerName }} ({{ selectedBookingForDetails.customerRut || 'Sin RUT' }}) - {{ selectedBookingForDetails.customerPhone }}
            </p>
            <p class="small text-white opacity-75 mb-0">
              Total de cupos reservados: <strong>{{ selectedBookingForDetails.pax }} PAX</strong>. Si necesitas completar la nómina de acompañantes para el seguro de turismo aventura, puedes solicitarla por WhatsApp al titular.
            </p>
          </div>
        </div>

        <!-- Acciones en el Modal -->
        <div class="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 gap-3">
          <div class="d-flex align-items-center gap-2">
            <span class="small text-white opacity-75">Cambiar estado rápido:</span>
            <button 
              class="btn btn-sm btn-outline-warning" 
              :class="{ 'active fw-bold': selectedBookingForDetails.status === 'pending' }"
              @click="updateBookingStatus(selectedBookingForDetails.id, 'pending'); selectedBookingForDetails.status = 'pending'"
            >
              Pendiente
            </button>
            <button 
              class="btn btn-sm btn-outline-success" 
              :class="{ 'active fw-bold': selectedBookingForDetails.status === 'confirmed' }"
              @click="updateBookingStatus(selectedBookingForDetails.id, 'confirmed'); selectedBookingForDetails.status = 'confirmed'"
            >
              Confirmado
            </button>
            <button 
              class="btn btn-sm btn-outline-danger" 
              :class="{ 'active fw-bold': selectedBookingForDetails.status === 'cancelled' }"
              @click="updateBookingStatus(selectedBookingForDetails.id, 'cancelled'); selectedBookingForDetails.status = 'cancelled'"
            >
              Cancelado
            </button>
          </div>
          <div>
            <button type="button" class="btn btn-accent px-4 fw-bold text-dark-mountain" @click="showBookingDetailsModal = false">
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FLOATING TOAST NOTIFICATION -->
    <Transition name="slide-fade">
      <div v-if="showToast" class="admin-toast p-3 shadow-lg rounded-4 fw-bold d-flex align-items-center text-white">
        <i class="bi bi-check-circle-fill me-2 fs-5 text-accent"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.admin-container {
  padding-top: 30px;
  background-color: #83AAA8;
  min-height: 100vh;
}

/* Colores y Tokens Globales */
$dark-mountain: #147E79;
$dark-inner: #0D5B57;
$accent-turquoise: #E7DCC3;

.text-dark-mountain {
  color: #0D5B57 !important;
}

.text-accent {
  color: $accent-turquoise !important;
}

.text-amber {
  color: #FBBF24 !important;
}

.bg-accent {
  background-color: $accent-turquoise !important;
  color: #4C4C4C !important;
}

.btn-accent {
  background-color: $accent-turquoise !important;
  color: #4C4C4C !important;
  border: none;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: #FFFFFF !important;
    color: #147E79 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(231, 220, 195, 0.4);
  }
}

.btn-outline-accent {
  border: 1px solid $accent-turquoise;
  color: $accent-turquoise;
  background: transparent;
  transition: all 0.2s ease;

  &:hover {
    background-color: $accent-turquoise;
    color: #4C4C4C;
  }
}

/* Cards y Superficies */
.admin-header-card {
  background: linear-gradient(145deg, #147E79 0%, #0D5B57 100%);
  border: 1px solid rgba(231, 220, 195, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.admin-tabs-card {
  background-color: #147E79;
  border: 1px solid rgba(231, 220, 195, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.admin-module-card {
  background: linear-gradient(145deg, #147E79 0%, #0D5B57 100%);
  border: 1px solid rgba(231, 220, 195, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.admin-sub-card {
  background-color: #0D5B57;
  border: 1px solid rgba(231, 220, 195, 0.25);
}

.admin-kpi-card {
  background: linear-gradient(145deg, #147E79 0%, #0D5B57 100%);
  border: 1px solid rgba(231, 220, 195, 0.35);
}

/* Inputs & Form Controls */
.admin-input {
  background-color: #0D5B57 !important;
  border: 1px solid rgba(231, 220, 195, 0.3) !important;
  color: #FFFFFF !important;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  &:focus {
    background-color: #083E3B !important;
    border-color: $accent-turquoise !important;
    box-shadow: 0 0 0 0.25rem rgba(231, 220, 195, 0.25) !important;
    color: #FFFFFF !important;
  }
}

/* Tablas */
.admin-table {
  color: #FFFFFF;
  --bs-table-bg: transparent;
  --bs-table-color: #FFFFFF;
  --bs-table-border-color: rgba(231, 220, 195, 0.15);

  thead {
    background-color: #0D5B57;
    border-bottom: 2px solid rgba(231, 220, 195, 0.4);

    th {
      color: $accent-turquoise;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1rem 0.75rem;
    }
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(231, 220, 195, 0.08) !important;
    }

    td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid rgba(231, 220, 195, 0.15);
    }
  }
}

/* Badges */
.admin-pill-badge {
  background-color: #0D5B57;
  color: #FFFFFF;
  border: 1px solid rgba(231, 220, 195, 0.3);
}

.bg-emerald {
  background-color: #10B981 !important;
}

.bg-amber {
  background-color: #F59E0B !important;
}

.bg-rose {
  background-color: #EF4444 !important;
}

/* Tabs */
.nav-pills .nav-link {
  color: #FFFFFF;
  background-color: transparent;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
  transition: all 0.25s ease;
  
  &:hover {
    background-color: rgba(231, 220, 195, 0.15);
    color: $accent-turquoise;
  }
  
  &.active {
    color: #4C4C4C !important;
    background-color: $accent-turquoise !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 15px rgba(231, 220, 195, 0.4);
  }
}

/* Modales */
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1100;
}

.modal-card {
  background: linear-gradient(145deg, #147E79 0%, #0D5B57 100%);
  border: 1px solid rgba(231, 220, 195, 0.5);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

/* Toast */
.admin-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1200;
  min-width: 280px;
  background: #147E79;
  border: 1px solid $accent-turquoise;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.text-monospace {
  font-family: monospace;
}

.transition-all {
  transition: all 0.25s ease;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tracking-widest {
  letter-spacing: 0.2em;
}

.tracking-wide {
  letter-spacing: 0.08em;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

@media print {
  @page {
    size: letter portrait;
    margin: 8mm;
  }
  html, body {
    background: #FFFFFF !important;
    height: 100% !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body * {
    visibility: hidden !important;
  }
  #quote-preview-paper,
  #quote-preview-paper * {
    visibility: visible !important;
  }
  #quote-preview-paper {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: #FFFFFF !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }
}
</style>
