<template>
  <div id="mapboxContainer" class="mapboxContainer" :style="{ zIndex: visible ? 1 : 0 }"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRef, watchEffect } from 'vue'
import '/node_modules/mapbox-gl/dist/mapbox-gl.css'
import CreateMapBox from '@/map/mapbox'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
let mapboxMap = null
onMounted(() => {
  // 初始化Mapbox地图
  mapboxMap = new CreateMapBox('mapboxContainer')
  // mapboxMap.instance.getContainer().style.display = props.visible ? 'block' : 'none'
})
onUnmounted(() => {
  mapboxMap.removeMap()
})
// watchEffect(() => {
//   mapboxMap && (mapboxMap.instance.getContainer().style.display = props.visible ? 'block' : 'none')
// })

const addGeojsonToMap = (id, geojson, options) => mapboxMap.addGeojsonToMap(id, geojson, options)
const modGeojsonInMap = (id, geojson, options) => mapboxMap.modGeojsonInMap(id, geojson, options)
const delGeojsonInMap = (id) => mapboxMap.delGeojsonInMap(id)
const drawfigures = (id, type, options) => mapboxMap.drawfigures(id, type, options)

defineExpose({
  instance: toRef(() => mapboxMap.instance),
  addGeojsonToMap,
  modGeojsonInMap,
  delGeojsonInMap,
  drawfigures
})

</script>

<style lang="scss" scoped>
.mapboxContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
</style>
