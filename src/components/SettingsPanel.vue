<template>
  <div class="card settings-panel">
    <div class="card-header bg-light">
      <h5 class="mb-0">采样设置</h5>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label for="sampleTime" class="form-label">采样时间间隔（秒）:</label>
        <input
          type="number"
          class="form-control"
          id="sampleTime"
          v-model="sampleTime"
          min="1"
          step="1"
          @change="updateSampleTime"
        />
        <div class="form-text">设置两个路径点之间的采样时间间隔，用于计算总时间</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTrackStore } from '@/stores/trackStore'

const store = useTrackStore()
const sampleTime = ref(store.sampleTimeInterval)

function updateSampleTime() {
  const time = parseInt(sampleTime.value.toString())
  if (isNaN(time) || time <= 0) {
    sampleTime.value = 10 // 恢复默认值
  }
  store.updateSampleTimeInterval(sampleTime.value)
}
</script>

<style scoped>
.settings-panel {
  min-height: 130px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
}

.form-text {
  font-size: 0.8rem;
  color: #6c757d;
}
</style>
