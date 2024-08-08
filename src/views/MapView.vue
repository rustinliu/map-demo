<template>
  <Navbar :routerMode="false" @changeMap="toggleMap">
    <el-dropdown @command="handleAdd">
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
    </el-dropdown>
  </Navbar>
  <div class="map-wrapper">
    <div id="mapbox-container" class="map-container" :style="{ zIndex: isMapbox ? '1' : '0' }"></div>
    <div id="cesium-container" class="map-container" :style="{ zIndex: isMapbox ? '0' : '1' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/navbar.vue'

import '/node_modules/mapbox-gl/dist/mapbox-gl.css'
import * as Cesium from 'cesium'

import CreateMapBox from '@/map/mapbox'
import CreateCesium from '@/map/cesium'
import { mapboxToCesium, cesiumTomapbox } from '@/map/utils/transForm.js'

import sampleLine from '@/map/data/sample-line.json'
import samplePoint from '@/map/data/sample-point.json'
import samplePolygon from '@/map/data/sample-polygon.json'
const sampleOptionMap = {
  cesium: {
    point: {
      add: {
        // 点属性，另有 markerSymbol markerColor
        markerColor: Cesium.Color.CRIMSON
      },
      mod: {
        // 点属性，另有 markerSymbol markerColor
        markerColor: Cesium.Color.DARKSALMON
      },
      draw: {
        // 点属性，另有 markerSymbol markerColor
        markerColor: Cesium.Color.DARKSALMON
      }
    },
    line: {
      add: {
        // 线属性
        strokeWidth: 2,
        stroke: Cesium.Color.HOTPINK,
        clampToGround: true
      },
      mod: {
        // 线属性
        strokeWidth: 1,
        stroke: Cesium.Color.HOTPINK,
        clampToGround: true
      },
      draw: {
        // 线属性
        strokeWidth: 10,
        stroke: Cesium.Color.HOTPINK,
        clampToGround: true
      }
    },
    polygon: {
      add: {
        // 面属性
        fill: Cesium.Color.PINK.withAlpha(0.5),
        stroke: Cesium.Color.TRANSPARENT,
        clampToGround: true
      },
      mod: {
        // 面属性
        fill: Cesium.Color.DARKMAGENTA.withAlpha(0.5),
        stroke: Cesium.Color.TRANSPARENT,
        clampToGround: true
      },
      draw: {
        // 面属性
        fill: Cesium.Color.DARKMAGENTA.withAlpha(0.5),
        stroke: Cesium.Color.TRANSPARENT,
        clampToGround: true
      }
    }
  },
  mapbox: {
    point: {
      add: {
        type: 'circle',
        paint: {
          'circle-color': '#4264fb',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      },
      mod: {},
      draw: {
        paint: {
          'circle-color': '#4264fb',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      }
    },
    line: {
      add: {
        type: 'line',
        paint: {
          'line-color': 'red',
          'line-width': 14
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      },
      mod: {
        paint: {
          'line-color': 'green'
        },
        layout: {}
      },
      draw: {
        paint: {
          'line-color': 'red',
          'line-width': 14
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      }
    },
    polygon: {
      add: {
        type: 'fill',
        layout: {},
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      },
      mod: {
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        },
        layout: {
          visibility: 'none'
        }
      },
      draw: {
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      }
    }
  }
}
const isMapbox = ref(true)
let mapboxMap = null
let cesiumViewer = null
let currMap = null
let currOptionMap = null

onMounted(() => {
  // 初始化Mapbox地图
  mapboxMap = new CreateMapBox('mapbox-container')

  // 初始化Cesium地图
  cesiumViewer = new CreateCesium('cesium-container')

  currMap = mapboxMap
  currOptionMap = sampleOptionMap.mapbox
})

onUnmounted(() => {
  mapboxMap.removeMap()
  cesiumViewer.removeMap()
})

const handleAdd = function (type) {
  switch (type) {
    case 'A':
      currMap.addGeojsonToMap('points', samplePoint.origin, currOptionMap.point.add)
      break
    case 'B':
      currMap.addGeojsonToMap('line', sampleLine.origin, currOptionMap.line.add)
      break
    case 'C':
      currMap.addGeojsonToMap('polygon', samplePolygon.origin, currOptionMap.polygon.add)
      break
  }
}

const handleMod = (type) => {
  switch (type) {
    case 'A':
      currMap.modGeojsonInMap('points', samplePoint.modified, currOptionMap.point.mod)
      break
    case 'B':
      currMap.modGeojsonInMap('line', sampleLine.modified, currOptionMap.line.mod)
      break
    case 'C':
      currMap.modGeojsonInMap('polygon', samplePolygon.modified, currOptionMap.polygon.mod)
      break
  }
}

const handleDel = function (type) {
  switch (type) {
    case 'A':
      currMap.delGeojsonInMap('points')
      break
    case 'B':
      currMap.delGeojsonInMap('line')
      break
    case 'C':
      currMap.delGeojsonInMap('polygon')
      break
  }
}

const handleDraw = function (type) {
  switch (type) {
    case 'A':
      currMap.drawfigures('drawPoint', 'point', currOptionMap.point.draw)
      break
    case 'B':
      currMap.drawfigures('drawLine', 'line', currOptionMap.line.draw)
      break
    case 'C':
      currMap.drawfigures('drawPolygon', 'polygon', currOptionMap.polygon.draw)
      break
  }
}

const toggleMap = () => {
  isMapbox.value = !isMapbox.value
  if (isMapbox.value) {
    cesiumTomapbox(mapboxMap.instance, cesiumViewer.instance)
    currMap = mapboxMap
    currOptionMap = sampleOptionMap.mapbox
  } else {
    mapboxToCesium(mapboxMap.instance, cesiumViewer.instance)
    currMap = cesiumViewer
    currOptionMap = sampleOptionMap.cesium
  }
}
</script>

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
