<script setup lang="ts">
import { ref, computed } from 'vue';
import { useContentStore, type ServiceItem, type Advisor } from '@/shared/stores/contentStore';
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
const activeTab = ref<'services' | 'cards-home' | 'content-home' | 'content-about' | 'advisors' | 'contact' | 'crm' | 'gateway'>('services');

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
  destinationId: 'Pucón',
  difficulty: 'easy' as 'easy' | 'moderate' | 'hard' | 'expert',
  basePrice: 50000,
  coverImageUrl: '',
  galleryUrls: [] as string[],
  galleryUrlInput: '',
  tags: '',
  categories: '',
  schedule: '',
  meetingPoint: 'Oficina Wamani, Centro de Pucón',
  cancellationPolicy: 'Cancelación gratuita con 48 hrs de anticipación.',
  itineraryRaw: ''
});

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

const handleMultipleGalleryUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      if (file.size > 2000000) {
        alert(`La imagen ${file.name} supera los 2MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          expForm.value.galleryUrls.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
    triggerToast('Imágenes añadidas a la galería.');
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
    destinationId: 'Pucón',
    difficulty: 'easy',
    basePrice: 50000,
    coverImageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    ],
    galleryUrlInput: '',
    tags: 'Montaña, Trekking',
    categories: 'Aventura',
    schedule: '08:00 - 16:00',
    meetingPoint: 'Oficina Wamani, Centro de Pucón',
    cancellationPolicy: 'Cancelación gratuita con 48 hrs de anticipación.',
    itineraryRaw: '08:00 - Salida - Inicio del traslado hacia el parque nacional.\n10:00 - Trekking - Inicio del sendero guiado.\n14:00 - Cumbre - Descanso y almuerzo en la cumbre.\n16:00 - Retorno - Regreso al centro de la ciudad.'
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
    galleryUrls: exp.gallery ? exp.gallery.map(g => g.url) : [],
    galleryUrlInput: '',
    tags: exp.tags.join(', '),
    categories: exp.categories.join(', '),
    schedule: exp.schedule || '',
    meetingPoint: exp.meetingPoint || 'Oficina Wamani, Centro de Pucón',
    cancellationPolicy: exp.cancellationPolicy || 'Cancelación gratuita con 48 hrs de anticipación.',
    itineraryRaw: itineraryText
  };
  showExpModal.value = true;
};

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2000000) {
      alert('La imagen supera los 2MB. Elige una imagen más pequeña para asegurar el rendimiento.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        expForm.value.coverImageUrl = e.target.result as string;
        triggerToast('Imagen local procesada.');
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveExperience = () => {
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
    gallery,
    tags: expForm.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    categories: expForm.value.categories.split(',').map(c => c.trim()).filter(Boolean),
    schedule: expForm.value.schedule,
    meetingPoint: expForm.value.meetingPoint,
    cancellationPolicy: expForm.value.cancellationPolicy,
    itinerary,
    duration: { value: 8, unit: 'hours' },
    languages: ['Español', 'Inglés'],
    capacity: { min: 2, max: 12 },
    included: ['Guía certificado', 'Seguro de accidentes', 'Equipo técnico'],
    notIncluded: ['Propinas', 'Gastos personales']
  };

  if (modalMode.value === 'add') {
    contentStore.addExperience(parsedExp);
    triggerToast('¡Servicio añadido al catálogo!');
  } else if (editingExpId.value) {
    contentStore.updateExperience(editingExpId.value, parsedExp);
    triggerToast('¡Servicio actualizado correctamente!');
  }

  showExpModal.value = false;
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

const handleServiceCoverUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2000000) {
      alert('La imagen supera los 2MB. Selecciona una más ligera.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        serviceItemForm.value.coverImage = e.target.result as string;
        triggerToast('Imagen de tarjeta procesada.');
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveServiceItemForm = () => {
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

  contentStore.saveServiceItem(itemData);
  triggerToast('¡Tarjeta de Inicio guardada con éxito!');
  showServiceItemModal.value = false;
};

const deleteServiceItem = (id: string) => {
  if (confirm('¿Deseas eliminar esta tarjeta de la página de inicio?')) {
    contentStore.deleteServiceItem(id);
    triggerToast('Tarjeta eliminada.');
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

const handleAdvisorImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2000000) {
      alert('La imagen supera los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        advisorForm.value.image = e.target.result as string;
        triggerToast('Imagen de integrante subida.');
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveAdvisorForm = () => {
  const advData: Advisor = {
    id: advisorForm.value.id || `adv-${Date.now()}`,
    name: advisorForm.value.name,
    role: advisorForm.value.role,
    image: advisorForm.value.image,
    bio: advisorForm.value.bio
  };

  contentStore.saveAdvisor(advData);
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

const totalRevenue = computed(() => {
  return contentStore.bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
});

const pendingBookingsCount = computed(() => {
  return contentStore.bookings.filter(b => b.status === 'pending').length;
});

const totalPax = computed(() => {
  return contentStore.bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.pax, 0);
});

const filteredBookings = computed(() => {
  return contentStore.bookings.filter(b => {
    const q = crmSearchQuery.value.toLowerCase();
    const matchesSearch = b.customerName.toLowerCase().includes(q) || 
                          b.customerEmail.toLowerCase().includes(q) ||
                          (b.customerRut && b.customerRut.toLowerCase().includes(q)) ||
                          (b.buyOrder && b.buyOrder.toLowerCase().includes(q)) ||
                          b.experienceTitle.toLowerCase().includes(q);
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
    source: 'manual'
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
  const headers = ['ID', 'Orden Compra', 'Cliente', 'RUT/Pasaporte', 'Email', 'Telefono', 'Experiencia', 'Fecha', 'Pasajeros', 'Total CLP', 'Metodo Pago', 'Cod Autorizacion', 'Origen', 'Estado', 'Notas'];
  const rows = contentStore.bookings.map(b => [
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
    `"${b.paymentMethod || 'manual'}"`,
    `"${b.authorizationCode || ''}"`,
    `"${b.source || 'manual'}"`,
    `"${b.status}"`,
    `"${(b.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `reservas_crm_wamani_${dateStr}.csv`);
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

const handleAboutHeroUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2000000) {
      alert('La imagen supera los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        aboutForm.value.heroImage = e.target.result as string;
        triggerToast('Imagen de cabecera de Nosotros cargada.');
      }
    };
    reader.readAsDataURL(file);
  }
};

const handleAboutHistoryUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2000000) {
      alert('La imagen supera los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        aboutForm.value.historyImage = e.target.result as string;
        triggerToast('Imagen de historia cargada.');
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveHomeContent = () => {
  contentStore.updateContent({ home: homeForm.value });
  triggerToast('¡Contenidos de la Página de Inicio guardados!');
};

const saveAboutContent = () => {
  contentStore.updateContent({ about: aboutForm.value });
  triggerToast('¡Contenidos de la Página Nosotros guardados!');
};

const saveContactContent = () => {
  contentStore.updateContent({ contact: contactForm.value });
  triggerToast('¡Información de Contacto guardada!');
};

const saveGatewayContent = () => {
  contentStore.updateGatewaySettings(gatewayForm.value);
  triggerToast('¡Configuración de Pasarela y Transferencias guardada con éxito!');
};

const handleRestore = () => {
  if (confirm('¿Quieres restablecer todo el contenido, experiencias y reservas a sus valores de fábrica? Perderás cualquier cambio guardado.')) {
    contentStore.restoreDefaults();
    homeForm.value = JSON.parse(JSON.stringify(contentStore.content.home));
    aboutForm.value = JSON.parse(JSON.stringify(contentStore.content.about));
    contactForm.value = JSON.parse(JSON.stringify(contentStore.content.contact));
    gatewayForm.value = JSON.parse(JSON.stringify(contentStore.content.gateway));
    triggerToast('¡Sitio web restaurado a los valores por defecto!');
  }
};
</script>

<template>
  <div class="admin-container min-vh-100 py-5 font-sans">
    <!-- 1. LOGIN PIN SECURITY OVERLAY -->
    <div v-if="!isAuthenticated" class="login-overlay d-flex align-items-center justify-content-center px-3">
      <div class="card p-5 border-0 login-card text-center text-white" style="max-width: 440px; border-radius: 28px; background: #045D56; border: 1px solid rgba(45, 212, 191, 0.4); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);">
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
          <button class="btn btn-outline-danger px-3 py-2 fw-semibold d-flex align-items-center" @click="handleRestore" title="Restablecer contenido de fábrica">
            <i class="bi bi-arrow-counterclockwise me-2"></i>Fábrica
          </button>
          <button class="btn btn-outline-light px-3 py-2 d-flex align-items-center" @click="isAuthenticated = false" title="Cerrar Sesión">
            <i class="bi bi-box-arrow-right me-1"></i> Salir
          </button>
        </div>
      </div>

      <!-- TABS CONTROL -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm p-2 rounded-4 admin-tabs-card">
            <ul class="nav nav-pills nav-fill gap-2">
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
                <button 
                  class="nav-link py-3 fw-bold rounded-3 transition-all" 
                  :class="{ active: activeTab === 'crm' }"
                  @click="activeTab = 'crm'"
                >
                  <i class="bi bi-graph-up-arrow me-2"></i>CRM Reservas
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
              <div v-if="homeForm.hero.videoUrl" class="mt-3 p-2 rounded-3 border border-secondary border-opacity-25" style="background-color: #033E3B;">
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
                    <img :src="adv.image" :alt="adv.name" class="rounded-circle object-fit-cover flex-shrink-0 shadow" style="width: 75px; height: 75px; border: 2px solid #2DD4BF;">
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
              <h3 class="h5 fw-bold mb-1 text-white">CRM / Control de Reservas ({{ contentStore.bookings.length }})</h3>
              <p class="small text-white opacity-85 mb-0">Gestión de leads automáticos y ventas directas con opción de exportar datos.</p>
            </div>
            
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <input v-model="crmSearchQuery" type="text" class="form-control form-control-sm admin-input text-white" placeholder="Buscar cliente o tour..." style="min-width: 200px;">
              <select v-model="crmStatusFilter" class="form-select form-select-sm admin-input text-white" style="min-width: 160px;">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
              <button class="btn btn-outline-accent btn-sm px-3 fw-bold text-nowrap d-flex align-items-center" @click="exportCrmToCsv" title="Descargar todas las reservas en archivo CSV/Excel">
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
                  <th scope="col" style="width: 60px;" class="text-center">Pax</th>
                  <th scope="col" style="width: 130px;">Total</th>
                  <th scope="col" style="width: 140px;">Método de Pago</th>
                  <th scope="col" style="width: 150px;">Estado</th>
                  <th scope="col" class="text-end" style="width: 80px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in filteredBookings" :key="b.id">
                  <td>
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="badge bg-dark text-accent border border-secondary border-opacity-25 font-monospace" style="font-size: 0.72rem;">{{ b.buyOrder || b.id }}</span>
                      <span v-if="b.customerRut" class="badge bg-dark bg-opacity-50 text-white border border-secondary border-opacity-25" style="font-size: 0.7rem;">{{ b.customerRut }}</span>
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
                    <span class="fw-semibold text-white">{{ b.experienceTitle }}</span>
                  </td>
                  <td class="text-white opacity-90 font-monospace">{{ b.bookingDate }}</td>
                  <td class="text-center font-monospace fw-bold text-white fs-6">{{ b.pax }}</td>
                  <td class="fw-bold text-accent font-monospace fs-6">{{ formatPrice(b.totalPrice) }}</td>
                  <td>
                    <div v-if="b.paymentMethod === 'webpay'" class="d-flex flex-column">
                      <span class="badge bg-primary text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem;"><i class="bi bi-credit-card-2-front-fill me-1"></i>Webpay Plus</span>
                      <span v-if="b.authorizationCode" class="small text-accent font-monospace mt-1" style="font-size: 0.68rem;">Auth: {{ b.authorizationCode }}</span>
                    </div>
                    <div v-else-if="b.paymentMethod === 'transfer'" class="d-flex flex-column">
                      <span class="badge bg-teal text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem; background-color: #0d9488;"><i class="bi bi-bank me-1"></i>Transferencia</span>
                    </div>
                    <div v-else class="d-flex flex-column">
                      <span class="badge bg-secondary text-white p-1 fw-bold text-uppercase" style="font-size: 0.7rem;"><i class="bi bi-person-fill me-1"></i>Manual</span>
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
                    <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="deleteBooking(b.id)" title="Eliminar Registro">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredBookings.length === 0">
                  <td colspan="8" class="text-center py-5 text-white opacity-75">
                    <i class="bi bi-inbox fs-2 d-block mb-2 text-accent"></i>
                    No hay reservas registradas coincidentes.
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

              <div class="p-3 rounded-3 mb-3" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
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
                  <span class="p-2 rounded-circle bg-teal bg-opacity-25 text-accent d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: rgba(13, 148, 136, 0.25);">
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

              <div class="p-3 rounded-3" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
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
                  <div class="p-3 rounded-3" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
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
                  <div class="p-3 rounded-3" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
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

    <!-- MODAL EDITAR ADVISOR / EQUIPO -->
    <div v-if="showAdvisorModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-card p-4 shadow-lg overflow-y-auto text-white" style="width: 100%; max-width: 600px; max-height: 85vh; border-radius: 24px;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <h3 class="h5 fw-bold text-white mb-0">
            <i class="bi bi-person-badge-fill me-2 text-accent"></i>
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
              <img v-if="advisorForm.image" :src="advisorForm.image" class="rounded-circle object-fit-cover flex-shrink-0 shadow" style="width: 70px; height: 70px; border: 2px solid #2DD4BF;" alt="Vista previa">
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

          <div class="col-12">
            <label class="form-label small fw-bold text-white mb-2">Imagen de Portada (Archivo local o URL)</label>
            <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div v-if="expForm.coverImageUrl" class="rounded-3 border border-secondary border-opacity-25 overflow-hidden flex-shrink-0" style="width: 100px; height: 100px;">
                <img :src="expForm.coverImageUrl" class="w-100 h-100 object-fit-cover" alt="Vista previa">
              </div>
              <div class="flex-grow-1">
                <input type="file" class="form-control mb-2 admin-input text-white" accept="image/*" @change="handleImageUpload">
                <input v-model="expForm.coverImageUrl" type="text" class="form-control admin-input text-white" placeholder="URL de la imagen...">
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

          <div class="col-12 text-end border-top border-secondary border-opacity-25 pt-3 mt-4">
            <button type="button" class="btn btn-outline-light me-2 px-4" @click="showExpModal = false">Cancelar</button>
            <button type="submit" class="btn btn-accent px-4 fw-bold text-dark-mountain">Guardar Tour</button>
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
$dark-mountain: #045D56;
$dark-inner: #033E3B;
$accent-turquoise: #2DD4BF;

.text-dark-mountain {
  color: #033E3B !important;
}

.text-accent {
  color: $accent-turquoise !important;
}

.text-amber {
  color: #FBBF24 !important;
}

.bg-accent {
  background-color: $accent-turquoise !important;
}

.btn-accent {
  background-color: $accent-turquoise !important;
  color: #033E3B !important;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: lighten($accent-turquoise, 8%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(45, 212, 191, 0.4);
  }
}

.btn-outline-accent {
  border: 1px solid $accent-turquoise;
  color: $accent-turquoise;
  background: transparent;
  transition: all 0.2s ease;

  &:hover {
    background-color: $accent-turquoise;
    color: #033E3B;
  }
}

/* Cards y Superficies */
.admin-header-card {
  background: linear-gradient(145deg, #045D56 0%, #033E3B 100%);
  border: 1px solid rgba(45, 212, 191, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.admin-tabs-card {
  background-color: #045D56;
  border: 1px solid rgba(45, 212, 191, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.admin-module-card {
  background: linear-gradient(145deg, #045D56 0%, #033E3B 100%);
  border: 1px solid rgba(45, 212, 191, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.admin-sub-card {
  background-color: #033E3B;
  border: 1px solid rgba(45, 212, 191, 0.25);
}

.admin-kpi-card {
  background: linear-gradient(145deg, #045D56 0%, #033E3B 100%);
  border: 1px solid rgba(45, 212, 191, 0.35);
}

/* Inputs & Form Controls */
.admin-input {
  background-color: #033E3B !important;
  border: 1px solid rgba(45, 212, 191, 0.3) !important;
  color: #FFFFFF !important;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  &:focus {
    background-color: #022C2A !important;
    border-color: $accent-turquoise !important;
    box-shadow: 0 0 0 0.25rem rgba(45, 212, 191, 0.25) !important;
    color: #FFFFFF !important;
  }
}

/* Tablas */
.admin-table {
  color: #FFFFFF;
  --bs-table-bg: transparent;
  --bs-table-color: #FFFFFF;
  --bs-table-border-color: rgba(45, 212, 191, 0.15);

  thead {
    background-color: #022C2A;
    border-bottom: 2px solid rgba(45, 212, 191, 0.4);

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
      background-color: rgba(45, 212, 191, 0.08) !important;
    }

    td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid rgba(45, 212, 191, 0.15);
    }
  }
}

/* Badges */
.admin-pill-badge {
  background-color: #022C2A;
  color: #FFFFFF;
  border: 1px solid rgba(45, 212, 191, 0.3);
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
    background-color: rgba(45, 212, 191, 0.15);
    color: $accent-turquoise;
  }
  
  &.active {
    color: #033E3B !important;
    background-color: $accent-turquoise !important;
    box-shadow: 0 4px 15px rgba(45, 212, 191, 0.4);
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
  background: linear-gradient(145deg, #045D56 0%, #033E3B 100%);
  border: 1px solid rgba(45, 212, 191, 0.5);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

/* Toast */
.admin-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1200;
  min-width: 280px;
  background: #045D56;
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
</style>
