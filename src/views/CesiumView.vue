<template>
  <Navbar>
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
  <div id="cesiumContainer" class="map-container"></div>
</template>

<script setup>
import Navbar from '@/components/navbar.vue'

import { onMounted, onUnmounted } from 'vue'
import { CreateMap } from '@/map/cesium'

import * as Cesium from 'cesium'

let map = null

onMounted(() => {
  map = new CreateMap('cesiumContainer')
  map.flyTo(114.059453, 22.553224)
})

onUnmounted(() => {
  map.removeMap()
})

const handleAdd = function (type) {
  switch (type) {
    case 'A':
      map.addGeojsonToMap(
        'points',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-91.3952, -0.9145]
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-90.3295, -0.6344]
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-91.3403, 0.0164]
              }
            }
          ]
        },
        {
          // 点属性，另有 markerSymbol markerColor
          markerColor: Cesium.Color.CRIMSON
        }
      )
      break
    case 'B':
      map.addGeojsonToMap(
        'line',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-91.3952, -0.9145],
                  [-90.3295, -0.6344],
                  [-91.3403, 0.0164]
                ]
              }
            }
          ]
        },
        {
          // 线属性
          strokeWidth: 2,
          stroke: Cesium.Color.HOTPINK,
          clampToGround: true
        }
      )
      break
    case 'C':
      map.addGeojsonToMap(
        'polygon',
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-91.3952, -0.9145],
                [-90.3295, -0.6344],
                [-91.3403, 0.0164],
                [-91.3952, -0.9145]
              ]
            ]
          }
        },
        {
          // 面属性
          fill: Cesium.Color.PINK.withAlpha(0.5),
          stroke: Cesium.Color.TRANSPARENT,
          clampToGround: true
        }
      )
      break
  }
}

const handleMod = (type) => {
  switch (type) {
    case 'A':
      map.modGeojsonInMap(
        'points',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-91.3952, -0.9145]
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-90.3295, -0.6344]
              }
            }
          ]
        },
        {
          // 点属性，另有 markerSymbol markerColor
          markerColor: Cesium.Color.DARKSALMON
        }
      )
      break
    case 'B':
      map.modGeojsonInMap(
        'line',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-90.3952, -0.8145],
                  [-90.3295, -0.6344],
                  [-91.3403, 0.0164]
                ]
              }
            }
          ]
        },
        {
          // 线属性
          strokeWidth: 1,
          stroke: Cesium.Color.HOTPINK,
          clampToGround: true
        }
      )
      break
    case 'C':
      map.modGeojsonInMap(
        'polygon',
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-90.3952, -0.9145],
                [-89.3295, -0.6344],
                [-90.3403, 0.0164],
                [-90.3952, -0.9145]
              ]
            ]
          }
        },
        {
          // 面属性
          fill: Cesium.Color.DARKMAGENTA.withAlpha(0.5),
          stroke: Cesium.Color.TRANSPARENT,
          clampToGround: true
        }
      )
      break
  }
}

const handleDel = function (type) {
  switch (type) {
    case 'A':
      map.delGeojsonInMap('points')
      break
    case 'B':
      map.delGeojsonInMap('line')
      break
    case 'C':
      map.delGeojsonInMap('polygon')
      break
  }
}

const handleDraw = function (type) {
  switch (type) {
    case 'A':
      map.drawfigures('drawPoint', 'point', {
        // 点属性，另有 markerSymbol markerColor
        markerColor: Cesium.Color.DARKSALMON
      })
      break
    case 'B':
      map.drawfigures('drawLine', 'line', {
        // 线属性
        strokeWidth: 10,
        stroke: Cesium.Color.HOTPINK,
        clampToGround: true
      })
      break
    case 'C':
      map.drawfigures('drawPolygon', 'polygon', {
        // 面属性
        fill: Cesium.Color.DARKMAGENTA.withAlpha(0.5),
        stroke: Cesium.Color.TRANSPARENT,
        clampToGround: true
      })
      break
  }
}

//     //自定义图层
//     const esri = new Cesium.ArcGisMapServerImageryProvider({
//     url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
//     enablePickFeatures: false
//   })
//   //返回的是笛卡尔坐标   经纬度转笛卡尔坐标
//   //经度 纬度 高度
//   //响水县坐标
//   const Cartesian = Cesium.Cartesian3.fromDegrees(119.56985, 34.20513, 10000)
//   console.log(Cartesian, 'Cartesian')
//   //viewer是所有Api的开始
//   const viewer = new Cesium.Viewer('cesiumContainer', {
//     animation: false, //是否显示动画控件
//     baseLayerPicker: false, //是否显示图层选择控件
//     geocoder: false, //是否显示地名查找控件
//     timeline: false, //是否显示时间线控件
//     sceneModePicker: false, //是否显示投影方式控件
//     navigationHelpButton: false, //是否显示帮助信息控件
//     fullscreenButton: false, //是否显示全屏按钮
//     // infoBox: false, //是否显示点击要素之后显示的信息
//     homeButton: false, //是否显示Home按钮
//     // imageryProvider:esri,//自定义图层
//     terrainProvider: Cesium.createWorldTerrain({
//       requestWaterMask: true //水面特效
//       // requestVertexNormals: true
//     }) //地形图层也就是三维地图
//   })

//   //相机
//   viewer.camera.setView({
//     destination: Cartesian, //初始位置
//     orientation: {
//       //初始方向
//       heading: Cesium.Math.toRadians(-50), //初始方向
//       pitch: Cesium.Math.toRadians(-50), //初始方向
//       roll: Cesium.Math.toRadians(0)
//     }
//   })
// })
</script>

<style lang="scss" scoped>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
