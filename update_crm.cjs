const fs = require('fs');
const path = require('path');
const file_path = path.join(__dirname, 'src/views/admin/AdminView.vue');
let content = fs.readFileSync(file_path, 'utf8');

const fetchOrdersScript = 
'const supabaseOrders = ref([]);\n' +
'const fetchOrders = async () => {\n' +
'  if (!supabase) return;\n' +
'  const { data, error } = await supabase.from(\\'orders_v2\\').select(\\'*, order_items_v2(*)\\').order(\\'created_at\\', { ascending: false });\n' +
'  if (!error && data) supabaseOrders.value = data;\n' +
'};\n';

content = content.replace(/const fetchCoupons = async \(\) => \{/, fetchOrdersScript + '\nconst fetchCoupons = async () => {');
content = content.replace(/onMounted\(\(\) => \{/, 'onMounted(() => {\n  fetchOrders();');

content = content.replace(/const totalRevenue = computed\(\(\) => \{[\s\S]*?return contentStore\.bookings\.filter\(b => \{[\s\S]*?\}\);\n\}\);/m, 
'const totalRevenue = computed(() => {\n' +
'  return supabaseOrders.value\n' +
'    .filter(b => b.payment_status === \\'paid\\' || b.payment_status === \\'confirmed\\')\n' +
'    .reduce((sum, b) => sum + (b.total_price_clp || 0), 0);\n' +
'});\n' +
'const pendingBookingsCount = computed(() => {\n' +
'  return supabaseOrders.value.filter(b => b.payment_status === \\'pending\\').length;\n' +
'});\n' +
'const totalPax = computed(() => {\n' +
'  return supabaseOrders.value.reduce((sum, b) => {\n' +
'       const orderPax = b.order_items_v2 ? b.order_items_v2.reduce((acc, item) => acc + (item.pax_count || 0), 0) : 0;\n' +
'       return sum + orderPax;\n' +
'  }, 0);\n' +
'});\n' +
'const filteredBookings = computed(() => {\n' +
'  return supabaseOrders.value.filter(b => {\n' +
'    const q = crmSearchQuery.value.toLowerCase();\n' +
'    const matchesSearch = b.customer_name?.toLowerCase().includes(q) || \n' +
'                          b.customer_email?.toLowerCase().includes(q) ||\n' +
'                          (b.customer_rut && b.customer_rut.toLowerCase().includes(q)) ||\n' +
'                          (b.buy_order && b.buy_order.toLowerCase().includes(q));\n' +
'    if (crmFilterStatus.value === \\'all\\') return matchesSearch;\n' +
'    return matchesSearch && b.payment_status === crmFilterStatus.value;\n' +
'  });\n' +
'});'
);

content = content.replace(/b\.buyOrder/g, 'b.buy_order');
content = content.replace(/b\.customerName/g, 'b.customer_name');
content = content.replace(/b\.customerEmail/g, 'b.customer_email');
content = content.replace(/b\.customerPhone/g, 'b.customer_phone');
content = content.replace(/b\.customerRut/g, 'b.customer_rut');
content = content.replace(/b\.paymentMethod/g, 'b.payment_method');
content = content.replace(/b\.totalPrice/g, 'b.total_price_clp');
content = content.replace(/b\.status/g, 'b.payment_status');
content = content.replace(/b\.bookingDate/g, 'b.created_at');
content = content.replace(/b\.experienceTitle/g, "'Orden Carrito'");

fs.writeFileSync(file_path, content, 'utf8');
console.log('CRM Table Updated to Supabase');
