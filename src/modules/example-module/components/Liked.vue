<template>
  <p>{{ greeting }} World and you {{ liked }}! </p>
</template>

<script>
module.exports = {
  data: function () {
    return {
      greeting: 'Hello',
      liked: 'Liked it'
    }
  }
}
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
