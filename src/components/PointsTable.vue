<template>
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">已添加路径点列表</h5>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>序号</th>
              <th>纬度</th>
              <th>经度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody ref="tableBody">
            <tr v-for="(point, index) in store.pathPoints" :key="`point-${index}`" class="point-item" :data-index="index">
              <td>{{ point.sortNum }}</td>
              <td>{{ point.lat.toFixed(6) }}</td>
              <td>{{ point.lng.toFixed(6) }}</td>
              <td>
                <button
                  class="btn btn-outline-danger btn-sm delete-btn"
                  @click="removePoint(index)"
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
import { ref, onMounted } from 'vue'
import Sortable from 'sortablejs'
import { useTrackStore } from '@/stores/trackStore'
import type { PathPoint } from '@/types'

const store = useTrackStore()
const tableBody = ref<HTMLElement | null>(null)

function removePoint(index: number) {
  store.removePathPoint(index)
}

onMounted(() => {
  setupSortable()
})

function setupSortable() {
  if (!tableBody.value) return

  new Sortable(tableBody.value, {
    animation: 150,
    onEnd: () => {
      if (!tableBody.value) return

      // 获取排序后的行
      const rows = Array.from(tableBody.value.querySelectorAll('tr'))
      const newOrder = rows.map(row => parseInt(row.dataset.index || '0'))

      // 创建排序后的新数组
      const newPoints: PathPoint[] = []
      newOrder.forEach((oldIndex, newIndex) => {
        const point = { ...store.pathPoints[oldIndex] }
        point.sortNum = newIndex + 1
        newPoints.push(point)
      })

      // 更新到store
      store.updatePointsOrder(newPoints)
    }
  })
}
</script>

<style scoped>
.point-item:hover {
  background-color: #f0f0f0;
}
</style>
