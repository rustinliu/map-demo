<template>
  <Map :currMap="curr" ref="mapRef"></Map>
  <Navbar  :routerMode="false" @changeMap="toggleMap"><el-button @click="add">add</el-button></Navbar>
</template>

<script setup>

import samplePoint from '@/map/data/sample-point.json'

import {ref } from 'vue'
import Map from '@/components/map/index.vue'
import Navbar from '@/components/navbar.vue';

const curr = ref('mapbox')
const mapRef = ref(null)

const toggleMap = () => {
  curr.value = curr.value === 'mapbox' ? 'cesium' : 'mapbox'
}

const add = () => {
  mapRef.value.addGeoJSON(samplePoint.origin)
}

const mod = () =>{
  mapRef.value.modGeoJSon(samplePoint.origin)
}
</script>

<style lang="scss" scoped>

</style>