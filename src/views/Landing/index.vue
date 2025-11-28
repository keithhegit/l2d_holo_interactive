<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Activity } from 'lucide-vue-next'
import { models } from '@/utils/l2dModels'

defineOptions({ name: 'LandingPage' })

const router = useRouter()

const activeTab = ref('Popularity')
const tabs = ['Popularity', 'Flowers']
const keyword = ref('')

const filtered = () => {
  const k = keyword.value.trim().toLowerCase()
  let list = models
  if (k) {
    list = list.filter((m) => m.name.toLowerCase().includes(k) || m.folderName.toLowerCase().includes(k))
  }
  // 如果需要根据 Tab 排序，可以在这里添加逻辑
  // 目前仅展示列表
  return list
}

const getCover = (model: any) => {
  return model.cover || `https://ugenie.net/api/uploads/live2d/${model.folderName}/preview.png`
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  // 使用文件夹名作为种子生成随机头像
  const name = target.alt || 'L2D'
  target.src = `https://ui-avatars.com/api/?name=${name}&background=random`
}

const selectModel = (folderName: string) => {
  router.push('/tool/live2d/' + folderName)
}
</script>

<template>
  <div class="min-h-screen bg-[#09090b] text-white flex flex-col">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-10 bg-[#09090b]/90 backdrop-blur-sm border-b border-white/10 px-4 pt-4">
      <div class="flex items-center gap-6 mb-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="relative pb-2 text-lg font-medium transition-colors"
          :class="activeTab === tab ? 'text-white' : 'text-white/40'"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4b98c] rounded-full"></span>
        </button>
      </div>

      <!-- 搜索栏 -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          v-model="keyword"
          type="text"
          placeholder="Search models..."
          class="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#d4b98c]"
        />
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="flex-1 p-4 space-y-4">
      <div
        v-for="model in filtered()"
        :key="model.id"
        class="group flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        @click="selectModel(model.folderName)"
      >
        <!-- 左侧封面 -->
        <div class="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-white/10">
          <img
            :src="getCover(model)"
            :alt="model.folderName"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            @error="handleImgError"
          />
        </div>

        <!-- 右侧信息 -->
        <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <h3 class="text-lg font-bold text-white leading-tight mb-1">{{ model.name }}</h3>
            <p class="text-sm text-white/60 line-clamp-2 leading-snug">
              文件夹: {{ model.folderName }}
              <br />
              ID: {{ model.characterId }}
            </p>
          </div>

          <!-- 底部标签行 -->
          <div class="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
            <!-- 动作数量标签 -->
            <div
              class="flex items-center gap-1 bg-[#d4b98c]/20 text-[#d4b98c] px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
            >
              <Activity class="w-3 h-3" />
              <span>{{ model.actionCount }} 动作</span>
            </div>

            <!-- 普通标签 -->
            <div
              v-for="(tag, idx) in model.tags"
              :key="idx"
              class="px-2 py-0.5 rounded bg-white/10 text-xs text-white/70 whitespace-nowrap"
            >
              {{ tag }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filtered().length === 0" class="text-center py-12 text-white/30">No models found</div>
    </div>
  </div>
</template>

<style scoped>
/* 隐藏滚动条但保持功能 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
