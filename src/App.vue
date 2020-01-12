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
    <!-- As want to use common component, practice using footer. -->
    <Footer msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// ここでインポートして、
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Footer  // ここで template 内で使う許可を得て、ほんで template 内で使うという流れっぽい。
  }
}
</script>

<style>
</style>
