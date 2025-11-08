<template>
  <div v-if="show" class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="handleBackdropClick">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">使用须知</h5>
        </div>
        <div class="modal-body">
          <p>
            <strong>GPLv3 第 7 条附加条款 - 衍生数据结构的署名要求</strong>
          </p>
          <p>
            <i>这不会影响普通用户的使用。</i>
          </p>
          <p>
            本程序生成包含特定数据结构的文件（包括但不限于 JSON 格式），这些数据结构由版权持有人原创设计。
          </p>
          <p>
            如果您分发、发布或使用任何此类结构化数据，或从中衍生的作品（包括对相同架构或格式的重新实现或改编），您必须包含一个可见的声明，类似于：
          </p>
          <p class="notice-text">
            "本作品（或其部分）包含由 PRTS 生成的数据结构，遵循 GPLv3 许可证。"
          </p>
          <p>
            此署名要求仅适用于包含或衍生自本程序受版权保护的数据结构或资源的作品，不限制使用本程序生成独立的、非衍生数据，且仅适用于分发或发布这些数据的情况。<strong>这不会影响您对本程序的正常使用。</strong>
          </p>
          <p class="warning-text">
            本程序生成的所有 JSON 文件都会自动在 <code>_comment</code> 字段中嵌入版权信息，以确保符合上述署名要求。请勿删除或修改这些字段，以免违反许可证条款。
          </p>
          <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" v-model="agreed" id="agreeCheck">
            <label class="form-check-label" for="agreeCheck">
              我已阅读并理解上述说明
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" :disabled="!agreed" @click="handleAgree">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  agree: []
}>()

const agreed = ref(false)

function handleAgree() {
  if (agreed.value) {
    emit('agree')
  }
}

function handleBackdropClick() {
  // Prevent closing modal by clicking backdrop
  // User must click the agree button
}
</script>

<style scoped>
.modal.show {
  pointer-events: auto;
}

.modal-body h6 {
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.modal-body p {
  margin-bottom: 0.5rem;
}

.notice-text {
  background-color: #f8f9fa;
  border-left: 3px solid #0d6efd;
  padding: 0.75rem;
  margin: 0.75rem 0;
  font-style: italic;
}

.warning-text {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  padding: 0.75rem;
  margin: 0.75rem 0;
}

.warning-text code {
  background-color: #ffeaa7;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}
</style>
