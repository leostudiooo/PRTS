<template>
  <div class="card mb-3">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <h5 class="mb-0">采样时间设置</h5>
      <span class="badge bg-info">预计总时间: {{ store.formattedTime }}</span>
    </div>
    <div class="card-body">
      <div class="input-group mb-2">
        <span class="input-group-text">采样时间间隔</span>
        <input
          type="number"
          class="form-control"
          min="1"
          max="3600"
          v-model="sampleInterval"
          @change="updateInterval"
        >
        <span class="input-group-text">秒</span>
      </div>
      <div class="form-text text-muted small">
        采样时间间隔是两个路径点之间的时间，总时间 = (路径点数量-1) × 采样时间间隔
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTrackStore } from '@/stores/trackStore'

const store = useTrackStore()
const sampleInterval = ref(store.sampleTimeInterval)

// 更新采样时间间隔
function updateInterval() {
  const interval = parseInt(sampleInterval.value.toString())
  if (isNaN(interval) || interval < 1) {
    sampleInterval.value = 1
  } else if (interval > 3600) {
    sampleInterval.value = 3600
  }

  store.updateSampleTimeInterval(sampleInterval.value)
}

// 当 store 中的值改变时更新本地值
watch(() => store.sampleTimeInterval, (newValue) => {
  sampleInterval.value = newValue
})
</script>
