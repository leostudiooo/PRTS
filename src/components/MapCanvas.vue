<template>
  <div class="map-container">
    <svg ref="svgRef" class="map-svg"></svg>
    <div class="map-info">点击地图添加路径点</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useTrackStore } from '@/stores/trackStore'
import { latLngToXY } from '@/utils/coordinateUtils'
import { xyToLatLng } from '@/utils/coordinateUtils'

const store = useTrackStore()
const svgRef = ref<SVGElement | null>(null)

// 拖动状态
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0

// 初始化SVG和事件监听
onMounted(() => {
  if (!svgRef.value) return

  resizeSvg()
  setupEventListeners()

  // 初始化边界
  store.calculateBounds()
  draw()

  // 监听窗口大小变化
  window.addEventListener('resize', resizeSvg)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeSvg)
})

// 调整SVG大小
function resizeSvg() {
  if (!svgRef.value) return

  const container = svgRef.value.parentElement
  if (container) {
    svgRef.value.setAttribute('width', container.clientWidth.toString())
    svgRef.value.setAttribute('height', container.clientHeight.toString())
    draw()
  }
}

// 获取SVG尺寸
function getSvgDimensions() {
  if (!svgRef.value) return { width: 0, height: 0 }

  return {
    width: parseInt(svgRef.value.getAttribute('width') || '0'),
    height: parseInt(svgRef.value.getAttribute('height') || '0')
  }
}

// 绘制地图内容
function draw() {
  if (!svgRef.value || !store.mapBounds) return

  const svg = svgRef.value
  // 清空SVG
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild)
  }

  // 创建背景
  const { width, height } = getSvgDimensions()
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  background.setAttribute('width', width.toString())
  background.setAttribute('height', height.toString())
  background.setAttribute('fill', '#f8f9fa')
  svg.appendChild(background)

  // 绘制边界
  if (store.boundaryData && store.boundaryData.paths.length) {
    drawBoundary(svg)
  }

  // 绘制路径点
  drawPathPoints(svg)
}

// 绘制边界
function drawBoundary(svg: SVGElement) {
  const paths = store.boundaryData.paths
  if (!paths.length || !store.mapBounds) return

  const { width, height } = getSvgDimensions()

  // 创建边界路径
  let pathData = ''
  paths.forEach((point, index) => {
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      store.mapBounds!,
      width,
      height
    )

    pathData += index === 0 ? `M ${x},${y}` : ` L ${x},${y}`
  })

  // 闭合路径
  pathData += ' Z'

  // 创建SVG路径元素
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathElement.setAttribute('d', pathData)
  pathElement.setAttribute('stroke', '#dc3545')
  pathElement.setAttribute('stroke-width', '2')
  pathElement.setAttribute('fill', 'none')
  svg.appendChild(pathElement)

  // 绘制边界点
  paths.forEach((point, index) => {
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      store.mapBounds!,
      width,
      height
    )

    // 创建点
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x.toString())
    circle.setAttribute('cy', y.toString())
    circle.setAttribute('r', '4')
    circle.setAttribute('fill', '#dc3545')
    svg.appendChild(circle)

    // 只在部分边界点标注索引，避免太密集
    if (index % 3 === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', (x + 6).toString())
      text.setAttribute('y', (y - 6).toString())
      text.setAttribute('font-size', '10px')
      text.setAttribute('fill', '#6c757d')
      text.textContent = `B${index}`
      svg.appendChild(text)
    }
  })
}

// 绘制路径点及连线
function drawPathPoints(svg: SVGElement) {
  if (!store.mapBounds) return
  const { width, height } = getSvgDimensions()

  // 如果有两个以上的点，先绘制连接线
  if (store.pathPoints.length > 1) {
    const sortedPoints = [...store.pathPoints].sort((a, b) => a.sortNum - b.sortNum)

    let pathData = ''
    sortedPoints.forEach((point, index) => {
      const { x, y } = latLngToXY(
        point.lat,
        point.lng,
        store.mapBounds!,
        width,
        height
      )

      pathData += index === 0 ? `M ${x},${y}` : ` L ${x},${y}`
    })

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', pathData)
    pathElement.setAttribute('stroke', 'rgba(13, 110, 253, 0.7)')
    pathElement.setAttribute('stroke-width', '2')
    pathElement.setAttribute('fill', 'none')
    svg.appendChild(pathElement)
  }

  // 绘制每个路径点
  store.pathPoints.forEach((point) => {
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      store.mapBounds!,
      width,
      height
    )

    // 创建点外圈
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x.toString())
    circle.setAttribute('cy', y.toString())
    circle.setAttribute('r', '6')
    circle.setAttribute('fill', '#0d6efd')
    circle.setAttribute('stroke', '#ffffff')
    circle.setAttribute('stroke-width', '1.5')
    svg.appendChild(circle)

    // 创建文本标签
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', x.toString())
    text.setAttribute('y', (y + 1).toString()) // 微调让文字在中间
    text.setAttribute('text-anchor', 'middle') // 水平居中
    text.setAttribute('dominant-baseline', 'middle') // 垂直居中
    text.setAttribute('font-size', '10px')
    text.setAttribute('font-weight', 'bold')
    text.setAttribute('fill', '#ffffff')
    text.textContent = point.sortNum.toString()
    svg.appendChild(text)
  })
}

// 设置事件监听
function setupEventListeners() {
  if (!svgRef.value) return

  // 点击添加点
  svgRef.value.addEventListener('click', handleSvgClick)

  // 拖动相关
  svgRef.value.addEventListener('mousedown', handleMouseDown)
  svgRef.value.addEventListener('mousemove', handleMouseMove)
  svgRef.value.addEventListener('mouseup', handleMouseUp)
  svgRef.value.addEventListener('mouseleave', handleMouseUp)
}

// 点击地图添加点
function handleSvgClick(e: MouseEvent) {
  if (isDragging.value || !svgRef.value || !store.mapBounds) return

  const rect = svgRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const { width, height } = getSvgDimensions()

  const { lat, lng } = xyToLatLng(
    x,
    y,
    store.mapBounds,
    width,
    height
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

.map-svg {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  user-select: none; /* 禁用文本选择 */
  -webkit-user-select: none; /* Safari 支持 */
  -moz-user-select: none; /* Firefox 支持 */
  -ms-user-select: none; /* IE/Edge 支持 */
  cursor: default; /* 设置默认光标 */
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

/* 防止所有 SVG 元素被选中 */
svg text, svg circle, svg path, svg rect {
  pointer-events: all; /* 确保事件仍然触发 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
