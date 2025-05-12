import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PathPoint, BoundaryData, MapBounds } from '@/types'
import { defaultBoundaryData } from '@/assets/default-boundary'
import { calculateTotalDistance } from '@/utils/coordinateUtils'

export const useTrackStore = defineStore('track', () => {
  const pathPoints = ref<PathPoint[]>([])
  const boundaryData = ref<BoundaryData>(defaultBoundaryData)
  const mapBounds = ref<MapBounds | null>(null)

  // 路径点列表
  const sortedPathPoints = computed(() => {
    return [...pathPoints.value].sort((a, b) => a.sortNum - b.sortNum)
  })

  // 计算路径总距离（米）
  const totalDistance = computed(() => {
    return calculateTotalDistance(pathPoints.value)
  })

  // 添加新的路径点
  function addPathPoint(point: PathPoint) {
    pathPoints.value.push(point)
  }

  // 删除指定索引的路径点
  function removePathPoint(index: number) {
    pathPoints.value.splice(index, 1)
    // 更新序号
    pathPoints.value.forEach((point, i) => {
      point.sortNum = i + 1
    })
  }

  // 更新路径点顺序
  function updatePointsOrder(newOrder: PathPoint[]) {
    // 确保更新排序号
    newOrder.forEach((point, index) => {
      point.sortNum = index + 1
    })

    pathPoints.value = JSON.parse(JSON.stringify(newOrder))
  }

  // 清除所有路径点
  function clearAllPoints() {
    pathPoints.value = []
  }

  // 设置边界数据
  function setBoundaryData(data: BoundaryData) {
    boundaryData.value = data
  }

  // 计算边界
  function calculateBounds() {
    if (!boundaryData.value || !boundaryData.value.paths.length) return

    const lats = boundaryData.value.paths.map((p) => p.lat)
    const lngs = boundaryData.value.paths.map((p) => p.lng)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // 添加边界缓冲区
    const latBuffer = (maxLat - minLat) * 0.2
    const lngBuffer = (maxLng - minLng) * 0.2

    mapBounds.value = {
      minLat: minLat - latBuffer,
      maxLat: maxLat + latBuffer,
      minLng: minLng - lngBuffer,
      maxLng: maxLng + lngBuffer,
    }
  }

  // 导出的JSON字符串
  const exportedJSON = computed(() => {
    if (!pathPoints.value) return ''
    if (pathPoints.value.length === 0) return ''
    const data = { tracks: pathPoints.value }
    return JSON.stringify(data, null, 2)
  })

  return {
    pathPoints,
    boundaryData,
    mapBounds,
    sortedPathPoints,
    totalDistance,
    exportedJSON,
    addPathPoint,
    removePathPoint,
    updatePointsOrder,
    clearAllPoints,
    setBoundaryData,
    calculateBounds,
  }
})
