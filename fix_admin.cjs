const fs = require('fs');
const path = require('path');
const file_path = path.join(__dirname, 'src/views/admin/AdminView.vue');
let content = fs.readFileSync(file_path, 'utf8');

const targetStr = "const activeTab = ref<'services' | 'cards-home' | 'content-home' | 'content-about' | 'advisors' | 'contact' | 'crm' | 'gateway' | 'legal'>('services');";

const replacementStr = "const activeTab = ref<'services' | 'cards-home' | 'content-home' | 'content-about' | 'advisors' | 'contact' | 'crm' | 'gateway' | 'legal' | 'promotions'>('services');\n" +
"import { supabase } from '@/shared/api/supabaseClient';\n" +
"const supabaseOrders = ref([]);\n" +
"const fetchOrders = async () => {\n" +
"  if (!supabase) return;\n" +
"  const { data, error } = await supabase.from('orders_v2').select('*, order_items_v2(*)').order('created_at', { ascending: false });\n" +
"  if (!error && data) supabaseOrders.value = data;\n" +
"};\n" +
"onMounted(() => {\n" +
"  fetchOrders();\n" +
"});\n";

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(file_path, content, 'utf8');
console.log('Fixed script injected!');
