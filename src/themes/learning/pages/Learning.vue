<template>
  <div id="learning">
    {{ $t(`Bow Bow Bow`) }}
    <weather />
  </div>
</template>

<script>
import Weather from 'src/modules/weather-feed/components/Weather'

export default {
  name: 'Learning',
  components: {
    Weather
  }
}
</script>
<style lang="scss" scoped>

</style>
