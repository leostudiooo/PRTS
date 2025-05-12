<script setup lang="ts">
defineProps<{
  exportResult: string
}>()

const emit = defineEmits<{
  (e: 'update:exportResult', value: string): void
  (e: 'copyToClipboard'): void
}>()

const handleCopy = () => {
  emit('copyToClipboard')
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">导出结果</h5>
    </div>
    <div class="card-body">
      <textarea
        id="exportResult"
        class="form-control"
        rows="8"
        readonly
        :value="exportResult"
        @input="e => emit('update:exportResult', (e.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
    <div class="card-footer">
      <button id="copyToClipboard" class="btn btn-outline-secondary btn-sm" @click="handleCopy">
        复制到剪贴板
      </button>
    </div>
  </div>
</template>

<style scoped>
#exportResult {
  font-family: monospace;
}
</style>
