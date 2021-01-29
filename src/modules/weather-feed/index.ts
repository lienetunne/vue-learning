import { module } from './store'
import { StorefrontModule } from '@vue-storefront/core/lib/modules'

export const KEY = 'weather-feed'

export const WeatherFeed: StorefrontModule = function ({ store }) {
  store.registerModule(KEY, module)
}
