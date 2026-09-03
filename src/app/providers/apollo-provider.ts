// Vue-плагин для Apollo Client.
// В main.ts:
//   import { provideApolloClient } from '@vue/apollo-composable'
//   provideApolloClient(apolloClient)
//   app.use(apolloProvider)
//   app.mount(...)

import type { App } from 'vue'
import { DefaultApolloClient, ApolloClients } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

export const apolloProvider = {
  install(app: App) {
    app.provide(DefaultApolloClient, apolloClient)
    app.provide(ApolloClients, { default: apolloClient })
  },
}
