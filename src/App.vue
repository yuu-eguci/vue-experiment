<template>
  <div id="app">
    <div id="header">
      <!-- Links. -->
      <router-link to="/">page1</router-link>
      <router-link to="/page2">page2</router-link>
      <router-link to="/page3">page3</router-link>
    </div>
    <!-- Place where components that are specified above will appear. -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
</style>
