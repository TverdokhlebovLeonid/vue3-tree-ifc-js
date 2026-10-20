import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/assets/style/index.sass'
import 'element-plus/dist/index.css'
import {
  Box,
  Coin,
  Coordinate,
  Failed,
  FullScreen,
  Refresh,
  Upload,
} from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const icons = { Box, Coin, Coordinate, Failed, FullScreen, Refresh, Upload }

app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.mount('#app')
