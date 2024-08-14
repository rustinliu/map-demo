<template>
  <div class="map-wrapper">
    <MapboxMap ref="mapboxRef" :visible="currMap === 'mapbox'" @leftClick="handleleftClick" @rightClick="handleRightClick" />
    <CesiumMap ref="cesiumRef" :visible="currMap === 'cesium'" @leftClick="handleleftClick" @rightClick="handleRightClick" />
  </div>
</template>
<script setup>
import { watch, ref, toRef } from 'vue'
import * as turf from '@turf/turf'

import MapboxMap from './components/MapboxMap.vue'
import CesiumMap from './components/CesiumMap.vue'

import { mapboxToCesium, cesiumTomapbox } from '@/map/utils/transForm.js'
import { mapboxOptions, cesiumOptions } from './options.js'

const mapboxRef = ref(null)
const cesiumRef = ref(null)
const geojsonIdList = {}

const props = defineProps({
  currMap: {
    type: String,
    default: 'mapbox',
    validator: (t) => {
      if (['mapbox', 'cesium'].includes(t)) {
        return true
      } else {
        console.error('currMap值错误，请传入正确的地图类型')
        return false
      }
    }
  },
  defaultGeoOptions: {
    type: Object,
    default: {
      mapbox: mapboxOptions,
      cesium: cesiumOptions
    }
  }
})

watch(
  // 位置方向变化切换时同步地图
  () => props.currMap,
  (newVal, oldVal) => {
    if (newVal === 'mapbox' && oldVal === 'cesium') {
      cesiumTomapbox(mapboxRef.value.instance, cesiumRef.value.instance)
    }
    if (newVal === 'cesium' && oldVal === 'mapbox') {
      mapboxToCesium(mapboxRef.value.instance, cesiumRef.value.instance)
    }
  }
)

const addGeoJSON = (geoJSON, id, options = {}) => {
  let type = geoJSON.features.length && geoJSON.features[0].geometry.type

  let createId = id || type
  if (Object.keys(geojsonIdList).includes(createId)) return console.error('id已存在，无法新增')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.addGeojsonToMap(createId, geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.addGeojsonToMap(createId, geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  geojsonIdList[createId] = geoJSON
  if (!createId) return type
}

const updateGeoJSON = (geoJSON, id, options = {}) => {
  let type = geoJSON.features.length && geoJSON.features[0].geometry.type

  let updateId = id || type
  if (!Object.keys(geojsonIdList).includes(updateId)) return console.error('id不存在，无法修改')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.modGeojsonInMap(updateId, geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.modGeojsonInMap(updateId, geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  geoJSON && (geojsonIdList[updateId] = geoJSON)
  if (!updateId) return type
}

const removeGeoJSON = (id) => {
  if (!Object.keys(geojsonIdList).includes(id)) return console.error('id不存在，无法删除')
  mapboxRef.value.delGeojsonInMap(id)
  cesiumRef.value.delGeojsonInMap(id)
  delete geojsonIdList[id]
}

let isDraw = false
let drawId = ''
let drawType = ''
let drawJSON = null
let drawOption = null
let drawPostion = ''
let drawTemList = []
const drawGeoJSON = (type, id, options = {}) => {
  if (isDraw) handleRightClick(true)
  if (!['Point', 'LineString', 'Polygon'].includes(type)) return console.error('type错误')
  drawId = id || 'draw' + type
  drawType = type
  drawOption = {}
  drawOption.mapbox = options.mapbox ? options.mapbox : props.defaultGeoOptions.mapbox[type]
  drawOption.cesium = options.cesium ? options.cesium : props.defaultGeoOptions.cesium[type]
  if (geojsonIdList[drawId]) {
    drawJSON = geojsonIdList[drawId]
    drawPostion = drawJSON.features.length
  } else {
    drawJSON = {
      type: 'FeatureCollection',
      features: []
    }
    drawPostion = 0
    addGeoJSON(drawJSON, drawId, drawOption)
  }

  drawTemList = []
  mapboxRef.value.drawfigureStart(type)
  cesiumRef.value.drawfigureStart(type)
  isDraw = true
}
const drawDashline = (latestPoint) => {
  cesiumRef.value.drawDashLine(latestPoint)
  mapboxRef.value.drawDashLine(latestPoint)
}
const handleleftClick = (geopoint) => {
  if (drawType === 'Point') {
    const Point = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: geopoint
      }
    }
    drawJSON.features.push(Point)
  }
  if (drawType === 'LineString') {
    drawTemList.push(geopoint)
    drawDashline(geopoint)
    if (drawTemList.length > 1) {
      const LineString = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: drawTemList
        }
      }
      drawJSON.features[drawPostion] = LineString
    }
  }
  if (drawType === 'Polygon') {
    drawTemList.push(geopoint)
    if (drawTemList.length > 2) {
      const points = turf.featureCollection(drawTemList.map((item) => turf.point(item)))
      const Polygon = turf.convex(points)
      drawJSON.features[drawPostion] = Polygon
    }
  }
  updateGeoJSON(drawJSON, drawId, drawOption)
}

const handleRightClick = (endAll) => {
  drawId = ''
  drawType = ''
  drawJSON = null
  drawOption = null
  drawPostion = ''
  drawTemList = []
  if (props.currMap === 'mapbox' && !endAll) cesiumRef.value.drawfigureEnd()
  if (props.currMap === 'cesium' && !endAll) mapboxRef.value.drawfigureEnd()
  if (endAll) {
    cesiumRef.value.drawfigureEnd()
    mapboxRef.value.drawfigureEnd()
  }
  isDraw = false
}

defineExpose({
  geojsonIdList: toRef(() => geojsonIdList),
  addGeoJSON,
  updateGeoJSON,
  removeGeoJSON,
  drawGeoJSON
})
</script>

<style lang="scss" scoped>
.map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
