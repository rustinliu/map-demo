<template>
  <Map
    :currMap="curr"
    ref="mapRef"
    @drawEnd="handlDrawEnd"
    @pickedData="handlePickedData"
    @mapMessage="handleMessage"
  ></Map>
  <Navbar position="top">
    <el-switch
      style="--el-switch-on-color: #3a94f9; --el-switch-off-color: #21c764"
      v-model="curr"
      size="large"
      inline-prompt
      active-text="cesium"
      active-value="cesium"
      inactive-text="mapbox"
      inactive-value="mapbox"
    />
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
  <Navbar position="bottom">
    <el-button v-if="!curEditedInfo" @click="handleChoseEditData" type="primary">选择编辑图形</el-button>
    <div v-if="curEditedInfo" style="flex-shrink: 0">{{ curEditedInfo.id }}:</div>
    <el-button v-if="curEditedInfo" type="primary" @click="handlePickGeoJsonAdd">添加节点</el-button>
    <el-button v-if="curEditedInfo" type="primary" @click="handlePickGeoJsonDel">删除节点</el-button>
    <el-button v-if="curEditedInfo" type="primary" @click="handlePickGeoJsonMov">移动节点</el-button>
    <el-button @click="handleStopEditData" v-if="curEditedInfo" type="danger">退出编辑</el-button>
  </Navbar>
</template>

<script setup>
// Elmessage样式
import 'element-plus/es/components/message/style/css'
import { ref } from 'vue'

import samplePoint from '@/components/map/utils/exampleData/sample-point.json'
import sampleLine from '@/components/map/utils/exampleData/sample-line.json'
import samplePolygon from '@/components/map/utils/exampleData/sample-polygon.json'

import Map from '@/components/map/index.vue'
import Navbar from '@/components/navbar.vue'

const curr = ref('mapbox')
const mapRef = ref(null)

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
  ElMessage({
    type: 'success',
    message: '点击左键确认坐标，点击右键退出绘制，绘制中途可切换地图查看',
    offset: 70,
    showClose: true,
    duration: 2000
  })
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

const handlDrawEnd = function (drawJSON) {
  console.log('geoJSON', drawJSON)
}

const handleMessage = (payLoad) => {
  const { modules, msg, type } = payLoad
  ElMessage({
    type,
    message: msg,
    offset: 70,
    duration: 1500
  })
}

const curEditedInfo = ref(null)
const handlePickedData = function (data) {
  curEditedInfo.value = data
}
const handleStopEditData = () => {
  curEditedInfo.value = null
  mapRef.value.stopEditGeoJSON()
}

const handlePickGeoJsonAdd = () => {
  ElMessage({
    type: 'success',
    message: '左键选择添加坐标，右键退出添加模式',
    offset: 70,
    showClose: true,
    duration: 2000
  })
  mapRef.value.pickGeoJsonAdd()
}

const handlePickGeoJsonDel = () => {
  ElMessage({
    type: 'success',
    message: '左键选择删除节点，右键退出删除模式',
    offset: 70,
    showClose: true,
    duration: 2000
  })
  mapRef.value.pickGeoJsonDel()
}
const handlePickGeoJsonMov = () => {
  ElMessage({
    type: 'success',
    message: '左键选择移动节点，右键退出移动模式',
    offset: 70,
    showClose: true,
    duration: 2000
  })
  mapRef.value.pickGeoJsonMov()
}
const handleChoseEditData = () => {
  mapRef.value.pickGeoJSON()
}
</script>

<style lang="scss" scoped></style>
