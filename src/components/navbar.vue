<template>
  <div class="navbarWrapper">
    <el-switch
      style="--el-switch-on-color: #3a94f9; --el-switch-off-color: #21c764"
      v-model="mapType"
      size="large"
      inline-prompt
      active-text="cesium"
      inactive-text="mapbox"
      @change="handleMapChange"
      :loading="switchLoading"
    />
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let mapTypeValue = JSON.parse(sessionStorage.getItem('mapTypeValue'))
if (!mapTypeValue) {
  sessionStorage.setItem('mapTypeValue', false)
  mapTypeValue = false
}
const mapType = ref(mapTypeValue)
const switchLoading = ref(false)

async function handleMapChange() {
  switchLoading.value = true
  setTimeout(() => {
    sessionStorage.setItem('mapTypeValue', mapType.value)
    router.push(mapType.value ? '/cesium' : '/mapbox')
  }, 500)
}
</script>

<style lang="scss" scoped>
.navbarWrapper {
  z-index: 1;
  backdrop-filter: blur(5px);
  position: absolute;
  top: 0;
  left: 50%;
  height: 50px;
  margin-top: 20px;
  padding: 0 25px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  border-radius: 25px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  > :nth-child(n + 2) {
    margin-left: 20px;
  }
}
</style>
