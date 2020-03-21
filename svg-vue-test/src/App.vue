<template>
  <div id="app">
    <SvgDemo :width="width" :height="height" />
  </div>
</template>

<script>
import 'normalize.css'
import SvgDemo from './components/SvgDemo.vue'

export default {
  name: 'App',
  components: {
    SvgDemo
  },
  data: function () {
    return {
      width: window.innerWidth -100,
      height: window.innerHeight -100
    }
  },
  methods: {
    handleResize: function() {
      // resizeのたびにこいつが発火するので、ここでやりたいことをやる
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
  },
  mounted: function () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: #222222;
}
</style>
