<script setup lang="ts">
const emit = defineEmits<{
  (e: 'clearPoints'): void
  (e: 'exportPoints'): void
  (e: 'sortPoints'): void
  (e: 'toggleHelp'): void
}>()
</script>

<template>
  <div class="action-buttons">
    <button class="btn btn-warning me-2" @click="emit('clearPoints')">清除所有点</button>
    <button class="btn btn-success me-2" @click="emit('exportPoints')">导出JSON</button>
    <!-- <button class="btn btn-secondary me-2" @click="emit('sortPoints')">重新排序</button> -->
    <button class="btn btn-info" @click="emit('toggleHelp')">使用帮助</button>
  </div>
</template>

<style scoped>
.action-buttons {
  margin-bottom: 15px;
}
</style>
