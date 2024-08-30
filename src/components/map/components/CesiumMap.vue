<template>
  <div id="cesiumContainer" class="cesiumContainer" :style="{ zIndex: visible ? 1 : 0 }"></div>
</template>

<script setup>
import CreateCesium from '@/map/cesium'

import { onMounted, onUnmounted, ref, toRef, watchEffect } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
let cesiumMap = null
onMounted(() => {
  // 初始化Cesium地图
  cesiumMap = new CreateCesium('cesiumContainer')
  // cesiumMap.instance.container.style.display = props.visible ? 'block' : 'none'
})

onUnmounted(() => {
  cesiumMap.removeMap()
})
// watchEffect(() => {
//   cesiumMap && (cesiumMap.instance.container.style.display = props.visible ? 'block' : 'none')
//   props.visible && cesiumMap && cesiumMap.instance.resize()
// })
const emit = defineEmits(['StartDraw', 'EndDraw', 'PickGeoJSON', 'StopPickGeoJSON', 'PickNode', 'StartMove', 'EndMove'])

const addGeojsonToMap = (id, geojson, options, isZoom) => cesiumMap.addGeojsonToMap(id, geojson, options, isZoom)
const modGeojsonInMap = (id, geojson, options, isReload) => cesiumMap.modGeojsonInMap(id, geojson, options, isReload)
const delGeojsonInMap = (id) => cesiumMap.delGeojsonInMap(id)
const drawfigures = (id, type, options) => cesiumMap.drawfigures(id, type, options)
const drawfigureStart = (type) =>
  cesiumMap.drawfigureStart(
    type,
    (geojson) => emit('StartDraw', geojson),
    () => emit('EndDraw')
  )
const drawfigureEnd = () => cesiumMap.drawfigureEnd()
const drawDashLine = (pointList) => cesiumMap.drawDashLine(pointList)
const drawDashPolygon = (pointList) => cesiumMap.drawDashPolygon(pointList)

const pickGeoJSON = () =>
  cesiumMap.pickGeoJSON(
    (data) => emit('PickGeoJSON', data),
    () => emit('StopPickGeoJSON')
  )
const endPickGeoJSON = () => cesiumMap.endPickGeoJSON()
const pickPosition = (geojson) =>
  cesiumMap.pickPosition(
    geojson,
    (data) => emit('PickNode', data),
    () => emit('StopPickNode')
  )
const endPickPosition = () => cesiumMap.endPickPosition()

const positionMoveStart = () => {
  cesiumMap.drawfigureStart(
    undefined,
    (geojson) => emit('StartMove', geojson),
    () => emit('EndMove'),
    true
  )
}
defineExpose({
  instance: toRef(() => cesiumMap.instance),
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
.cesiumContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
</style>
