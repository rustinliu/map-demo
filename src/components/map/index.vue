<template>
  <div class="map-wrapper">
    <MapboxMap
      ref="mapboxRef"
      :visible="currMap === 'mapbox'"
      @StartDraw="handleStartDraw"
      @EndDraw="handleEndDraw"
      @PickGeoJSON="handlePickGeoJSON"
      @StopPickGeoJSON="handleStopPickGeoJSON"
      @PickNode="handlePickNode"
      @StopPickNode="handleStopPickNode"
      @StartMove="handleStartMove"
      @EndMove="handleEndMove"
    />
    <CesiumMap
      ref="cesiumRef"
      :visible="currMap === 'cesium'"
      @StartDraw="handleStartDraw"
      @EndDraw="handleEndDraw"
      @PickGeoJSON="handlePickGeoJSON"
      @StopPickGeoJSON="handleStopPickGeoJSON"
      @PickNode="handlePickNode"
      @StopPickNode="handleStopPickNode"
      @StartMove="handleStartMove"
      @EndMove="handleEndMove"
    />
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
const geojsonIdMap = {}

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
const emit = defineEmits(['mapMessage', 'drawEnd', 'pickedData', 'pickPoint'])

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
  if (geoJSON && geoJSON.features && geoJSON.features.length) {
    geoJSON.features.forEach((item, index) => {
      item.properties.sortIndex = index
      item.properties.id = createId
    })
  }
  if (Object.keys(geojsonIdMap).includes(createId)) return console.error('id已存在，无法新增')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.addGeojsonToMap(createId, geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.addGeojsonToMap(createId, geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  geojsonIdMap[createId] = geoJSON
  if (!createId) return type
}

const updateGeoJSON = (geoJSON, id, options = {}) => {
  let type = geoJSON.features.length && geoJSON.features[0].geometry.type
  let updateId = id || type
  if (geoJSON && geoJSON.features && geoJSON.features.length) {
    geoJSON.features.forEach((item, index) => {
      item.properties.sortIndex = index
      item.properties.id = updateId
    })
  }
  if (!Object.keys(geojsonIdMap).includes(updateId)) return console.error('id不存在，无法修改')
  if (geoJSON.features && geoJSON.features.length > 1) {
    const index = geoJSON.features.findIndex((item) => item.geometry.type !== type)
    if (index !== -1) return console.error('geoJSON内数据的type不一致, 请检查')
  }
  mapboxRef.value.modGeojsonInMap(updateId, geoJSON, options?.mapbox || props.defaultGeoOptions.mapbox[type])
  cesiumRef.value.modGeojsonInMap(updateId, geoJSON, options?.cesium || props.defaultGeoOptions.cesium[type])
  geoJSON && (geojsonIdMap[updateId] = geoJSON)
  if (!updateId) return type
}

const removeGeoJSON = (id) => {
  if (!Object.keys(geojsonIdMap).includes(id)) return console.error('id不存在，无法删除')
  mapboxRef.value.delGeojsonInMap(id)
  cesiumRef.value.delGeojsonInMap(id)
  delete geojsonIdMap[id]
}

let drawParams = {
  isDraw: false,
  drawId: '',
  drawType: '',
  drawJSON: null,
  drawOption: null,
  drawPostion: null,
  drawTemList: []
}
const drawGeoJSON = (type, id, options = {}) => {
  if (drawParams.isDraw) handleEndDraw(true)
  if (!['Point', 'LineString', 'Polygon'].includes(type)) return console.error('type错误')
  drawParams.drawId = id || 'draw' + type
  drawParams.drawType = type
  drawParams.drawOption = {}
  drawParams.drawOption.mapbox = options.mapbox ? options.mapbox : props.defaultGeoOptions.mapbox[type]
  drawParams.drawOption.cesium = options.cesium ? options.cesium : props.defaultGeoOptions.cesium[type]
  if (geojsonIdMap[drawParams.drawId]) {
    drawParams.drawJSON = geojsonIdMap[drawParams.drawId]
    drawParams.drawPostion = options.drawPostion || drawParams.drawJSON.features.length
  } else {
    drawParams.drawJSON = {
      type: 'FeatureCollection',
      features: []
    }
    drawParams.drawPostion = 0
    addGeoJSON(drawParams.drawJSON, drawParams.drawId, drawParams.drawOption)
  }

  drawParams.drawTemList = options.drawTemList ? options.drawTemList : []
  mapboxRef.value.drawfigureStart(type)
  cesiumRef.value.drawfigureStart(type)
  // 解决修改时第一段没虚线的问题
  drawParams.drawTemList.length && handleStartDraw(options.drawTemList.pop())
  drawParams.isDraw = true
}
const drawDashLine = (latestPoint) => {
  cesiumRef.value.drawDashLine(latestPoint)
  mapboxRef.value.drawDashLine(latestPoint)
}
const drawDashPolygon = (points) => {
  cesiumRef.value.drawDashPolygon(points)
  mapboxRef.value.drawDashPolygon(points)
}
const handleStartDraw = (geopoint) => {
  if (drawParams.drawType === 'Point') {
    const Point = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: geopoint
      }
    }
    drawParams.drawJSON.features.push(Point)
  }
  if (drawParams.drawType === 'LineString') {
    drawParams.drawTemList.push(geopoint)
    drawDashLine(geopoint)
    if (drawParams.drawTemList.length > 1) {
      const LineString = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: drawParams.drawTemList
        }
      }
      if (pickParams.action === 'ADD') {
        pickParams.geoJSON.features[pickParams.index] = LineString
        pickParams.nodes = drawParams.drawTemList
      }
      drawParams.drawJSON.features[drawParams.drawPostion] = LineString
    }
  }
  if (drawParams.drawType === 'Polygon') {
    drawParams.drawTemList.push(geopoint)
    drawDashPolygon(drawParams.drawTemList)
    if (drawParams.drawTemList.length > 2) {
      const points = turf.featureCollection(drawParams.drawTemList.map((item) => turf.point(item)))
      const Polygon = turf.convex(points)
      if (pickParams.action === 'ADD') {
        pickParams.geoJSON.features[pickParams.index] = Polygon
        const coordinates = Polygon.geometry.coordinates
        pickParams.nodes = coordinates[0].slice(0, -1)
      }
      drawParams.drawJSON.features[drawParams.drawPostion] = Polygon
    }
  }
  updateGeoJSON(drawParams.drawJSON, drawParams.drawId, drawParams.drawOption)
}
const handleEndDraw = (endAll) => {
  pickParams.action && (pickParams.action = '')
  emit('drawEnd', drawParams.drawJSON)
  drawParams = {
    isDraw: false,
    drawId: '',
    drawType: '',
    drawJSON: null,
    drawOption: null,
    drawPostion: null,
    drawTemList: []
  }
  if (endAll) {
    cesiumRef.value.drawfigureEnd()
    mapboxRef.value.drawfigureEnd()
    return
  }
  props.currMap === 'mapbox' && cesiumRef.value.drawfigureEnd()
  props.currMap === 'cesium' && mapboxRef.value.drawfigureEnd()
}

