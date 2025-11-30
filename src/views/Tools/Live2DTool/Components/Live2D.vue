<script setup lang="ts">
import { Live2dCreator } from '@/utils/live2d.ts'
import { MotionPriority } from 'pixi-live2d-display/cubism4'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    params: any
    assetUrl: string
    // eslint-disable-next-line vue/require-default-prop
    bg?: string
  }>(),
  {}
)
const loading = ref(false)
const erosModel = ref()

const createNewModel = async () => {
  loading.value = true
  deleteModel()
  console.log(props.assetUrl, 'ssss')
  erosModel.value = new Live2dCreator({
    modelJson: props.assetUrl,
    canvasID: 'live2d',
    containerID: 'modelContainer',
    params: {
      aspectRatio: props.params.aspectRatio,
      angle: props.params.angle,
      anchor: props.params.anchor
    }
  })
  try {
    await erosModel.value.initModel(() => {
      loading.value = false
    })
  } catch (e) {
    console.warn(e)
    loading.value = false
    // You might want to show an error message here, but for now just stop loading
  }
  erosModel.value.registerHitEvent((hitAreaNames: string[]) => {
    console.log(hitAreaNames)
    const motionName = hitAreaNames[0]
    erosModel.value.motionTrigger(motionName, undefined, MotionPriority.FORCE)
  })
}

const loadingText = computed(() => {
  if (loading.value) {
    return '模型加载中'
  }
  if (!props.assetUrl && !erosModel.value) {
    return '等待模型文件'
  } else if (props.assetUrl && !erosModel.value) {
    return '等待渲染模型文件'
  }
  return ''
})

const deleteModel = () => {
  ;(window as any)?.erosModel?.destroy(true, true, true)
  delete (window as any).erosModel
  erosModel.value = undefined
}

onMounted(async () => {
  // await createNewModel()
})

watch(
  () => props.params.angle,
  (val) => {
    erosModel.value.setAngle(val)
  }
)
watch(
  () => props.params.aspectRatio,
  (val) => {
    erosModel.value.setScale(val)
  }
)
watch(
  () => props.params.anchor,
  (val) => {
    erosModel.value?.setAnchor(val.x, val.y)
  }
)

onBeforeUnmount(() => {
  delete (window as any).erosModel
})

defineExpose({
  createNewModel,
  deleteModel,
  erosModel,
  loading
})
</script>

<template>
  <div id="live2d-container" class="absolute z-0 w-full h-full [&::-webkit-scrollbar]:hidden">
    <canvas id="live2d" class="w-full h-full bg-transparent"></canvas>
    <div
      v-if="loadingText"
      class="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="w-full max-w-md px-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="flex-1 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div class="space-y-2 mb-6">
          <div class="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse w-5/6"></div>
          <div class="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse w-4/6"></div>
        </div>
        <div class="flex items-center gap-3">
          <svg class="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ loadingText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
