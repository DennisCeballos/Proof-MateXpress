import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import '@/assets/css/main.css'
import './input.css'
import VueLatex from 'vatex'

createApp(App)
    .use(store)
    .use(router)
    .use(VueLatex)
    .mount('#app')

