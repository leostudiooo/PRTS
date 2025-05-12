<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
// 从 npm 包中导入 Sortable
import Sortable from 'sortablejs'
import type { PathPoint } from '@/types/track-designer'

const props = defineProps<{
  points: PathPoint[]
}>()

const emit = defineEmits<{
  (e: 'deletePoint', index: number): void
  (e: 'reorderPoints', newPoints: PathPoint[]): void
}>()

const deletePoint = (index: number) => {
  emit('deletePoint', index)
}

// 设置拖拽排序
onMounted(() => {
  nextTick(() => {
    setupSortable()
  })
})

const setupSortable = () => {
  const tbody = document.getElementById('pointsTableBody')
  if (!tbody) return

  // 直接使用导入的 Sortable
  new Sortable(tbody, {
    animation: 150,
    onEnd: () => {
      // 重新排序
      const rows = Array.from(tbody.querySelectorAll('tr'))
      const newOrder = rows.map(row => parseInt(row.dataset.index || '0'))

      // 创建排序后的新数组
      const newPoints: PathPoint[] = []
      newOrder.forEach((oldIndex, newIndex) => {
        const point = { ...props.points[oldIndex] }
        point.sortNum = newIndex + 1
        newPoints.push(point)
      })

      emit('reorderPoints', newPoints)
    }
  })
}
</script>

<template>
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">已添加路径点列表</h5>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table id="pointsTable" class="table table-sm table-hover">
          <thead>
            <tr>
              <th>序号</th>
              <th>纬度</th>
              <th>经度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="pointsTableBody">
            <tr v-for="(point, index) in points" :key="index" class="point-item" :data-index="index">
              <td>{{ point.sortNum }}</td>
              <td>{{ point.lat.toFixed(6) }}</td>
              <td>{{ point.lng.toFixed(6) }}</td>
              <td>
                <button class="btn btn-outline-danger btn-sm delete-btn" @click="deletePoint(index)">
                  <small>删除</small>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  resize: both;
  overflow: auto;
  min-height: 200px;
  min-width: 300px;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

.card-body {
  max-height: 450px;
  overflow: hidden;
}

.point-item:hover {
  background-color: #f0f0f0;
}

/* 添加拖拽手柄样式 */
.point-item {
  cursor: grab;
}

.point-item:active {
  cursor: grabbing;
}
</style>
