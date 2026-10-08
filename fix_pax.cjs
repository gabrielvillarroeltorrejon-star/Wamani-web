const fs = require('fs');
const path = require('path');
const file_path = path.join(__dirname, 'src/views/admin/AdminView.vue');
let content = fs.readFileSync(file_path, 'utf8');

const targetStr = "const totalPax = computed(() => {\n" +
"    return supabaseOrders.value\n" +
"      .filter(b => b.payment_status !== 'cancelled')\n" +
"      .reduce((sum, b) => sum + b.pax, 0);\n" +
"  });";

const replacementStr = "const totalPax = computed(() => {\n" +
"    return supabaseOrders.value\n" +
"      .filter(b => b.payment_status !== 'cancelled')\n" +
"      .reduce((sum, b) => {\n" +
"        const orderPax = b.order_items_v2 ? b.order_items_v2.reduce((acc, item) => acc + (item.pax_count || 0), 0) : 0;\n" +
"        return sum + orderPax;\n" +
"      }, 0);\n" +
"  });";

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file_path, content, 'utf8');
