import { mapGetters } from 'vuex'

export default {
  name: 'InstagramFeed',
  computed: {
    ...mapGetters({
      current: 'weather-feed/current',
      forecast: 'weather-feed/forecast'
    })
  }
}
