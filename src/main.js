import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './Router/index.js'
import { createPinia } from 'pinia'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";


createApp(App)
.use(Toast,{
    position: "top-center",
    timeout: 1041,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  })
.component('QuillEditor', QuillEditor)
.use(createPinia())
.use(router)
.mount('#app')
