<script setup lang="ts">
import { nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Live2D from '@/views/Tools/Live2DTool/Components/Live2D.vue'
import HandTracker from '@/views/Tools/Live2DTool/Components/HandTracker.vue'
import { models } from '@/utils/l2dModels'
import { ChevronLeft, ScanFace, Activity } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()
const aspectRatio = ref([0.15])
const angle = ref([0])
const anchor = ref({
  x: [0.5],
  y: [0.5]
})

const onlineUrl = 'https://ugenie.net/api/uploads/live2d/?/FileReferences_Physics_0.json'
const show = ref(true)
const modelPath = ref('')
const l2dRef = ref()
const bgImage = ref('')

const motionFileList = ref<{ name: string; count: number }[]>([])
const cameraEnabled = ref(true)

// 沉浸式模式下，固定为全屏或特定比例，这里简化为占满容器
// 实际应用中可能需要根据窗口大小动态调整，或者保持 100% width/height

const reset = () => {
  if (!l2dRef.value) return
  l2dRef.value.loading = true
  nextTick(async () => {
    try {
      await l2dRef.value.createNewModel()
    } catch (e) {
      console.warn(e)
    }
    if (!l2dRef.value?.erosModel?.model?.internalModel?.motionManager) return

    const motionManager = l2dRef.value.erosModel.model.internalModel.motionManager
    const motionGroups: Array<{ name: string; count: number }> = []

    const definitions = motionManager.definitions

    for (const [group, motions] of Object.entries(definitions)) {
      motionGroups.push({ name: group, count: Array.isArray(motions) ? motions.length : 0 })
    }
    motionFileList.value = motionGroups
    console.log(motionGroups)
  })
}

const clear = () => {
  if (l2dRef.value) {
    l2dRef.value.loading = false
    l2dRef.value.deleteModel()
  }
  modelPath.value = ''
  motionFileList.value = []
}

const goBack = () => {
  clear()
  router.push('/')
}

const gestureToMotion: Record<string, string[]> = {
  OPEN: ['摸身体', 'TouchBody', 'Body', 'Idle'],
  OPEN_UP: ['摸头', 'Head', 'Pat', '左上角红花'],
  OPEN_DOWN: ['摸胸', 'Chest', '摸左腿', '摸右腿'],
  OPEN_LEFT: ['摸手', '摸左手', 'LeftHand', 'TouchSpecial'],
  OPEN_RIGHT: ['触摸', '摸右手', 'RightHand', 'Shake'],
  CLOSED: ['Shake', '摸右腿', 'Fist', 'Angry'],
  PINCH: ['Tap背景', 'Tap', '右上角红花'],
  PINCH_DOWN: ['掀裙子', 'Skirt', 'PullSkirt', '摸左腿'],
  PINCH_UP: ['摸头发', 'Hair', '台词鉴赏', 'PullHair'],
  PINCH_LEFT: ['左眼', 'LeftEye', '选项', 'PokeLeft'],
  PINCH_RIGHT: ['右眼', 'RightEye', 'Start', 'PokeRight']
}

const gestureDescriptions: Record<string, string> = {
  OPEN: '五指张开（身体）',
  OPEN_UP: '五指张开（上）',
  OPEN_DOWN: '五指张开（下）',
  OPEN_LEFT: '五指张开（左）',
  OPEN_RIGHT: '五指张开（右）',
  CLOSED: '握拳',
  PINCH: '拇食指捏（可拖动）',
  PINCH_DOWN: '拇食指捏（下，拖动）',
  PINCH_UP: '拇食指捏（上，拖动）',
  PINCH_LEFT: '拇食指捏（左，拖动）',
  PINCH_RIGHT: '拇食指捏（右，拖动）'
}

const gesturesFor = (group: string) => {
  return Object.entries(gestureToMotion)
    .filter(([, motions]) => motions.includes(group))
    .map(([g]) => gestureDescriptions[g] ?? g)
}

const gestureHandler = (e: Event) => {
  if (!cameraEnabled.value) return
  const detail = (e as CustomEvent).detail as { gesture: string }
  const key = detail?.gesture
  const motions = key ? gestureToMotion[key] : undefined
  if (motions) {
    const availableMotion = motions.find((m) => motionFileList.value.some((item) => item.name === m))
    if (availableMotion) {
      triggerMotion(availableMotion)
    }
  }
}

const triggerMotion = (motionGroup: string) => {
  l2dRef.value?.erosModel?.motionTrigger?.(motionGroup)
}

onMounted(() => {
  window.addEventListener('holo3d-gesture', gestureHandler)
  const name = route.params.name as string | undefined
  if (name) {
    const model = models.find((m) => m.folderName === name)
    if (model) {
      modelPath.value = model.url
    } else {
      modelPath.value = onlineUrl.replace('?', name)
    }
    reset()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('holo3d-gesture', gestureHandler)
})
</script>

<template>
  <div class="fixed inset-0 bg-black overflow-hidden flex flex-col">
    <!-- 顶部导航栏 (绝对定位) -->
    <div class="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
      <!-- 返回按钮 -->
      <button
        class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 hover:bg-black/60 transition-colors"
        @click="goBack"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="text-sm font-medium">退出沉浸模式</span>
      </button>
    </div>

    <!-- 主要内容区域 (全屏) -->
    <div class="relative flex-1 w-full h-full flex items-center justify-center">
      <div id="modelContainer" class="relative h-full" style="aspect-ratio: 9 / 16">
        <!-- Live2D 渲染层 -->
        <Live2D
          v-if="show"
          ref="l2dRef"
          class="absolute inset-0 w-full h-full"
          :style="{ background: bgImage ? `url('${bgImage}') center / cover no-repeat` : 'black' }"
          :asset-url="modelPath"
          :bg="bgImage"
          :params="{
            aspectRatio: aspectRatio[0],
            angle: angle[0] / 360,
            anchor: {
              x: anchor.x[0],
              y: anchor.y[0]
            }
          }"
        />
      </div>

      <!-- 摄像头层 (默认隐藏，仅逻辑存在，或通过开关控制显示) -->
      <div
        v-show="cameraEnabled"
        class="absolute bottom-24 right-6 z-10 opacity-80 hover:opacity-100 transition-opacity"
      >
        <!-- HandTracker 组件内部可能有自己的 UI，这里作为容器 -->
        <HandTracker />
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="absolute bottom-0 left-0 right-0 z-20 p-6 flex justify-between items-end pointer-events-none">
      <!-- 左下角：摄像头开关 -->
      <div class="pointer-events-auto flex flex-col items-center gap-2">
        <div
          class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all"
          :class="{ 'bg-[#d4b98c]/20 border-[#d4b98c]/50': cameraEnabled }"
          @click="cameraEnabled = !cameraEnabled"
        >
          <ScanFace class="w-6 h-6 text-white" :class="{ 'text-[#d4b98c]': cameraEnabled }" />
        </div>
        <span class="text-[10px] text-white/60 uppercase tracking-wider">Switch</span>
      </div>

      <!-- 右下角：动作菜单和其他功能 -->
      <div class="pointer-events-auto flex items-center gap-4">
        <!-- 动作菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              class="w-14 h-14 rounded-full bg-[#d4b98c] flex items-center justify-center shadow-lg shadow-[#d4b98c]/20 hover:scale-105 transition-transform cursor-pointer"
            >
              <Activity class="w-7 h-7 text-[#09090b]" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="w-56 bg-black/90 border-white/10 text-white backdrop-blur-xl max-h-[60vh] overflow-y-auto"
          >
            <DropdownMenuLabel>动作列表 ({{ motionFileList.length }})</DropdownMenuLabel>
            <DropdownMenuSeparator class="bg-white/10" />
            <DropdownMenuItem
              v-for="motion in motionFileList"
              :key="motion.name"
              class="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
              @click="triggerMotion(motion.name)"
            >
              <div class="w-full">
                <div class="flex justify-between items-center">
                  <span>{{ motion.name }}</span>
                  <span class="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{{ motion.count }}</span>
                </div>
                <div class="mt-1 text-xs text-white/60">
                  手势：{{ gesturesFor(motion.name).length ? gesturesFor(motion.name).join('、') : '无手势触发' }}
                </div>
              </div>
            </DropdownMenuItem>
            <div v-if="motionFileList.length === 0" class="p-2 text-sm text-white/40 text-center">
              加载中或无动作数据
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 预留的其他按钮 (模拟图中的星球图标等) -->
        <!-- <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all">
           <Aperture class="w-5 h-5 text-white" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保 Live2D 组件内的 canvas 占满容器 */
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}
</style>
