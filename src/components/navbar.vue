<template>
  <div class="navbarWrapper" :class="position">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  position: {
    type: String,
    default: 'top'
  }
})

</script>

<style lang="scss" scoped>
.navbarWrapper {
  z-index: 2;
  backdrop-filter: blur(5px);
  position: absolute;
  left: 50%;
  height: 50px;
  padding: 0 25px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  border-radius: 25px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  > :nth-child(n + 2) {
    margin-left: 10px;
  }
  &.top {
    top: 0;
    margin-top: 20px;
  }
  &.bottom {
    bottom: 0;
    margin-bottom: 20px;
  }
}
</style>
