<template>
  <Navbar :routerMode="false" @changeMap="toggleMap">
    <!-- <el-dropdown @command="handleAdd">
      <el-button type="primary"> 添加 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">点</el-dropdown-item>
          <el-dropdown-item command="B">线</el-dropdown-item>
          <el-dropdown-item command="C">面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="handleMod">
      <el-button type="primary"> 修改 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">点</el-dropdown-item>
          <el-dropdown-item command="B">线</el-dropdown-item>
          <el-dropdown-item command="C">面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="handleDel">
      <el-button type="primary"> 删除 </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="A">点</el-dropdown-item>
          <el-dropdown-item command="B">线</el-dropdown-item>
          <el-dropdown-item command="C">面</el-dropdown-item>
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
    </el-dropdown> -->
  </Navbar>
  <div class="map-wrapper">
    <div id="mapbox-container" class="map-container"  :style="{ zIndex: isMapbox ? '1' : '0' }"></div>
    <div id="cesium-container" class="map-container" :style="{ zIndex: isMapbox ? '0' : '1' }"></div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/navbar.vue'

import '/node_modules/mapbox-gl/dist/mapbox-gl.css'

import CreateMapBox from '@/map/mapbox'
import CreateCesium from '@/map/cesium'
import { mapboxToCesium, cesiumTomapbox } from '@/map/utils/transForm.js'

const isMapbox = ref(true)
let mapboxMap = null
let cesiumViewer = null
onMounted(() => {
  // 初始化Mapbox地图
  mapboxMap = new CreateMapBox('mapbox-container')

  // 初始化Cesium地图
  cesiumViewer = new CreateCesium('cesium-container')

  // 默认隐藏Cesium地图
  // cesiumViewer.instance.container.style.display = 'none'
})
const toggleMap = () => {
  isMapbox.value = !isMapbox.value
  if (isMapbox.value) {
    cesiumTomapbox(mapboxMap.instance, cesiumViewer.instance)
    // mapboxMap.instance.getContainer().style.display = 'block'
    // cesiumViewer.instance.container.style.display = 'none'
  } else {
    mapboxToCesium(mapboxMap.instance, cesiumViewer.instance)
    // mapboxMap.instance.getContainer().style.display = 'none'
    // cesiumViewer.instance.container.style.display = 'block'
    // cesiumViewer.instance.resize() // 确保Cesium地图正确渲染
  }
}
</script>

<!-- <script>
export default {
  data() {
    return {
      isMapbox: true,
      mapboxMap: null,
      cesiumViewer: null
    }
  },
  mounted() {
    // 初始化Mapbox地图
    mapboxMap = new CreateMapBox('mapbox-container')

    // 初始化Cesium地图
    this.cesiumViewer = new CreateCesium('cesium-container')

    // 默认隐藏Cesium地图
    this.cesiumViewer.instance.container.style.display = 'none'
  },
  methods: {
    toggleMap() {
      this.isMapbox = !this.isMapbox
      if (this.isMapbox) {
        this.mapboxMap.instance.getContainer().style.display = 'block'
        this.cesiumViewer.instance.container.style.display = 'none'
      } else {
        this.mapboxMap.instance.getContainer().style.display = 'none'
        this.cesiumViewer.instance.container.style.display = 'block'
        this.cesiumViewer.instance.resize() // 确保Cesium地图正确渲染
      }
    }
  }
}
</script> -->

<style lang="scss">
.map-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  .map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100vh;
}
}

</style>
