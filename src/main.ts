import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { provideApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import { router } from './router'
import { apolloClient } from './app/providers/apollo'
import { apolloProvider } from './app/providers/apollo-provider'
import './app/styles/global.scss'
// Версия для слабовидящих — отдельным файлом после global, перекрывает компоненты.
import './app/styles/bvi.scss'
import { initBvi } from './features/bvi/useBvi'

const app = createApp(App)

// Apollo: провайдер ДО use, чтобы composables видели клиент.
provideApolloClient(apolloClient)

app.use(createPinia())
app.use(router)
app.use(apolloProvider)

// Версия для слабовидящих: восстанавливаем выбор посетителя до маунта.
initBvi()

app.mount('#app')
