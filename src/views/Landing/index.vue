<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

defineOptions({ name: 'LandingPage' })

const router = useRouter()

// 模型名称占位，后续将由CDN列表替换
const allModels = Array.from({ length: 60 }, (_, i) => `model-${String(i + 1).padStart(2, '0')}`)
const keyword = ref('')
const filtered = () => {
  const k = keyword.value.trim().toLowerCase()
  return !k ? allModels : allModels.filter((n) => n.toLowerCase().includes(k))
}

const selectModel = (name: string) => {
  router.push(`/render/${encodeURIComponent(name)}`)
}
</script>

<template>
  <div class="min-h-screen p-4 flex flex-col gap-6">
    <div class="w-full">
      <iframe
        style="border: 1px solid rgba(0, 0, 0, 0.1);"
        width="100%"
        height="450"
        src="https://embed.figma.com/design/wrs6N5ni2Doy74Q72OwJGM/livco-%E9%A1%B9%E7%9B%AEUI2.0?node-id=153-1551&embed-host=share"
        allowfullscreen
      ></iframe>
    </div>

    <div class="flex items-center gap-4">
      <Input v-model="keyword" placeholder="搜索模型名称" />
      <Button @click="keyword = ''">清空</Button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="name in filtered()"
        :key="name"
        class="border rounded-lg p-3 flex flex-col items-center gap-2 bg-card"
      >
        <div class="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        <div class="text-sm font-medium truncate w-full text-center">{{ name }}</div>
        <Button class="w-full" @click="selectModel(name)">选择</Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
