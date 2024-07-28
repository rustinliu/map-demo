<template>
  <Navbar>
    <div>2</div>
  </Navbar>
  <div ref="cesiumContainer" id="cesiumContainer" class="map-container"></div>
</template>

<script setup>
import Navbar from '@/components/navbar.vue'

import { onMounted, ref } from 'vue'
import * as Cesium from 'cesium'
console.log(Cesium, 'CesiumCesium')
const cesiumContainer = ref()

onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NTFlYTU2Yy0yMTNjLTQ1NTctYTU1Ni1jZGQ4MmFmZjc5MjIiLCJpZCI6MSwiaWF0IjoxNDc3NTczOTIwfQ.1gbexTCjsfXeo7HEdUzh7NAIdwbVXVnB_EQr1F9dpf0'
  // Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
  const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: false, // 是否显示图层选择器:将图层选择的控件关掉，才能添加其他影像数据
    terrainProvider: new Cesium.EllipsoidTerrainProvider(), // 地形图层提供者，仅baseLayerPicker设为false有意义
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false
  })
  // 显示帧数
  viewer.scene.debugShowFramesPerSecond = true
  //取消版权信息
  viewer._cesiumWidget._creditContainer.style.display = 'none'
  // Add Cesium OSM Buildings, a global 3D buildings layer.
  /* const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings()); */
  // Fly the camera to San Francisco at the given longitude, latitude, and height.
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(114.059453, 22.553224, 250600)
  })
})
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
