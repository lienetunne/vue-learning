<template>
  <div class="breadcrumbs h5 cl-gray">
    <span v-for="link in paths" :key="link.route_link">
      <router-link :to="link.route_link">
        {{ link.name | htmlDecode }}
      </router-link>
      <span class="material-icons separator">
        keyboard_arrow_right
      </span>
    </span>
    <span class="cl-mine-shaft current">
      {{ current | htmlDecode }}
    </span>
  </div>
</template>

<script>
import { Breadcrumbs } from '@vue-storefront/core/modules/breadcrumbs/components/Breadcrumbs.ts'

export default {
  mixins: [Breadcrumbs]
}
</script>
<style lang="scss" scoped>
.current {
  font-weight: 700;
  color: #4F4F4F;
}
</style>
