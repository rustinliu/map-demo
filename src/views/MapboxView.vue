<template>
  <Navbar> <div>1</div> </Navbar>
  <div id="mapboxContainer" class="map-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Navbar from '@/components/navbar.vue'
import '/node_modules/mapbox-gl/dist/mapbox-gl.css'

import { initMap, removeMap, CreateMap } from '@/map/mapbox'

let map = null
onMounted(() => {
  // initMap('mapboxContainer')
  map = new CreateMap('mapboxContainer', { center: [0, 0], zoom: 0 })
  map.flyTo()
})
onUnmounted(() => {
  // removeMap()
  map.removeMap()
})
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