let pickParams = {
  id: '',
  index: '',
  type: '',
  geoJSON: {},
  nodes: [],
  action: '',
  pickNodesIndex: ''
}
const pickGeoJSON = () => {
  mapboxRef.value.pickGeoJSON()
  cesiumRef.value.pickGeoJSON()
}
const handlePickGeoJSON = (payload) => {
  handleStopPickGeoJSON()
  let { id, index, type } = payload
  pickParams.id = id
  pickParams.index = index
  pickParams.type = type
  pickParams.geoJSON = geojsonIdMap[id]
  const coordinates = pickParams.geoJSON.features[index].geometry.coordinates
  pickParams.nodes = type === 'LineString' ? coordinates : coordinates[0].slice(0, -1)
  emit('pickedData', pickParams)
}
const handleStopPickGeoJSON = () => {
  mapboxRef.value.endPickGeoJSON()
  cesiumRef.value.endPickGeoJSON()
}
const pickPosition = (type) => {
  let geojson = {
    type: 'FeatureCollection',
    features: []
  }
  geojson.features = pickParams.nodes.map((item, index) => ({
    type: 'Feature',
    properties: {
      id: 'pickNode',
      sortIndex: index,
      position: item
    },
    geometry: {
      type: 'Point',
      coordinates: item
    }
  }))
  mapboxRef.value.pickPosition(geojson)
  cesiumRef.value.pickPosition(geojson)
  pickParams.action = type
}
const pickGeoJsonAdd = () => {
  console.log('pickParams', pickParams)
  pickParams.action = 'ADD'
  drawGeoJSON(pickParams.type, pickParams.id, {
    drawPostion: pickParams.index,
    drawTemList: JSON.parse(JSON.stringify(pickParams.nodes))
  })
}

const pickGeoJsonDel = () => pickPosition('DEL')

const pickGeoJsonMov = () => pickPosition('MOV')

