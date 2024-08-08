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
  <div id="mapboxContainer" class="map-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/navbar.vue'
import '/node_modules/mapbox-gl/dist/mapbox-gl.css'

import  CreateMap  from '@/map/mapbox'

let map = null
onMounted(() => {
  map = new CreateMap('mapboxContainer', { center: [0, 0], zoom: 0 })
  map.flyTo()
})
onUnmounted(() => {
  map.removeMap()
})

const handleAdd = (type) => {
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
          type: 'circle',
          paint: {
            'circle-color': '#4264fb',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
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
          type: 'line',
          paint: {
            'line-color': 'red',
            'line-width': 14
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          }
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
          type: 'fill',
          layout: {},
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5
          }
        }
      )
      break
  }
  map.flyTo({ center: [-90.3295, -0.6344], zoom: 7 })
}

const handleMod = (type) => {
  switch (type) {
    case 'A':
      map.modGeojsonInMap('points', {
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
                coordinates: [-91.3295, -0.6344]
              }
            }
          ]
        })
      break
    case 'B':
      map.modGeojsonInMap(
        'line',
        {},
        {
          paint: {
            'line-color': 'green'
          },
          layout: {}
        }
      )
      break
    case 'C':
      map.modGeojsonInMap(
        'polygon',
        {},
        {
          paint: {},
          layout: {
            visibility: 'none'
          }
        }
      )
      break
  }
}

const handleDel = (type) => {
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

const handleDraw = (type) => {
  switch (type) {
    case 'A':
      map.drawfigures('drawPoint', 'point', {
        paint: {
          'circle-color': '#4264fb',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      })
      break
    case 'B':
      map.drawfigures('drawLine', 'line', {
        paint: {
          'line-color': 'red',
          'line-width': 14
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      })
      break
    case 'C':
      map.drawfigures('drawPolygon', 'polygon', {
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      })
      break
  }
}
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
