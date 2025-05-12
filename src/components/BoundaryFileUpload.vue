<script setup lang="ts">
import { generateUUID, showAlert } from '@/types/track-designer';
import type { BoundaryData, BoundaryPoint } from '@/types/track-designer';

const emit = defineEmits<{
  (e: 'fileLoaded', data: BoundaryData): void
}>()

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = (event) => {
    try {
      const jsonData = JSON.parse(event.target?.result as string) as unknown

      // 类型保护：验证是否符合BoundaryData结构
      if (
        jsonData &&
        typeof jsonData === 'object' &&
        'paths' in jsonData &&
        Array.isArray((jsonData as { paths: unknown }).paths) &&
        (jsonData as { paths: unknown[] }).paths.every(item =>
          typeof item === 'object' &&
          item !== null &&
          'lat' in item &&
          'lng' in item &&
          'height' in item
        )
      ) {
        // 确保包含必要的元数据，如果缺失则提供默认值
        const boundaryData = {
          paths: (jsonData as { paths: BoundaryPoint[] }).paths,
          styleId: (jsonData as { styleId?: string }).styleId || 'default',
          rank: (jsonData as { rank?: number }).rank || 0,
          id: (jsonData as { id?: string }).id || generateUUID()
        } as BoundaryData;

        emit('fileLoaded', boundaryData)
        showAlert('边界数据加载成功！', 'success')
      } else {
        showAlert('无效的边界数据格式！', 'danger')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showAlert(`解析JSON文件失败：${errorMessage}`, 'danger')
    }
  }

  reader.onerror = () => {
    showAlert('读取文件失败！', 'danger')
  }

  reader.readAsText(file)
}
</script>

<template>
  <div class="row mb-3">
    <div class="col-md-6">
      <div class="input-group">
        <label class="input-group-text" for="boundaryFile">上传边界JSON:</label>
        <input
          type="file"
          class="form-control"
          id="boundaryFile"
          accept=".json"
          @change="handleFileChange"
        >
      </div>
    </div>
  </div>
</template>
