const fs = require('fs');
const path = require('path');
const file_path = path.join(__dirname, 'src/views/admin/AdminView.vue');
let content = fs.readFileSync(file_path, 'utf8');

const navItemPattern = /<li class="nav-item">\s*<button\s*class="nav-link[^>]+:class="\{ active: activeTab === 'crm' \}"[^>]+>\s*<i class="bi bi-graph-up-arrow me-2"><\/i>CRM Reservas\s*<\/button>\s*<\/li>/;
const navItemRepl = '<li class="nav-item">' +
'  <button class="nav-link py-3 fw-bold rounded-3 transition-all" :class="{ active: activeTab === \'crm\' }" @click="activeTab = \'crm\'">' +
'    <i class="bi bi-graph-up-arrow me-2"></i>CRM Reservas' +
'  </button>' +
'</li>' +
'<li class="nav-item">' +
'  <button class="nav-link py-3 fw-bold rounded-3 transition-all" :class="{ active: activeTab === \'promotions\' }" @click="activeTab = \'promotions\'">' +
'    <i class="bi bi-ticket-perforated me-2"></i>Promociones' +
'  </button>' +
'</li>';

content = content.replace(navItemPattern, navItemRepl);

const tabPanelPattern = /<!-- TAB PANEL 9: LEGAL -->/;
const tabPanelRepl = '<!-- TAB PANEL: PROMOTIONES -->' +
'      <div v-if="activeTab === \'promotions\'" class="tab-pane-content">' +
'        <div class="checkout-card p-4 p-md-5 rounded-4 shadow-sm mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">' +
'          <h3 class="h5 fw-bold text-accent mb-4 d-flex align-items-center gap-2">' +
'            <i class="bi bi-ticket-perforated"></i> Cupones de Descuento' +
'          </h3>' +
'          <div class="row g-3 mb-4">' +
'            <div class="col-md-3">' +
'              <label class="form-label small fw-bold text-white">Código</label>' +
'              <input v-model="newCoupon.code" class="form-control admin-input text-white" placeholder="Ej: WAMANI20">' +
'            </div>' +
'            <div class="col-md-3">' +
'              <label class="form-label small fw-bold text-white">Tipo</label>' +
'              <select v-model="newCoupon.type" class="form-control admin-input text-white">' +
'                <option value="percentage" style="color: black;">Porcentaje (%)</option>' +
'                <option value="fixed_amount" style="color: black;">Monto Fijo ($)</option>' +
'              </select>' +
'            </div>' +
'            <div class="col-md-3">' +
'              <label class="form-label small fw-bold text-white">Valor</label>' +
'              <input v-model.number="newCoupon.value" type="number" class="form-control admin-input text-white" placeholder="Ej: 20">' +
'            </div>' +
'            <div class="col-md-3 d-flex align-items-end">' +
'              <button class="btn btn-accent w-100 fw-bold py-2" @click="createCoupon">Crear Cupón</button>' +
'            </div>' +
'          </div>' +
'          <div class="table-responsive">' +
'            <table class="table table-dark table-hover align-middle">' +
'              <thead>' +
'                <tr>' +
'                  <th>Código</th>' +
'                  <th>Tipo</th>' +
'                  <th>Valor</th>' +
'                  <th>Usos</th>' +
'                  <th>Estado</th>' +
'                </tr>' +
'              </thead>' +
'              <tbody>' +
'                <tr v-for="c in coupons" :key="c.id">' +
'                  <td class="fw-bold text-accent">{{ c.code }}</td>' +
'                  <td>{{ c.discount_type === \'percentage\' ? \'Porcentaje\' : \'Monto Fijo\' }}</td>' +
'                  <td>{{ c.discount_type === \'percentage\' ? c.discount_value + \'%\' : \'$\' + c.discount_value }}</td>' +
'                  <td>{{ c.current_uses }} / {{ c.max_uses || \'8\' }}</td>' +
'                  <td>' +
'                    <span class="badge" :class="c.is_active ? \'bg-success\' : \'bg-danger\'">' +
'                      {{ c.is_active ? \'Activo\' : \'Inactivo\' }}' +
'                    </span>' +
'                  </td>' +
'                </tr>' +
'              </tbody>' +
'            </table>' +
'          </div>' +
'        </div>' +
'      </div>' +
'      <!-- TAB PANEL 9: LEGAL -->';

content = content.replace(tabPanelPattern, tabPanelRepl);

const scriptVariablesPattern = /const activeTab = ref\('services'\);/;
const scriptVariablesRepl = 'const activeTab = ref(\'services\');\n' +
'import { supabase } from \'@/shared/api/supabaseClient\';\n' +
'const coupons = ref([]);\n' +
'const newCoupon = ref({ code: \'\', type: \'percentage\', value: 0 });\n' +
'const fetchCoupons = async () => {\n' +
'  if (!supabase) return;\n' +
'  const { data, error } = await supabase.from(\'discount_codes\').select(\'*\').order(\'created_at\', { ascending: false });\n' +
'  if (!error && data) coupons.value = data;\n' +
'};\n' +
'const createCoupon = async () => {\n' +
'  if (!supabase) return alert(\'Supabase no conectado\');\n' +
'  if (!newCoupon.value.code) return alert(\'Ingresa un código\');\n' +
'  const { error } = await supabase.from(\'discount_codes\').insert([{\n' +
'    code: newCoupon.value.code.toUpperCase(),\n' +
'    discount_type: newCoupon.value.type,\n' +
'    discount_value: newCoupon.value.value,\n' +
'    max_uses: 100,\n' +
'    is_active: true\n' +
'  }]);\n' +
'  if (error) alert(\'Error: \' + error.message);\n' +
'  else {\n' +
'    alert(\'Cupón creado exitosamente!\');\n' +
'    newCoupon.value = { code: \'\', type: \'percentage\', value: 0 };\n' +
'    fetchCoupons();\n' +
'  }\n' +
'};\n' +
'onMounted(() => {\n' +
'  fetchCoupons();\n' +
'});\n';

content = content.replace(scriptVariablesPattern, scriptVariablesRepl);

fs.writeFileSync(file_path, content, 'utf8');
console.log('AdminView successfully updated with Promotions Tab!');
