<template>
  <div class="map-container">
    <canvas ref="canvasRef"></canvas>
    <div class="map-info">点击地图添加路径点</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import { drawBoundary, drawPathPoints } from '@/utils/mapDrawingUtils'
import { xyToLatLng } from '@/utils/coordinateUtils'

const store = useTrackStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// 拖动状态
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0

// 初始化canvas和事件监听
onMounted(() => {
  if (!canvasRef.value) return

  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  setupEventListeners()

  // 初始化边界
  store.calculateBounds()
  draw()

  // 监听窗口大小变化
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})

// 调整画布大小
function resizeCanvas() {
  if (!canvasRef.value) return

  const container = canvasRef.value.parentElement
  if (container) {
    canvasRef.value.width = container.clientWidth
    canvasRef.value.height = container.clientHeight
    draw()
  }
}

// 绘制地图内容
function draw() {
  if (!canvasRef.value || !ctx || !store.mapBounds) return

  // 清空画布
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // 绘制边界
  if (store.boundaryData && store.boundaryData.paths.length) {
    drawBoundary(
      ctx,
      store.boundaryData,
      store.mapBounds,
      canvasRef.value.width,
      canvasRef.value.height
    )
  }

  // 绘制路径点
  drawPathPoints(
    ctx,
    store.pathPoints,
    store.mapBounds,
    canvasRef.value.width,
    canvasRef.value.height
  )
}

// 设置事件监听
function setupEventListeners() {
  if (!canvasRef.value) return

  // 点击添加点
  canvasRef.value.addEventListener('click', handleCanvasClick)

  // 拖动相关
  canvasRef.value.addEventListener('mousedown', handleMouseDown)
  canvasRef.value.addEventListener('mousemove', handleMouseMove)
  canvasRef.value.addEventListener('mouseup', handleMouseUp)
  canvasRef.value.addEventListener('mouseleave', handleMouseUp)
}

// 点击地图添加点
function handleCanvasClick(e: MouseEvent) {
  if (isDragging.value || !canvasRef.value || !store.mapBounds) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const { lat, lng } = xyToLatLng(
    x,
    y,
    store.mapBounds,
    canvasRef.value.width,
    canvasRef.value.height
  )

  // 添加新点
  store.addPathPoint({
    lat,
    lng,
    sortNum: store.pathPoints.length + 1
  })

  // 重绘
  draw()
}

function handleMouseDown(e: MouseEvent) {
  dragStartX = e.clientX
  dragStartY = e.clientY
  isDragging.value = false
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) return // 只有左键点击才处理

  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY

  // 判断是否开始拖动 (移动超过5像素)
  if (!isDragging.value && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
    isDragging.value = true
  }
}

function handleMouseUp() {
  isDragging.value = false
}

// 监听状态变化重新绘制
watch(() => [store.pathPoints.length, store.boundaryData], () => {
  draw()
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
}

.map-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255,255,255,0.8);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
}
</style>
