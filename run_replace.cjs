const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, 'src/views/checkout/CheckoutView.vue');
let content = fs.readFileSync(file_path, 'utf8');

const oldPattern = /<div class="d-flex gap-3 mb-4 align-items-center">[\s\S]*?<div class="d-flex justify-content-between mb-2 small">\s*<span class="text-white opacity-75">N[^\<]*mero de viajeros:<\/span>\s*<span class="fw-bold text-accent">[^\<]+<\/span>\s*<\/div>/;

const newHTML = fs.readFileSync('newDesktopSummary.html', 'utf8');

if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newHTML);
    content = content.replace(/\{\{ formatPrice\(totalPrice\) \}\}/g, '{{ formatPrice(cartStore.totalToPay) }}');
    fs.writeFileSync(file_path, content, 'utf8');
    console.log('REPLACEMENT SUCCESSFUL');
} else {
    console.log('PATTERN NOT FOUND');
}
