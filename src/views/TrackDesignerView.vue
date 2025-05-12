<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MapCanvas from '../components/MapCanvas.vue'
import PathPointsList from '../components/PathPointsList.vue'
import ExportPanel from '../components/ExportPanel.vue'
import ActionButtons from '../components/ActionButtons.vue'
import HelpText from '../components/HelpText.vue'
import BoundaryFileUpload from '../components/BoundaryFileUpload.vue'
import { defaultBoundaryData } from '../data/defaultBoundaryData'
import type { BoundaryData, PathPoint, MapBounds, BoundaryPoint } from '@/types/track-designer'
import { showAlert } from '@/types/track-designer'

// 状态管理
const state = reactive({
  boundaryData: null as BoundaryData | null,
  pathPoints: [] as PathPoint[],
  mapBounds: null as MapBounds | null,
})

const exportResult = ref('')
const helpVisible = ref(false)

// 事件处理函数
const handlePointAdded = (point: { lat: number, lng: number }) => {
  state.pathPoints.push({
    ...point,
    sortNum: state.pathPoints.length + 1
  })
}

const handlePointDeleted = (index: number) => {
  state.pathPoints.splice(index, 1)

  // 更新序号
  state.pathPoints.forEach((point, i) => {
    point.sortNum = i + 1
  })
}

const handlePointsReordered = (newPoints: PathPoint[]) => {
  state.pathPoints = newPoints
}

const handleBoundaryFileLoaded = (data: BoundaryData) => {
  state.boundaryData = data
  calculateBounds()
}

const clearPoints = () => {
  if (state.pathPoints.length === 0) return

  if (confirm('确定要清除所有路径点吗？')) {
    state.pathPoints = []
    exportResult.value = ''
  }
}

const sortPoints = () => {
  if (state.pathPoints.length <= 1) return

  // 基于空间位置重新排序 (按照经度排序)
  const sortedPoints = [...state.pathPoints].sort((a, b) => a.lng - b.lng)

  sortedPoints.forEach((point, index) => {
    point.sortNum = index + 1
  })

  state.pathPoints = sortedPoints
  showAlert('路径点已重新排序！', 'info')
}

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value
}

const exportJSON = () => {
  if (state.pathPoints.length === 0) {
    showAlert('没有可导出的路径点！', 'warning')
    return
  }

  // 按sortNum排序
  const sortedPoints = [...state.pathPoints].sort((a, b) => a.sortNum - b.sortNum)

  exportResult.value = JSON.stringify(sortedPoints, null, 2)

  // 创建下载
  const blob = new Blob([exportResult.value], { type: 'application/json' })
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

const copyToClipboard = () => {
  if (!exportResult.value) {
    showAlert('没有可复制的内容！', 'warning')
    return
  }

  navigator.clipboard.writeText(exportResult.value)
    .then(() => {
      showAlert('已复制到剪贴板！', 'info')
    })
    .catch(err => {
      showAlert(`复制失败: ${err}`, 'danger')
    })
}

// 计算边界
const calculateBounds = () => {
  if (!state.boundaryData || !state.boundaryData.paths?.length) return

  const paths = state.boundaryData.paths
  const lats = paths.map((p: BoundaryPoint) => p.lat)
  const lngs = paths.map((p: BoundaryPoint) => p.lng)

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  // 添加边界缓冲区
  const latBuffer = (maxLat - minLat) * 0.2
  const lngBuffer = (maxLng - minLng) * 0.2

  state.mapBounds = {
    minLat: minLat - latBuffer,
    maxLat: maxLat + latBuffer,
    minLng: minLng - lngBuffer,
    maxLng: maxLng + lngBuffer
  }
}

// 初始化
onMounted(() => {
  // 设置默认边界
  state.boundaryData = defaultBoundaryData
  calculateBounds()
})
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">PRTS 路径规划工具</span>
      </div>
    </nav>

    <div class="content-wrapper">
      <div class="container mt-4">
        <h1 class="mb-4">地图路径点标记工具</h1>

        <!-- 上传边界文件 -->
        <div class="card mb-4">
          <div class="card-body">
            <BoundaryFileUpload @file-loaded="handleBoundaryFileLoaded" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="d-flex flex-wrap gap-2 mb-4">
          <ActionButtons
            @clear-points="clearPoints"
            @export-points="exportJSON"
            @sort-points="sortPoints"
            @toggle-help="toggleHelp"
          />
        </div>

        <!-- 帮助信息 -->
        <HelpText :visible="helpVisible" />

        <div class="row g-4 mb-4">
          <!-- 地图画布 -->
          <div class="col-lg-8">
            <div class="card h-100">
              <div class="card-header bg-light">
                <h5 class="card-title mb-0">地图预览</h5>
              </div>
              <div class="card-body p-0">
                <MapCanvas
                  :boundary-data="state.boundaryData"
                  :path-points="state.pathPoints"
                  :map-bounds="state.mapBounds"
                  @point-added="handlePointAdded"
                />
              </div>
              <div class="card-footer text-muted small">
                点击地图添加路径点
              </div>
            </div>
          </div>

          <!-- 路径点列表 -->
          <div class="col-lg-4">
            <PathPointsList
              :points="state.pathPoints"
              @delete-point="handlePointDeleted"
              @reorder-points="handlePointsReordered"
            />
          </div>
        </div>

        <!-- 导出面板 -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0">导出结果</h5>
          </div>
          <div class="card-body">
            <ExportPanel
              v-model:export-result="exportResult"
              @copy-to-clipboard="copyToClipboard"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background-color: #f8f9fa;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.navbar {
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  padding-bottom: 2rem;
}

.container {
  max-width: 1320px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.card {
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
  width: 100%;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.03);
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0.75rem 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.h-100 {
  height: 100%;
}

/* 确保响应式设计正常工作 */
@media (max-width: 992px) {
  .col-lg-8, .col-lg-4 {
    width: 100%;
  }
}

@media (min-width: 992px) {
  .col-lg-8 {
    width: 66.666667%;
    float: left;
  }

  .col-lg-4 {
    width: 33.333333%;
    float: left;
  }
}

/* 确保行清除浮动 */
.row::after {
  content: "";
  clear: both;
  display: table;
}
</style>
