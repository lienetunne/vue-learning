<template>
  <div id="learning">
    {{ $t(`Bow Bow Bow`) }}
    <weather />
  </div>
</template>

<script>
import Weather from 'theme/components/theme/Weather'
import { isServer, onlineHelper } from '@vue-storefront/core/helpers'

export default {
  name: 'Learning',
  components: {
    Weather
  },
  beforeRouteEnter (to, from, next) {
    if (!isServer && !from.name) {
      next(vm => {
        vm.$store.dispatch('weather-feed/getCurrent')
        vm.$store.dispatch('weather-feed/getForecast')
      })
    } else {
      next()
    }
  },
  async asyncData ({ store, route }) {
    await Promise.all([
      store.dispatch('weather-feed/getCurrent'),
      store.dispatch('weather-feed/getForecast')
    ])
  }
}
</script>
<style lang="scss" scoped>

</style>
