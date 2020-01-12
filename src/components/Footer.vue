<template>
    <footer>
      <p>
        {{ msg }}
      </p>
    </footer>
</template>

<script>
export default {
  // これ何のために要るのかわからん。わかるまでコメントアウト。
  // name: 'footer',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
