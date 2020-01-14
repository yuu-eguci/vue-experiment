<template>
  <div>
    This is <span class="pagename">PagesLayout</span>.
    <router-view />
  </div>
</template>

<script>

</script>

<style scoped>
  /* FIXME: こう書くと pageslayout の .pagename にだけ適用される。でもこれを外部ファイルから読み込む方法がわからない。 */
  .pagename {
    background-color: aquamarine;
  }

  /* こう import するとこのコンポーネントの他…… Index.vue とかでも適用されちゃう。なんでやねんバグでは? */
  /* @import '../assets/pageslayout.css'; */
</style>
