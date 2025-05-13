import type { MapBounds, Point } from '@/types'

// 坐标转换: 经纬度 -> 画布坐标
export function latLngToXY(
  lat: number,
  lng: number,
  mapBounds: MapBounds,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!mapBounds) return { x: 0, y: 0 }

  const scaleX = canvasWidth / (mapBounds.maxLng - mapBounds.minLng)
  const scaleY = canvasHeight / (mapBounds.maxLat - mapBounds.minLat)
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (canvasWidth - (mapBounds.maxLng - mapBounds.minLng) * scale) / 2
  const offsetY = (canvasHeight - (mapBounds.maxLat - mapBounds.minLat) * scale) / 2

  const x = (lng - mapBounds.minLng) * scale + offsetX
  const y = canvasHeight - ((lat - mapBounds.minLat) * scale + offsetY)

  return { x, y }
}

// 坐标转换: 画布坐标 -> 经纬度
export function xyToLatLng(
  x: number,
  y: number,
  mapBounds: MapBounds,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!mapBounds) return { lat: 0, lng: 0 }

  const scaleX = canvasWidth / (mapBounds.maxLng - mapBounds.minLng)
  const scaleY = canvasHeight / (mapBounds.maxLat - mapBounds.minLat)
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (canvasWidth - (mapBounds.maxLng - mapBounds.minLng) * scale) / 2
  const offsetY = (canvasHeight - (mapBounds.maxLat - mapBounds.minLat) * scale) / 2

  const lng = (x - offsetX) / scale + mapBounds.minLng
  const lat = (canvasHeight - y - offsetY) / scale + mapBounds.minLat

  return {
    lat: parseFloat(lat.toFixed(14)),
    lng: parseFloat(lng.toFixed(14))
  }
}

// 计算两点间的距离（单位：米）
export function calculateDistance(p1: Point, p2: Point): number {
  const R = 6371000 // 地球半径，单位米
  const lat1 = p1.lat * Math.PI / 180
  const lat2 = p2.lat * Math.PI / 180
  const deltaLat = (p2.lat - p1.lat) * Math.PI / 180
  const deltaLng = (p2.lng - p1.lng) * Math.PI / 180

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 返回距离，单位米
}

// 计算路径总长度（单位：米）
export function calculateTotalDistance(points: Point[]): number {
  if (points.length <= 1) {
    return 0
  }

  const sortedPoints = [...points]

  let totalDistance = 0
  for (let i = 1; i < sortedPoints.length; i++) {
    totalDistance += calculateDistance(points[i - 1], points[i])
  }

  return totalDistance
}

// 格式化距离显示
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)} 米`
  } else {
    return `${(meters / 1000).toFixed(2)} 公里`
  }
}

// 格式化时间显示
export function formatTime(seconds: number): string {
  if (seconds <= 0) {
    return '0 秒'
  }

  if (seconds < 60) {
    return `${seconds} 秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes} 分 ${remainingSeconds > 0 ? remainingSeconds + ' 秒' : ''}`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    let result = `${hours} 小时`
    if (minutes > 0) result += ` ${minutes} 分`
    if (remainingSeconds > 0) result += ` ${remainingSeconds} 秒`
    return result
  }
}
