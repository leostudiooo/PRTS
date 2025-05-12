import type { MapBounds } from '@/types'

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
