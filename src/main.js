import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './Router/index.js'
import { createPinia } from 'pinia'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';


createApp(App)
.component('QuillEditor', QuillEditor)
.use(createPinia())
.use(router)
.mount('#app')
