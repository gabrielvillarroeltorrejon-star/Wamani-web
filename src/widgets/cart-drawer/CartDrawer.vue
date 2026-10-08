<template>
  <div>
    <!-- Overlay oscuro de fondo -->
    <div 
      v-if="cartStore.isCartOpen" 
      class="cart-overlay" 
      @click="cartStore.toggleCart"
    ></div>

    <!-- Panel lateral derecho del carrito -->
    <div 
      class="cart-drawer" 
      :class="{ 'is-open': cartStore.isCartOpen }"
    >
      <div class="cart-header">
        <h3 class="mb-0">Tu Carrito</h3>
        <button class="btn-close" @click="cartStore.toggleCart"></button>
      </div>

      <div class="cart-body">
        <div v-if="cartStore.items.length === 0" class="empty-cart">
          <i class="bi bi-cart-x fs-1 text-muted mb-3"></i>
          <p>Tu carrito está vacío.</p>
          <button class="btn btn-primary" @click="cartStore.toggleCart">Ver Tours</button>
        </div>

        <div v-else class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item card mb-3 premium-card border-0">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between">
                <h6 class="card-title fw-bold mb-1">{{ item.tourTitle }}</h6>
                <button class="btn-close btn-sm kowalski-btn" @click="cartStore.removeFromCart(item.id)"></button>
              </div>
              <p class="text-muted small mb-2">
                <i class="bi bi-calendar3"></i> {{ item.scheduleDate }} a las {{ item.scheduleTime }}
              </p>
              
              <ul class="list-unstyled small mb-0">
                <li v-for="(ticket, idx) in item.tickets" :key="idx" class="d-flex justify-content-between">
                  <span>{{ ticket.quantity }}x {{ ticket.type }}</span>
                  <span>{{ formatCurrency(ticket.quantity * ticket.unitPrice) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cartStore.items.length > 0" class="cart-footer">
        <!-- Cupones -->
        <div class="coupon-section mb-3">
          <div v-if="cartStore.activeCoupon" class="alert alert-success py-2 px-3 mb-0 d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-tag-fill me-1"></i>
              Cupón <strong>{{ cartStore.activeCoupon.code }}</strong> aplicado.
            </span>
            <button class="btn-close btn-sm kowalski-btn" @click="cartStore.removeCoupon"></button>
          </div>
          <div v-else class="input-group input-group-sm">
            <input v-model="couponCode" type="text" class="form-control" placeholder="Código de descuento">
            <button class="btn btn-outline-secondary" @click="applyCoupon" :disabled="!couponCode">Aplicar</button>
          </div>
          <small v-if="couponError" class="text-danger mt-1 d-block">{{ couponError }}</small>
        </div>

        <!-- Totales -->
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>{{ formatCurrency(cartStore.subtotal) }}</span>
        </div>
        <div v-if="cartStore.discountAmount > 0" class="d-flex justify-content-between text-success mb-2">
          <span>Descuento</span>
          <span>- {{ formatCurrency(cartStore.discountAmount) }}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
          <span>Total</span>
          <span>{{ formatCurrency(cartStore.totalToPay) }}</span>
        </div>

        <button class="btn btn-primary w-100 fw-bold" @click="goToCheckout">
          Pagar Ahora
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

const goToCheckout = () => {
  cartStore.isCartOpen = false;
  // TODO: Navigate to the unified checkout page when Sprint 3 is ready
  alert('Redirigiendo al checkout unificado...');
};
</script>

<style scoped lang="scss">
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1040;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: -400px; /* Hidden by default */
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background-color: #FAFAFA; /* Taste: Premium off-white */
  color: #1C1C1E; /* Impeccable: deep dark text */
  z-index: 1050;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  transition: right 0.5s cubic-bezier(0.22, 1, 0.36, 1); /* Kowalski easing */
  display: flex;
  flex-direction: column;

  &.is-open {
    right: 0;
  }
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FFFFFF;
}

.premium-card { background-color: #FFFFFF; border: 1px solid rgba(0, 0, 0, 0.04); box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.03); transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.kowalski-btn:active { transform: scale(0.9) !important; }
.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.05);
  background-color: #FFFFFF;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.btn-primary {
  background-color: #0FA095;
  border: none;
  color: white;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:hover {
    background-color: lighten(#0FA095, 5%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -6px rgba(15, 160, 149, 0.35);
  }
  
  &:active {
    transform: scale(0.97) translateY(0);
  }
}
</style>


