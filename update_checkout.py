import re

file_path = 'src/views/checkout/CheckoutView.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mobile summary
mobile_pattern = r'<div class="col-12 d-lg-none mb-2">.*?<h3 class="h5 fw-bold text-accent mb-4'
mobile_repl = r'''<div class="col-12 d-lg-none mb-2">
          <div class="p-3 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.4);">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 class="h6 fw-bold text-white mb-0">Resumen ({{ cartStore.totalItems }} items)</h4>
              <strong class="text-accent fs-6 font-monospace">{{ formatPrice(cartStore.totalToPay) }}</strong>
            </div>
            <div v-for="item in cartStore.items" :key="item.id" class="small text-white opacity-85 border-bottom border-secondary border-opacity-25 pb-1 mb-1">
              {{ item.tourTitle }} - {{ item.scheduleDate }} ({{ item.tickets.reduce((sum, t) => sum + t.quantity, 0) }} pax)
            </div>
          </div>
        </div>
        
        <!-- COLUMNA IZQUIERDA: FORMULARIO DEL CLIENTE -->
        <div class="col-12 col-lg-8">
          <form @submit.prevent="handleInitiatePayment" class="d-flex flex-column gap-4">
            
            <h3 class="h5 fw-bold text-accent mb-4'''

content = re.sub(mobile_pattern, mobile_repl, content, flags=re.DOTALL)

# Replace desktop summary
desktop_pattern = r'<div class="d-flex gap-3 mb-4 align-items-center">.*?<div class="d-flex justify-content-between align-items-end mt-2 pt-3 border-top border-secondary border-opacity-25">'
desktop_repl = r'''
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
              <div class="d-flex justify-content-between align-items-end mt-2 pt-3 border-top border-secondary border-opacity-25">'''

content = re.sub(desktop_pattern, desktop_repl, content, flags=re.DOTALL)

# Replace remaining 	otalPrice usages
content = content.replace("{{ formatPrice(totalPrice) }}", "{{ formatPrice(cartStore.totalToPay) }}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("CheckoutView template updated!")
