const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, 'src/views/checkout/CheckoutView.vue');
let content = fs.readFileSync(file_path, 'utf8');

// Update booking object creation
content = content.replace(/experienceTitle: experience\.value\?\.title \|\| '[^']+',/g, "experienceTitle: 'Itinerario Wamani Multitour',");
content = content.replace(/experienceSlug: experience\.value\?\.slug,/g, "experienceSlug: 'cart',");

content = content.replace(/totalPrice: cartStore\.totalToPay,/g, "totalPrice: cartStore.totalToPay,\n        cartItems: JSON.parse(JSON.stringify(cartStore.items)),");

// Also there is a 'totalPrice: data.amount || cartStore.totalToPay,'
content = content.replace(/totalPrice: data\.amount \|\| cartStore\.totalToPay,/g, "totalPrice: data.amount || cartStore.totalToPay,\n            cartItems: JSON.parse(JSON.stringify(cartStore.items)),");

fs.writeFileSync(file_path, content, 'utf8');
console.log('Final booking objects updated!');
