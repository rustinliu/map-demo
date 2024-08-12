<template>
  <div class="map-wrapper">
    <MapboxMap ref="mapboxRef" :visible="currMap === 'mapbox'" />
    <CesiumMap ref="cesiumRef" :visible="currMap === 'cesium'" />
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'

import MapboxMap from './components/MapboxMap.vue'
import CesiumMap from './components/CesiumMap.vue'
import { watch, ref } from 'vue'
import { mapboxToCesium, cesiumTomapbox } from '@/map/utils/transForm.js'

const mapboxRef = ref(null)
const cesiumRef = ref(null)

const cesiumOptions = {
  Point: {
    // 点属性，另有 markerSymbol markerColor
    markerColor: Cesium.Color.CRIMSON
  }
}
const mapboxOptions = {
  Point: {
    type: 'circle',
    paint: {
      'circle-color': '#4264fb',
      'circle-radius': 8,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff'
    }
  }
}

const geojsonIdList = []
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

const addGeoJSON = (geoJSON, id, options) => {
  // 目前要求geoJSON内数据的type一致,固定为 Point lineString polygon 这三种
  const type = geoJSON.features[0].geometry.type
  id = id || type
  if(geojsonIdList.includes(id)) return console.error('id已存在，无法新增')
  if (geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.addGeojsonToMap(id, geoJSON, (options?.mapbox) || mapboxOptions[type])
  cesiumRef.value.addGeojsonToMap(id, geoJSON, (options?.cesium) || cesiumOptions[type])
  geojsonIdList.push(id)
  if (!id) return type
}

const updateGeoJSON = (geoJSON, id, options) => {
  // 目前要求geoJSON内数据的type一致,固定为 Point lineString polygon 这三种
  const type = geoJSON.features[0].geometry.type
  id = id || type
  if(!geojsonIdList.includes(id)) return console.error('id不存在，无法修改')
  if (geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.modGeojsonInMap((id = type), geoJSON, (options?.mapbox) || mapboxOptions[type])
  cesiumRef.value.modGeojsonInMap((id = type), geoJSON, (options?.cesium) || cesiumOptions[type])
  if (!id) return type
}

const removeGeoJSON = (id) => {
  if(!geojsonIdList.includes(id)) return console.error('id不存在，无法删除')
  mapboxRef.value.delGeojsonInMap(id)
  cesiumRef.value.delGeojsonInMap(id)
  geojsonIdList.splice(geojsonIdList.indexOf(id), 1)
}

defineExpose({
  addGeoJSON,
  updateGeoJSON,
  removeGeoJSON
})
</script>

<style lang="scss" scoped>
.map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
