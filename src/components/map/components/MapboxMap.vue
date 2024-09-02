<template>
  <div id="mapboxContainer" class="mapboxContainer" :style="{ zIndex: visible ? 1 : 0 }"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRef, watchEffect } from 'vue'

import '/node_modules/mapbox-gl/dist/mapbox-gl.css'
import CreateMapBox from '../utils/mapbox'

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
const emit = defineEmits(['StartDraw', 'EndDraw', 'PickGeoJSON', 'StopPickGeoJSON', 'PickNode', 'StartMove', 'EndMove'])

const addGeojsonToMap = (id, geojson, options) => mapboxMap.addGeojsonToMap(id, geojson, options)
const modGeojsonInMap = (id, geojson, options) => mapboxMap.modGeojsonInMap(id, geojson, options)
const delGeojsonInMap = (id) => mapboxMap.delGeojsonInMap(id)
const drawfigures = (id, type, options) => mapboxMap.drawfigures(id, type, options)
const drawfigureStart = (type) =>
  mapboxMap.drawfigureStart(
    type,
    (geojson) => emit('StartDraw', geojson),
    () => emit('EndDraw')
  )
const drawfigureEnd = () => mapboxMap.drawfigureEnd()
const drawDashLine = (pointList) => mapboxMap.drawDashLine(pointList)
const drawDashPolygon = (pointList) => mapboxMap.drawDashPolygon(pointList)

const pickGeoJSON = () =>
  mapboxMap.pickGeoJSON(
    (data) => emit('PickGeoJSON', data),
    () => emit('StopPickGeoJSON')
  )
const endPickGeoJSON = () => mapboxMap.endPickGeoJSON()
const pickPosition = (geojson) =>
  mapboxMap.pickPosition(
    geojson,
    (data) => emit('PickNode', data),
    () => emit('StopPickNode')
  )
const endPickPosition = () => mapboxMap.endPickPosition()
const positionMoveStart = () =>
  mapboxMap.drawfigureStart(
    undefined,
    (geojson) => emit('StartMove', geojson),
    () => emit('EndMove'),
    true
  )

defineExpose({
  instance: toRef(() => mapboxMap.instance),
  addGeojsonToMap,
  modGeojsonInMap,
  delGeojsonInMap,
  drawfigures,
  drawfigureStart,
  drawfigureEnd,
  drawDashLine,
  drawDashPolygon,
  pickGeoJSON,
  endPickGeoJSON,
  pickPosition,
  endPickPosition,
  positionMoveStart
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
