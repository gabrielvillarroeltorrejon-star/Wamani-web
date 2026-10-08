<template>
  <div>
    <!-- Overlay oscuro de fondo -->
    <div 
      v-if="cartStore.isCartOpen" 
      class="cart-overlay fade-enter-active" 
      @click="cartStore.toggleCart"
    ></div>

    <!-- Panel lateral derecho del carrito -->
    <div 
      class="cart-drawer modern-glass" 
      :class="{ 'is-open': cartStore.isCartOpen }"
    >
      <div class="cart-header border-bottom border-light border-opacity-10">
        <h3 class="mb-0 font-serif fw-bold text-white d-flex align-items-center gap-2">
          <i class="bi bi-bag-check"></i> Tu Carrito
        </h3>
        <button class="btn btn-close-custom" @click="cartStore.toggleCart">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="cart-body custom-scrollbar">
        <div v-if="cartStore.items.length === 0" class="empty-cart flex-column text-center h-100 d-flex justify-content-center align-items-center">
          <div class="empty-icon-wrapper mb-4">
            <i class="bi bi-cart-x fs-1 text-white opacity-75"></i>
          </div>
          <h5 class="fw-bold text-white mb-2">Tu carrito está vacío</h5>
          <p class="text-white opacity-75 small mb-4">Descubre nuestras expediciones y comienza a planear tu próxima aventura.</p>
          <button class="btn btn-accent-glow rounded-pill px-5 py-2 fw-bold" @click="verTours">Explorar Tours</button>
        </div>

        <div v-else class="cart-items py-2">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item glass-card mb-3 position-relative">
            <button class="btn btn-sm btn-remove-item position-absolute top-0 end-0 m-2" @click="cartStore.removeFromCart(item.id)">
              <i class="bi bi-trash3"></i>
            </button>
            <div class="card-body p-3">
              <h6 class="card-title fw-bold text-white mb-2 pe-4">{{ item.tourTitle }}</h6>
              <div class="d-flex align-items-center gap-2 text-white opacity-75 small mb-3">
                <i class="bi bi-calendar-event"></i>
                <span>{{ item.scheduleDate }} • {{ item.scheduleTime }}</span>
              </div>
              
              <div class="ticket-list">
                <div v-for="(ticket, idx) in item.tickets" :key="idx" class="d-flex justify-content-between align-items-center small py-1 border-top border-light border-opacity-10 mt-1 pt-2">
                  <span class="text-white fw-medium"><span class="badge bg-white text-dark me-2">{{ ticket.quantity }}x</span> {{ ticket.type }}</span>
                  <span class="text-accent fw-bold">{{ formatCurrency(ticket.quantity * ticket.unitPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cartStore.items.length > 0" class="cart-footer">
        <!-- Cupones -->
        <div class="coupon-section mb-4">
          <div v-if="cartStore.activeCoupon" class="coupon-active-badge p-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2 text-white">
              <i class="bi bi-tag-fill text-accent"></i>
              <span>Cupón <strong class="text-accent">{{ cartStore.activeCoupon.code }}</strong></span>
            </div>
            <button class="btn btn-sm text-white opacity-75 hover-opacity-100 p-0" @click="cartStore.removeCoupon">
              <i class="bi bi-x-circle fs-5"></i>
            </button>
          </div>
          <div v-else class="coupon-input-group">
            <div class="input-group">
              <input v-model="couponCode" type="text" class="form-control glass-input" placeholder="Ingresa tu código...">
              <button class="btn btn-glass-outline" @click="applyCoupon" :disabled="!couponCode">Aplicar</button>
            </div>
            <small v-if="couponError" class="text-warning mt-2 d-block fw-medium"><i class="bi bi-exclamation-triangle-fill me-1"></i>{{ couponError }}</small>
          </div>
        </div>

        <!-- Totales -->
        <div class="checkout-summary p-3 rounded-4 mb-4">
          <div class="d-flex justify-content-between mb-2 text-white opacity-75 small">
            <span>Subtotal</span>
            <span>{{ formatCurrency(cartStore.subtotal) }}</span>
          </div>
          <div v-if="cartStore.discountAmount > 0" class="d-flex justify-content-between text-accent mb-2 small fw-medium">
            <span>Descuento aplicado</span>
            <span>- {{ formatCurrency(cartStore.discountAmount) }}</span>
          </div>
          <hr class="border-light border-opacity-25 my-2">
          <div class="d-flex justify-content-between align-items-center text-white mt-2">
            <span class="fw-medium">Total Final</span>
            <span class="fs-4 fw-bold text-accent">{{ formatCurrency(cartStore.totalToPay) }}</span>
          </div>
        </div>

        <button class="btn btn-accent-glow w-100 py-3 fw-bold fs-5 d-flex justify-content-center align-items-center gap-2" @click="goToCheckout">
          <span>Finalizar Compra</span> <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/shared/stores/cartStore';

const cartStore = useCartStore();
const router = useRouter();

const couponCode = ref('');
const couponError = ref('');

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
};

const applyCoupon = async () => {
  couponError.value = '';
  try {
    await cartStore.applyCoupon(couponCode.value);
    couponCode.value = '';
  } catch (error: any) {
    couponError.value = error.message;
  }
};

const verTours = () => {
  cartStore.toggleCart();
  router.push('/experiencias');
};

const goToCheckout = () => {
  cartStore.isCartOpen = false;
  // TODO: Navigate to the unified checkout page when Sprint 3 is ready
  alert('Redirigiendo al checkout unificado...');
};
</script>

<style scoped lang="scss">
@import '@/assets/styles/_variables.scss';

.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 44, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1040;
  transition: opacity 0.3s ease;
}

.cart-drawer {
  position: fixed;
  top: 16px; /* Holgura superior */
  right: -450px;
  width: 430px;
  max-width: calc(100vw - 32px);
  height: calc(100vh - 32px); /* Holgura inferior */
  z-index: 1050;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  transition: right 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  display: flex;
  flex-direction: column;

  &.is-open {
    right: 16px; /* Holgura derecha */
  }
}

.modern-glass {
  background: linear-gradient(145deg, rgba(4, 93, 86, 0.95) 0%, rgba(2, 62, 59, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px; /* Bordes redondeados completos */
}

@media (max-width: 576px) {
  .cart-drawer {
    top: 8px;
    right: -100vw;
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
  }
  .cart-drawer.is-open {
    right: 8px;
  }
}

.cart-header {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between; /* Garantiza que el botón de cerrar esté a la derecha */
  align-items: center;
}

.btn-close-custom {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
  }
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.custom-scrollbar {
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: transform 0.3s ease, background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.09);
    transform: translateY(-2px);
  }
}

.btn-remove-item {
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: #ff6b6b;
  }
}

.cart-footer {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0 0 24px 24px; /* Bordes inferiores redondeados para encajar en el panel */
}

.coupon-active-badge {
  background: rgba(45, 212, 191, 0.15);
  border: 1px dashed rgba(45, 212, 191, 0.4);
  border-radius: 12px;
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 12px 0 0 12px !important;
  
  &::placeholder { color: rgba(255, 255, 255, 0.4); }
  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: none;
    color: #fff;
  }
}

.btn-glass-outline {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 0 12px 12px 0 !important;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
  &:disabled {
    opacity: 0.5;
    color: rgba(255, 255, 255, 0.5);
  }
}

.checkout-summary {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-accent-glow {
  background: linear-gradient(45deg, $accent-gold, #14B8A6);
  border: none;
  color: #022C2A;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(45, 212, 191, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(45, 212, 191, 0.6);
    color: #022C2A;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.font-serif {
  font-family: $font-family-serif;
  letter-spacing: 0.05em;
}

.text-accent {
  color: $accent-gold !important;
}
</style>


