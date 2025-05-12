import { latLngToXY } from './coordinateUtils'
import type { PathPoint, BoundaryData, MapBounds } from '@/types'

// 绘制边界线和点
export function drawBoundary(
  ctx: CanvasRenderingContext2D,
  boundaryData: BoundaryData,
  mapBounds: MapBounds,
  canvasWidth: number,
  canvasHeight: number
) {
  const paths = boundaryData.paths

  if (!paths || paths.length === 0) return

  // 绘制边界线
  ctx.beginPath()
  const firstPoint = latLngToXY(
    paths[0].lat,
    paths[0].lng,
    mapBounds,
    canvasWidth,
    canvasHeight
  )
  ctx.moveTo(firstPoint.x, firstPoint.y)

  paths.forEach((point, index) => {
    if (index === 0) return // 跳过第一个点
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      mapBounds,
      canvasWidth,
      canvasHeight
    )
    ctx.lineTo(x, y)
  })

  // 闭合路径
  ctx.lineTo(firstPoint.x, firstPoint.y)
  ctx.strokeStyle = '#dc3545'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制边界点
  paths.forEach((point, index) => {
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      mapBounds,
      canvasWidth,
      canvasHeight
    )

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

// 绘制路径点及连接线
export function drawPathPoints(
  ctx: CanvasRenderingContext2D,
  pathPoints: PathPoint[],
  mapBounds: MapBounds,
  canvasWidth: number,
  canvasHeight: number
) {
  // 绘制每个点
  pathPoints.forEach((point) => {
    const { x, y } = latLngToXY(
      point.lat,
      point.lng,
      mapBounds,
      canvasWidth,
      canvasHeight
    )

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
    ctx.fillText(String(point.sortNum), x, y)

    // 恢复默认对齐方式
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  })

  // 如果有两个以上的点，绘制连接线
  if (pathPoints.length > 1) {
    const sortedPoints = [...pathPoints].sort((a, b) => a.sortNum - b.sortNum)

    ctx.beginPath()
    const firstPoint = latLngToXY(
      sortedPoints[0].lat,
      sortedPoints[0].lng,
      mapBounds,
      canvasWidth,
      canvasHeight
    )
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (let i = 1; i < sortedPoints.length; i++) {
      const { x, y } = latLngToXY(
        sortedPoints[i].lat,
        sortedPoints[i].lng,
        mapBounds,
        canvasWidth,
        canvasHeight
      )
      ctx.lineTo(x, y)
    }

    ctx.strokeStyle = 'rgba(13, 110, 253, 0.7)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}
