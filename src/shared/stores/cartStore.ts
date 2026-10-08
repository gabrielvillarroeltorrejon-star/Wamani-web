import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export interface TicketSelection {
  type: 'adult' | 'child' | 'student' | 'foreigner';
  quantity: number;
  unitPrice: number;
}

export interface CartItem {
  id: string; // Unique ID for this cart entry
  tourId: string;
  tourTitle: string;
  scheduleId: string; // ID of the specific date/time schedule
  scheduleDate: string; // Formatted date string, e.g. "2026-10-15"
  scheduleTime: string; // Formatted time string, e.g. "08:30"
  tickets: TicketSelection[];
}

export interface DiscountCoupon {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    // Automatically persists to localStorage under 'wamani-cart'
    items: useStorage<CartItem[]>('wamani-cart', []),
    activeCoupon: useStorage<DiscountCoupon | null>('wamani-cart-coupon', null),
    isCartOpen: false, // For controlling the UI drawer
  }),
  
  getters: {
    totalItems: (state) => {
      let count = 0;
      for (const item of state.items) {
        for (const ticket of item.tickets) {
          count += ticket.quantity;
        }
      }
      return count;
    },
    
    subtotal: (state) => {
      let sum = 0;
      for (const item of state.items) {
        for (const ticket of item.tickets) {
          sum += ticket.quantity * ticket.unitPrice;
        }
      }
      return sum;
    },
    
    discountAmount: (state) => {
      if (!state.activeCoupon) return 0;
      const sub = sumSubtotal(state.items);
      if (state.activeCoupon.type === 'percentage') {
        return Math.floor(sub * (state.activeCoupon.value / 100));
      }
      if (state.activeCoupon.type === 'fixed_amount') {
        return Math.min(sub, state.activeCoupon.value); // No negative totals
      }
      return 0;
    },
    
    totalToPay: (state) => {
      const sub = sumSubtotal(state.items);
      const discount = calculateDiscount(state.activeCoupon, sub);
      return Math.max(0, sub - discount);
    }
  },
  
  actions: {
    toggleCart() {
      this.isCartOpen = !this.isCartOpen;
    },
    
    addToCart(item: Omit<CartItem, 'id'>) {
      // Check if exact same tour & schedule already exists
      const existingIndex = this.items.findIndex(
        i => i.tourId === item.tourId && i.scheduleId === item.scheduleId
      );
      
      if (existingIndex >= 0) {
        // Merge tickets
        const existingItem = this.items[existingIndex];
        item.tickets.forEach(newTicket => {
          const existingTicket = existingItem.tickets.find(t => t.type === newTicket.type);
          if (existingTicket) {
            existingTicket.quantity += newTicket.quantity;
          } else {
            existingItem.tickets.push({ ...newTicket });
          }
        });
      } else {
        // Add new
        this.items.push({
          ...item,
          id: Math.random().toString(36).substring(2, 9)
        });
      }
      
      this.isCartOpen = true; // Open drawer when adding
    },
    
    removeFromCart(itemId: string) {
      this.items = this.items.filter(item => item.id !== itemId);
    },
    
    clearCart() {
      this.items = [];
      this.activeCoupon = null;
    },
    
    async applyCoupon(code: string) {
      const { useContentStore } = await import('./contentStore');
      const contentStore = useContentStore();
      
      const found = contentStore.discountCodes.find(d => d.code.toUpperCase() === code.toUpperCase());
      
      if (found && found.isActive) {
        this.activeCoupon = {
          code: found.code,
          type: found.type as 'percentage' | 'fixed_amount',
          value: found.value
        };
        return true;
      }
      
      throw new Error('Cupón inválido o expirado.');
    },
    
    removeCoupon() {
      this.activeCoupon = null;
    }
  }
});

// Helpers for getters
function sumSubtotal(items: CartItem[]): number {
  let sum = 0;
  for (const item of items) {
    for (const ticket of item.tickets) {
      sum += ticket.quantity * ticket.unitPrice;
    }
  }
  return sum;
}

function calculateDiscount(coupon: DiscountCoupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (coupon.type === 'percentage') {
    return Math.floor(subtotal * (coupon.value / 100));
  }
  if (coupon.type === 'fixed_amount') {
    return Math.min(subtotal, coupon.value);
  }
  return 0;
}
