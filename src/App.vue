<template>
  <div class="container">
    <h1 class="my-4">PRTS 地图路径点标记工具</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="input-group">
          <label class="input-group-text" for="boundaryFile">上传规则JSON:</label>
          <input
            type="file"
            class="form-control"
            id="boundaryFile"
            accept=".json"
            @change="handleFileSelect"
          >
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
        class="btn btn-warning me-2"
        @click="clearPoints"
      >
        清除所有点
      </button>
      <button
        class="btn btn-success me-2"
        @click="exportJSON"
      >
        导出JSON
      </button>
      <button
        class="btn btn-info"
        @click="toggleHelp"
      >
        使用帮助
      </button>
    </div>

    <div
      v-show="showHelp"
      class="alert alert-info mb-3"
      transition="fade"
    >
      <h5>使用说明:</h5>
      <ul>
        <li>点击地图添加路径点</li>
        <li>可以删除路径点或通过拖动表格行调整点的顺序</li>
        <li>通过上传JSON文件加载自定义边界</li>
        <li>点击导出JSON保存当前所有路径点</li>
      </ul>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div id="map-container">
          <MapCanvas />
        </div>
      </div>

      <div class="col-lg-4">
        <PointsTable />
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <ExportPanel ref="exportPanel" />
      </div>
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
import { ref } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import MapCanvas from '@/components/MapCanvas.vue'
import PointsTable from '@/components/PointsTable.vue'
import ExportPanel from '@/components/ExportPanel.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import type { AlertType } from '@/types'

const store = useTrackStore()
const exportPanel = ref<InstanceType<typeof ExportPanel> | null>(null)
const showHelp = ref(false)

// 警告消息状态
const alert = ref({
  show: false,
  message: '',
  type: 'info' as AlertType
})

// 处理文件选择
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (event) => {
    try {
      const jsonData = JSON.parse(event.target?.result as string)
      if (jsonData && jsonData.paths && Array.isArray(jsonData.paths)) {
        store.setBoundaryData(jsonData)
        store.calculateBounds()
        showAlert('边界数据加载成功！', 'success')
      } else {
        showAlert('无效的边界数据格式！', 'danger')
      }
    } catch (error) {
      showAlert(`解析JSON文件失败：${(error as Error).message}`, 'danger')
    }
  }

  reader.onerror = () => {
    showAlert('读取文件失败！', 'danger')
  }

  reader.readAsText(file)
}

// 清除所有点
function clearPoints() {
  if (store.pathPoints.length === 0) return

  if (confirm('确定要清除所有路径点吗？')) {
    store.clearAllPoints()
  }
}

// 导出JSON
function exportJSON() {
  if (store.pathPoints.length === 0) {
    showAlert('没有可导出的路径点！', 'warning')
    return
  }

  // 创建下载
  const exportData = JSON.stringify(store.sortedPathPoints, null, 2)
  const blob = new Blob([exportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)

  const a = document.createElement('a')
  a.href = url
  a.download = `track_${timestamp}.json`
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)

  showAlert('路径点已导出！', 'success')
}

// 重新排序路径点
function sortPoints() {
  if (store.pathPoints.length <= 1) return

  store.sortPointsByLongitude()
  showAlert('路径点已重新排序！', 'info')
}

// 切换帮助信息显示
function toggleHelp() {
  showHelp.value = !showHelp.value
}

// 显示警告消息
function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }

  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}
</script>

<style>
@import '@/assets/main.css';

.action-buttons {
  margin-bottom: 15px;
}
</style>
