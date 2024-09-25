<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
const emits = defineEmits(['update'])
const props = defineProps({
  createdTime: {
    type: [String, Number],
    default: ''
  },
  format: {
    type: String,
    default: 'dd:hh'
  },
  formatUnit: {
    type: Array,
    default: () => ['天', '时']
  },
  showUnitText: {
    type: Boolean,
    default: false
  }
})
const state = reactive({
  isDayGapleft: false,
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
  countdown: '',
  timeout: false,
  timeoutClass: '',
  interval: null
})
onMounted(() => {
  const time = getTime(props.createdTime)
  state.countdown = getValue(time)
  handleCountdown()
})
onUnmounted(() => {
  clearInterval(state.interval)
})
const getTime = (created_time) => {
  created_time =
    typeof created_time == 'number' ? created_time : created_time && created_time.replace(/-/g, '/')
  const curtime = new Date().getTime()
  const pastTime = new Date(created_time).getTime()
  const isDecrease = pastTime - curtime > 0
  const dayGap = 3 * 24 * 60 * 60 * 1000
  const isDayGapleft = isDecrease && (pastTime - curtime) / dayGap < 1
  const decreaseTime = (pastTime - curtime) / 1000
  state.isDayGapleft = isDecrease && isDayGapleft
  return {
    isDecrease,
    isDayGapleft,
    decreaseTime
  }
}
const getValue = (time) => {
  if (time.isDecrease) {
    return valueFormat(time.decreaseTime)
  } else {
    state.timeout = true
    state.days = '-'
    state.hours = '-'
    state.minutes = '-'
    state.seconds = '-'
    state.timeoutClass = 'danger-color'
    emits('update')
    return '00:00'
  }
}
const valueFormat = (time) => {
  let days = timeFormat(parseInt(time / (60 * 60 * 24)))
  let hours = timeFormat(parseInt((time % (60 * 60 * 24)) / 3600))
  let minutes = timeFormat(parseInt(((time % (60 * 60 * 24)) % 3600) / 60))
  let seconds = timeFormat(parseInt(((time % (60 * 60 * 24)) % 3600) % 60))
  let result = hours + ':' + minutes + ':' + seconds
  state.days = days
  state.hours = hours
  state.minutes = minutes
  state.seconds = seconds
  switch (props.format) {
    case 'dd':
      result = days
      break
    case 'dd:hh:mm':
      result = days + ':' + hours + ':' + minutes
      break
    case 'dd:hh:mm:ss':
      result = days + ':' + hours + ':' + minutes + ':' + seconds
      break
    case 'hh:mm':
      result = hours + ':' + minutes
      break
    case 'hh:mm:ss':
      result = hours + ':' + minutes + ':' + seconds
      break
    default:
      break
  }
  return result
}
const timeFormat = (time) => {
  return time < 10 ? '0' + time : time
}
function handleCountdown() {
  state.interval = setInterval(() => {
    const time = getTime(props.createdTime)
    state.countdown = getValue(time)
    if (!time.isDecrease) {
      clearInterval(state.interval)
    }
  }, 1000)
}
</script>

<template>
  <div :class="['countdown', state.timeoutClass]">
    <template v-if="showUnitText">
      <div v-for="(item, index) of state.countdown.split(':')" :key="index" class="card-head-item">
        <span class="card-head-text">
          {{ item }}<span class="card-head-small-unit"> {{ formatUnit[index] }}</span></span
        >
        <span v-if="index !== state.countdown.split(':').length - 1" class="card-head-colon"
          >:</span
        >
      </div>
    </template>
    <template v-else>
      {{ state.countdown }}
    </template>
  </div>
</template>

<style lang="less" scoped>
.countdown {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  padding-top: 8px;
  margin-bottom: 8px;
  font-size: 36px;
  .card-head-item {
    display: flex;
    align-items: center;
  }
  .card-head-text {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 60px;
    font-size: 36px;
    font-weight: 600;
    line-height: 46px;
    text-align: center;
  }
  .card-head-small-unit {
    display: inline-block;
    height: 17px;
    line-height: 17px;
    font-weight: 600;
    font-size: 12px;
    &.card-head-small-unit--top {
      display: flex;
      justify-content: space-between;
      flex: none;
      width: 32px;
      align-self: flex-start;
    }
  }
}
</style>
