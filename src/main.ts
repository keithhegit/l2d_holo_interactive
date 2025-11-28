import { createApp } from 'vue'
import './index.css'
import router from './router'
import store from './store'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

registerSW({ immediate: true })
