<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { BoundaryData, MapBounds, PathPoint, BoundaryPoint } from '@/types/track-designer'

const props = defineProps<{
  boundaryData: BoundaryData | null
  pathPoints: PathPoint[]
  mapBounds: MapBounds | null
}>()

const emit = defineEmits<{
  (e: 'pointAdded', point: { lat: number, lng: number }): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)

let ctx: CanvasRenderingContext2D | null = null

// 使用函数声明而不是函数表达式，利用函数提升特性
function draw(): void {
  if (!ctx || !canvas.value || !props.mapBounds) return

  // 清空画布
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制边界
  drawBoundary()

  // 绘制路径点
  drawPathPoints()
}

function drawBoundary(): void {
  if (!ctx || !props.boundaryData?.paths?.length) return

  const paths = props.boundaryData.paths

  // 绘制边界线
  ctx.beginPath()
  const firstPoint = latLngToXY(paths[0].lat, paths[0].lng)
  ctx.moveTo(firstPoint.x, firstPoint.y)

  paths.forEach((point: BoundaryPoint, index: number) => {
    if (index === 0) return // 跳过第一个点
    const { x, y } = latLngToXY(point.lat, point.lng)
    if (ctx) ctx.lineTo(x, y)
  })

  // 闭合路径
  if (ctx) {
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.strokeStyle = '#dc3545'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 绘制边界点
  paths.forEach((point: BoundaryPoint, index: number) => {
    if (!ctx) return

    const { x, y } = latLngToXY(point.lat, point.lng)

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#dc3545'
    ctx.fill()

    // 只在部分边界点标注索引，避免太密集
    if (index % 3 === 0) {
      ctx.fillStyle = '#6c757d'
      ctx.font = '10px Arial'
      ctx.fillText(`B${index}`, x + 6, y - 6)
    }
  })
}

function drawPathPoints(): void {
  if (!ctx) return

  props.pathPoints.forEach((point) => {
    if (!ctx) return

    const { x, y } = latLngToXY(point.lat, point.lng)

    // 绘制点
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#0d6efd'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 标记序号
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(point.sortNum.toString(), x, y)

    // 恢复默认对齐方式
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  })

  // 如果有两个以上的点，绘制连接线
  if (props.pathPoints.length > 1 && ctx) {
    ctx.beginPath()

    // 按照sortNum排序
    const sortedPoints = [...props.pathPoints].sort((a, b) => a.sortNum - b.sortNum)

    const firstPoint = latLngToXY(sortedPoints[0].lat, sortedPoints[0].lng)
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (let i = 1; i < sortedPoints.length; i++) {
      const { x, y } = latLngToXY(sortedPoints[i].lat, sortedPoints[i].lng)
      ctx.lineTo(x, y)
    }

    ctx.strokeStyle = 'rgba(13, 110, 253, 0.7)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

// 坐标转换: 经纬度 -> 画布坐标
const latLngToXY = (lat: number, lng: number) => {
  if (!props.mapBounds || !canvas.value) return { x: 0, y: 0 }

  const { minLat, maxLat, minLng, maxLng } = props.mapBounds
  const { width, height } = canvas.value

  const scaleX = width / (maxLng - minLng)
  const scaleY = height / (maxLat - minLat)
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (width - (maxLng - minLng) * scale) / 2
  const offsetY = (height - (maxLat - minLat) * scale) / 2

  const x = (lng - minLng) * scale + offsetX
  const y = height - ((lat - minLat) * scale + offsetY)

  return { x, y }
}

// 坐标转换: 画布坐标 -> 经纬度
const xyToLatLng = (x: number, y: number) => {
  if (!props.mapBounds || !canvas.value) return { lat: 0, lng: 0 }

  const { minLat, maxLat, minLng, maxLng } = props.mapBounds
  const { width, height } = canvas.value

  const scaleX = width / (maxLng - minLng)
  const scaleY = height / (maxLat - minLat)
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (width - (maxLng - minLng) * scale) / 2
  const offsetY = (height - (maxLat - minLat) * scale) / 2

  const lng = (x - offsetX) / scale + minLng
  const lat = (height - y - offsetY) / scale + minLat

  return {
    lat: parseFloat(lat.toFixed(14)),
    lng: parseFloat(lng.toFixed(14))
  }
}

// 处理画布点击
const handleCanvasClick = (e: MouseEvent) => {
  if (isDragging.value || !canvas.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const { lat, lng } = xyToLatLng(x, y)

  // 添加新点
  emit('pointAdded', { lat, lng })
}

// 处理窗口大小调整
const handleResize = () => {
  if (!canvas.value || !mapContainer.value) return

  canvas.value.width = mapContainer.value.clientWidth
  canvas.value.height = mapContainer.value.clientHeight

  draw()
}

// 事件监听
const setupEventListeners = () => {
  if (!canvas.value) return

  canvas.value.addEventListener('click', handleCanvasClick)

  // 添加鼠标拖动功能
  let dragStartX = 0
  let dragStartY = 0

  canvas.value.addEventListener('mousedown', (e) => {
    dragStartX = e.clientX
    dragStartY = e.clientY
    isDragging.value = false
  })

  canvas.value.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return // 只有左键点击才处理

    const dx = e.clientX - dragStartX
    const dy = e.clientY - dragStartY

    // 判断是否开始拖动 (移动超过5像素)
    if (!isDragging.value && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging.value = true
    }
  })

  canvas.value.addEventListener('mouseup', () => {
    isDragging.value = false
  })
}

// 初始化画布
onMounted(() => {
  if (!mapContainer.value) return

  canvas.value = document.createElement('canvas')
  canvas.value.width = mapContainer.value.clientWidth
  canvas.value.height = mapContainer.value.clientHeight

  mapContainer.value.querySelector('#map')!.appendChild(canvas.value)
  ctx = canvas.value.getContext('2d')

  setupEventListeners()
  nextTick(() => {
    draw()
  })

  // 响应窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 监听数据变化，重新绘制画布
watch(() => props.boundaryData, () => draw(), { deep: true })
watch(() => props.mapBounds, () => draw(), { deep: true })
watch(() => props.pathPoints, () => draw(), { deep: true })
</script>

<template>
  <div ref="mapContainer" id="map-container">
    <div id="map"></div>
    <div class="map-info">点击地图添加路径点</div>
  </div>
</template>

<style scoped>
#map-container {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
}

.map-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
}
</style>
