<template>
  <Map :currMap="curr" ref="mapRef" @drawEnd="handlDrawEnd"></Map>
  <Navbar :routerMode="false" @changeMap="toggleMap">
    <el-dropdown @command="handleAdd">
      <el-button type="primary"> 添加 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">示例点</el-dropdown-item>
          <el-dropdown-item command="B">示例线</el-dropdown-item>
          <el-dropdown-item command="C">示例面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="handleMod">
      <el-button type="primary"> 修改 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">示例点</el-dropdown-item>
          <el-dropdown-item command="B">示例线</el-dropdown-item>
          <el-dropdown-item command="C">示例面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="handleDel">
      <el-button type="primary"> 删除 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">示例点</el-dropdown-item>
          <el-dropdown-item command="B">示例线</el-dropdown-item>
          <el-dropdown-item command="C">示例面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="handleDraw">
      <el-button type="primary"> 鼠标绘制 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">点</el-dropdown-item>
          <el-dropdown-item command="B">线</el-dropdown-item>
          <el-dropdown-item command="C">面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </Navbar>
</template>

<script setup>
// Elmessage样式
import 'element-plus/es/components/message/style/css'
import { ref } from 'vue'

import samplePoint from '@/map/data/sample-point.json'
import sampleLine from '@/map/data/sample-line.json'
import samplePolygon from '@/map/data/sample-polygon.json'

import Map from '@/components/map/index.vue'
import Navbar from '@/components/navbar.vue'

const curr = ref('mapbox')
const mapRef = ref(null)

const toggleMap = () => {
  curr.value = curr.value === 'mapbox' ? 'cesium' : 'mapbox'
}

const handleAdd = (type) => {
  switch (type) {
    case 'A':
      mapRef.value.addGeoJSON(samplePoint.origin)
      break
    case 'B':
      mapRef.value.addGeoJSON(sampleLine.origin)
      break
    case 'C':
      mapRef.value.addGeoJSON(samplePolygon.origin)
      break
  }
}

const handleMod = (type) => {
  switch (type) {
    case 'A':
      mapRef.value.updateGeoJSON(samplePoint.modified)
      break
    case 'B':
      mapRef.value.updateGeoJSON(sampleLine.modified)
      break
    case 'C':
      mapRef.value.updateGeoJSON(samplePolygon.modified)
      break
  }
}

const handleDel = (type) => {
  switch (type) {
    case 'A':
      mapRef.value.removeGeoJSON('Point')
      break
    case 'B':
      mapRef.value.removeGeoJSON('LineString')
      break
    case 'C':
      mapRef.value.removeGeoJSON('Polygon')
      break
  }
}

const handleDraw = function (type) {
  ElMessage({type:'success',message:'点击左键确认坐标，点击右键退出绘制，绘制中途可切换地图查看', offset:70})
  switch (type) {
    case 'A':
      mapRef.value.drawGeoJSON('Point')
      break
    case 'B':
      mapRef.value.drawGeoJSON('LineString')
      break
    case 'C':
      mapRef.value.drawGeoJSON('Polygon')
      break
  }
}
</script>

<style lang="scss" scoped></style>
