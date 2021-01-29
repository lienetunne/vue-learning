import { extendStore, isServer } from '@vue-storefront/core/helpers';
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import Liked from './components/Liked.vue'; // Import the component
import { coreHooks } from '@vue-storefront/core/hooks'; // Import hooks from core

const examplePlugin = store => {
  store.subscribeAction((action, state) => {
    console.log(action.type)
    console.log(action.payload)
  })
}
const exampleRoutes = [{ name: 'liked', path: '/liked', component: Liked, alias: '/liked.html' }]; // compose the router we will use

const exampleModuleStore = {
  namespaced: true, // this means that store is encapsulated inside a module and not registered to global store.
  state: { // contains data object you want to track.
    key: null
  },
  plugins: ['examplePlugin']
}

const newProductModule = {
  state: {
    liked: false
  }
}

export const ExampleModule: StorefrontModule = function ({ app, store, router, moduleConfig, appConfig }) {
  store.registerModule('example-module', exampleModuleStore);
  extendStore('product', newProductModule);

  router.addRoutes(exampleRoutes) // adding routes here
  router.beforeEach((to, from, next) => { next() }) // navigation guards here

  coreHooks.afterAppInit(() => { //
    console.log('App has just been initialized')
  })
}
