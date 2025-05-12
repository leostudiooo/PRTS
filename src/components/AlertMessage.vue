<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        :class="`alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`"
        style="z-index: 9999;"
      >
        {{ message }}
        <button type="button" class="btn-close" @click="hide" aria-label="Close"></button>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AlertType } from '@/types'

const props = defineProps<{
  message: string
  type: AlertType
  autoHide?: boolean
  duration?: number
}>()

const visible = ref(false)
let timer: number | null = null

function hide() {
  visible.value = false
}

function show() {
  visible.value = true

  if (props.autoHide && props.duration) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      hide()
    }, props.duration) as unknown as number
  }
}

watch(() => props.message, () => {
  if (props.message) {
    show()
  }
})

onMounted(() => {
  show()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