const handlePickNode = (payload) => {
  handleStopPickNode()
  const { sortIndex } = payload
  pickParams.pickNodesIndex = sortIndex
  if (pickParams.action === 'DEL') {
    if (pickParams.type === 'LineString') {
      if (pickParams.nodes.length > 2) {
        pickParams.nodes.splice(payload.sortIndex, 1)
        pickParams.geoJSON.features[pickParams.index].geometry.coordinates = pickParams.nodes
        updateGeoJSON(pickParams.geoJSON, pickParams.id)
      } else {
        console.warn('构成LineString至少需要两个点，选中节点所在polyLine将被删除')
        emit('mapMessage', {
          module: 'editJson',
          type: 'warning',
          msg: '构成LineString至少需要两个点，选中节点所在polyLine将被删除'
        })
        if (pickParams.geoJSON.features.length > 1) {
          pickParams.geoJSON.features.splice(pickParams.index, 1)
          updateGeoJSON(pickParams.geoJSON, pickParams.id)
          stopEditGeoJSON()
          emit('pickedData', null)
        } else {
          removeGeoJSON(pickParams.id)
          stopEditGeoJSON()
          emit('pickedData', null)
        }
      }
    } else if (pickParams.type === 'Polygon') {
      if (pickParams.nodes.length > 3) {
        console.log('payload.sortIndex', payload.sortIndex)
        pickParams.nodes.splice(payload.sortIndex, 1)
        const points = turf.featureCollection(pickParams.nodes.map((item) => turf.point(item)))
        const Polygon = turf.convex(points)
        pickParams.geoJSON.features[pickParams.index] = Polygon
        updateGeoJSON(pickParams.geoJSON, pickParams.id)
      } else {
        console.warn('构成LPolygon至少需要三个点，选中节点所在Polygon将被删除')
        emit('mapMessage', {
          module: 'editJson',
          type: 'warning',
          msg: '构成LPolygon至少需要三个点，选中节点所在Polygon将被删除'
        })
        if (pickParams.geoJSON.features.length > 1) {
          pickParams.geoJSON.features.splice(pickParams.index, 1)
          updateGeoJSON(pickParams.geoJSON, pickParams.id)
          stopEditGeoJSON()
          emit('pickedData', null)
        } else {
          removeGeoJSON(pickParams.id)
          stopEditGeoJSON()
          emit('pickedData', null)
        }
      }
    }
    pickParams.action = ''
  }
  if (pickParams.action === 'MOV') {
    mapboxRef.value.positionMoveStart()
    cesiumRef.value.positionMoveStart()
    if (pickParams.type === 'LineString') {
    }
    if (pickParams.type === 'Polygon') {
      const tempList = JSON.parse(JSON.stringify(pickParams.nodes))
      tempList.splice(pickParams.pickNodesIndex, 1)
      drawDashPolygon(tempList)
    }
  }
}
const handleStopPickNode = () => {
  mapboxRef.value.endPickPosition()
  cesiumRef.value.endPickPosition()
}
const handleStartMove = (position) => {
  if (pickParams.type === 'LineString') {
  }
  if (pickParams.type === 'Polygon') {
    pickParams.nodes.splice(pickParams.pickNodesIndex, 1, position)
    const points = turf.featureCollection(pickParams.nodes.map((item) => turf.point(item)))
    const Polygon = turf.convex(points)
    pickParams.geoJSON.features[pickParams.index] = Polygon
    const coordinates = Polygon.geometry.coordinates
    pickParams.nodes = coordinates[0].slice(0, -1)
  }
  updateGeoJSON(pickParams.geoJSON, pickParams.id)
}
const handleEndMove = () => {
  pickParams.pickPosition = ''
  pickParams.pickNodesIndex = ''
  pickParams.action = ''
  props.currMap === 'mapbox' && cesiumRef.value.drawfigureEnd()
  props.currMap === 'cesium' && mapboxRef.value.drawfigureEnd()
}
const stopEditGeoJSON = () => {
  if (pickParams.action) handleStopPickNode()
  pickParams = {
    id: '',
    index: '',
    type: '',
    geoJSON: {},
    nodes: [],
    action: '',
    pickNodesIndex: ''
  }
}

defineExpose({
  geojsonIdMap: toRef(() => geojsonIdMap),
  addGeoJSON,
  updateGeoJSON,
  removeGeoJSON,
  drawGeoJSON,
  pickGeoJSON,
  pickGeoJsonAdd,
  pickGeoJsonDel,
  pickGeoJsonMov,
  stopEditGeoJSON
})
</script>

<style lang="scss" scoped>
.map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
