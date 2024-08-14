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
const emit = defineEmits(['leftClick', 'rightClick'])

const addGeojsonToMap = (id, geojson, options) => mapboxMap.addGeojsonToMap(id, geojson, options)
const modGeojsonInMap = (id, geojson, options) => mapboxMap.modGeojsonInMap(id, geojson, options)
const delGeojsonInMap = (id) => mapboxMap.delGeojsonInMap(id)
const drawfigures = (id, type, options) => mapboxMap.drawfigures(id, type, options)
const drawfigureStart = (type) =>
  mapboxMap.drawfigureStart(
    type,
    (geojson) => emit('leftClick', geojson),
    () => emit('rightClick')
  )
const drawfigureEnd = () => mapboxMap.drawfigureEnd()
const drawDashLine = (point) => mapboxMap.drawDashLine(point)

defineExpose({
  instance: toRef(() => mapboxMap.instance),
  addGeojsonToMap,
  modGeojsonInMap,
  delGeojsonInMap,
  drawfigures,
  drawfigureStart,
  drawfigureEnd,
  drawDashLine
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
