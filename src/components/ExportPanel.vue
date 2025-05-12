<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">导出结果</h5>
    </div>
    <div class="card-body">
      <textarea
        ref="exportTextarea"
        class="form-control"
        rows="8"
        readonly
        v-model="exportedJSON"
      ></textarea>
    </div>
    <div class="card-footer">
      <button
        class="btn btn-outline-secondary btn-sm"
        @click="copyToClipboard"
      >
        复制到剪贴板
      </button>
    </div>
  </div>

  <AlertMessage
    v-if="alert.show"
    :message="alert.message"
    :type="alert.type"
    :auto-hide="true"
    :duration="3000"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import AlertMessage from './AlertMessage.vue'
import type { AlertType } from '@/types'

const store = useTrackStore()
const exportTextarea = ref<HTMLTextAreaElement | null>(null)

// 警告消息状态
const alert = ref({
  show: false,
  message: '',
  type: 'info' as AlertType
})

// 导出的JSON字符串
const exportedJSON = computed(() => {
  if (store.pathPoints.length === 0) return ''
  return JSON.stringify(store.sortedPathPoints, null, 2)
})

// 复制到剪贴板
async function copyToClipboard() {
  if (!exportedJSON.value) {
    showAlert('没有可复制的内容！', 'warning')
    return
  }

  try {
    await navigator.clipboard.writeText(exportedJSON.value)
    showAlert('已复制到剪贴板！', 'info')
  } catch (err) {
    showAlert('复制失败！', 'danger')
    console.error('复制到剪贴板失败:', err)
  }
}

// 显示警告消息
function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }

  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}
</script>

<style scoped>
textarea {
  font-family: monospace;
}
</style>
