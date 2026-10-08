const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, 'src/views/checkout/CheckoutView.vue');
let content = fs.readFileSync(file_path, 'utf8');

// Replace desktop summary
const desktop_pattern = /<div class="d-flex gap-3 mb-4 align-items-center">[\s\S]*?<div class="d-flex justify-content-between align-items-end mt-2 pt-3 border-top border-secondary border-opacity-25">/;
const desktop_repl = \
            <div v-for="item in cartStore.items" :key="item.id" class="d-flex gap-3 mb-3 align-items-center border-bottom border-secondary border-opacity-25 pb-3">
              <div>
                <h4 class="h6 fw-bold text-white mb-1">{{ item.tourTitle }}</h4>
                <p class="small text-white opacity-75 mb-0">
                  <i class="bi bi-calendar3 me-1 text-accent"></i>{{ item.scheduleDate }} &nbsp; 
                  <i class="bi bi-people me-1 text-accent"></i> {{ item.tickets.reduce((sum, t) => sum + t.quantity, 0) }} pax
                </p>
              </div>
            </div>

            <div class="summary-breakdown p-3 rounded-3 mb-4" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Subtotal:</span>
                <span class="fw-bold text-white">{{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              <div v-if="cartStore.discountAmount > 0" class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Descuento:</span>
                <span class="fw-bold text-success">- {{ formatPrice(cartStore.discountAmount) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Impuestos e IVA (19%):</span>
                <span class="text-success fw-bold">Incluido</span>
              </div>
              <div class="d-flex justify-content-between align-items-end mt-2 pt-3 border-top border-secondary border-opacity-25">\;

content = content.replace(desktop_pattern, desktop_repl);

// Replace remaining totalPrice usage
content = content.replace(/\{\{ formatPrice\(totalPrice\) \}\}/g, '{{ formatPrice(cartStore.totalToPay) }}');

fs.writeFileSync(file_path, content, 'utf8');
console.log('CheckoutView updated!');
