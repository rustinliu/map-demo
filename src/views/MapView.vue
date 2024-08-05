<template>
  <div id="mapbox-container" class="map-container"></div>
  <div id="cesium-container" class="map-container"></div>
</template>

<script>
import '/node_modules/mapbox-gl/dist/mapbox-gl.css'

import CreateMapBox from '@/map/mapbox'
import CreateCesium from '@/map/cesium'

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
    this.mapboxMap = new CreateMapBox('mapbox-container')

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
</script>

<style lang="scss">
.map-container {
  width: 100%;
  height: 100%;
}
</style>
