<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div id="helpText" class="alert alert-info mb-3" :class="{ 'd-none': !visible }">
    <h5>使用说明:</h5>
    <ul>
      <li>点击地图添加路径点</li>
      <li>可以删除或通过拖动表格行调整点的顺序</li>
      <li>通过上传JSON文件加载自定义边界</li>
      <li>点击导出JSON保存当前所有路径点</li>
    </ul>
  </div>
</template>
