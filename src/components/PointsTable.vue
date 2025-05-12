<template>
  <div class="card points-table-container">
    <div class="card-header bg-light">
      <h5 class="mb-0">已添加路径点列表</h5>
    </div>
    <div class="card-body p-0 table-container">
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>序号</th>
              <th>纬度</th>
              <th>经度</th>
              <th>距前点</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody ref="tableBody">
            <tr v-for="(point, index) in sortedPoints" :key="`point-${index}-${point.lat}-${point.lng}`" class="point-item" :data-index="index">
              <td>{{ index + 1 }}</td>
              <td>{{ point.lat.toFixed(6) }}</td>
              <td>{{ point.lng.toFixed(6) }}</td>
              <td>
                <small>{{ getDistanceFromPrevious(point, index) }}</small>
              </td>
              <td>
                <button
                  class="btn btn-outline-danger btn-sm delete-btn"
                  @click="removePoint(findOriginalIndex(point))"
                >
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sortable from 'sortablejs'
import { useTrackStore } from '@/stores/trackStore'
import type { PathPoint } from '@/types'
import { calculateDistance, formatDistance } from '@/utils/coordinateUtils'

const store = useTrackStore()
const tableBody = ref<HTMLElement | null>(null)

// 使用计算属性来获取已排序的点
const sortedPoints = computed(() => {
  return [...store.pathPoints].sort((a, b) => a.sortNum - b.sortNum)
})

// 查找点在原始数组中的索引
function findOriginalIndex(point: PathPoint): number {
  return store.pathPoints.findIndex(p =>
    p.lat === point.lat && p.lng === point.lng
  )
}

function removePoint(index: number) {
  if (index >= 0) {
    store.removePathPoint(index)
  }
}

// 计算与前一个点的距离
function getDistanceFromPrevious(point: PathPoint, index: number): string {
  if (index <= 0) {
    return '-'
  }

  const prevPoint = sortedPoints.value[index - 1]
  const distance = calculateDistance(prevPoint, point)

  return formatDistance(distance)
}

onMounted(() => {
  setupSortable()
})

function setupSortable() {
  if (!tableBody.value) return

  new Sortable(tableBody.value, {
    animation: 150,
    onEnd: (evt) => {
      if (!tableBody.value) return

      // 获取拖拽的起始和目标位置
      const oldIndex = evt.oldIndex !== undefined ? evt.oldIndex : 0
      const newIndex = evt.newIndex !== undefined ? evt.newIndex : 0

      // 深拷贝当前已排序的点
      const points = JSON.parse(JSON.stringify(sortedPoints.value)) as PathPoint[]

      // 移动元素
      const item = points.splice(oldIndex, 1)[0]
      points.splice(newIndex, 0, item)

      // 更新序号 - 确保每个点的sortNum属性与其在数组中的位置一致
      points.forEach((point, index) => {
        point.sortNum = index + 1
      })

      // 更新到store并触发重绘
      store.updatePointsOrder(points)
    }
  })
}
</script>

<style scoped>
.points-table-container {
  display: flex;
  flex-direction: column;
  height: 500px; /* 与地图容器一致的高度 */
}

.table-container {
  flex: 1;
  overflow-y: auto;
}

.point-item:hover {
  background-color: #f0f0f0;
}

/* 确保表头固定 */
.table-responsive {
  position: relative;
  height: 100%;
}

.table {
  margin-bottom: 0;
}

/* 设置滚动条样式，使其更美观 */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
