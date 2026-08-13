import { createApp } from 'vue'
import App from './App.vue'
import router from '@/app/router'
import { pinia } from '@/app/providers/pinia'

// Importar SCSS Global (que incluye Bootstrap y variables)
import '@/assets/styles/main.scss'

// Importar JS de Bootstrap (solo lo necesario o todo por ahora para MVP)
import 'bootstrap'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
