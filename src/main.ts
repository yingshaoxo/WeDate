import { createApp } from 'vue'
import App from './App.vue'

import Vant from 'vant';
import 'vant/lib/index.css';

import { router } from '/@/store/router'

const app = createApp(App)
app.use(Vant)
app.use(router)
app.mount('#app')