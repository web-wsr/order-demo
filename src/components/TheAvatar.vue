<script setup>
import userLogo from 'images/user_logo.svg'
const props = defineProps({
  size: {
    type: Number,
    default: 80
  },
  url: {
    type: String,
    default: null
  }
})
</script>
<template>
  <el-avatar class="the-avatar" :size="props.size" :src="props.url || userLogo"></el-avatar>
</template>

<style lang="less" scoped>
.the-avatar {
  :deep(img) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
