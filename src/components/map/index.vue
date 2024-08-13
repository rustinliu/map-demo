<template>
  <div class="map-wrapper">
    <MapboxMap ref="mapboxRef" :visible="currMap === 'mapbox'" />
    <CesiumMap ref="cesiumRef" :visible="currMap === 'cesium'" />
  </div>
</template>
<script setup>
import { watch, ref, toRef } from 'vue'

import MapboxMap from './components/MapboxMap.vue'
import CesiumMap from './components/CesiumMap.vue'

import { mapboxToCesium, cesiumTomapbox } from '@/map/utils/transForm.js'
import { mapboxOptions , cesiumOptions } from './options.js'

const mapboxRef = ref(null)
const cesiumRef = ref(null)
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

const addGeoJSON = (geoJSON, id, options) => {
  // 目前要求geoJSON内数据的type一致,固定为 Point lineString polygon 这三种
  const type = geoJSON.type === 'FeatureCollection' ? geoJSON.features[0].geometry.type : geoJSON.geometry.type
  if (!['Point', 'LineString', 'Polygon'].includes(type)) return console.error('type错误')
  id = id || type
  if (geojsonIdList.includes(id)) return console.error('id已存在，无法新增')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.addGeojsonToMap(id, geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.addGeojsonToMap(id, geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  geojsonIdList.push(id)
  if (!id) return type
}

const updateGeoJSON = (geoJSON, id, options) => {
  // 目前要求geoJSON内数据的type一致,固定为 Point lineString polygon 这三种
  const type = geoJSON.type === 'FeatureCollection' ? geoJSON.features[0].geometry.type : geoJSON.geometry.type
  if (!['Point', 'LineString', 'Polygon'].includes(type)) return console.error('type错误')
  id = id || type
  if (!geojsonIdList.includes(id)) return console.error('id不存在，无法修改')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.modGeojsonInMap((id = type), geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.modGeojsonInMap((id = type), geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  if (!id) return type
}

const removeGeoJSON = (id) => {
  if (!geojsonIdList.includes(id)) return console.error('id不存在，无法删除')
  mapboxRef.value.delGeojsonInMap(id)
  cesiumRef.value.delGeojsonInMap(id)
  geojsonIdList.splice(geojsonIdList.indexOf(id), 1)
}

const drawGeoJSON = (type, id, options) => {
  if (!['Point', 'LineString', 'Polygon'].includes(type)) return console.error('type错误')
  mapboxRef.value.drawfigures(id =  id || 'draw' + type, type, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.drawfigures(id =  id || 'draw' + type, type, options?.cesium || props.defaultGeoOptions.cesium[type])
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
