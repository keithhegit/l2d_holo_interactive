<script setup lang="ts">
import { getDebugLog } from '@/api/debug'
import { ref } from 'vue'
import type { DebugLog } from '@/api/debug/types.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
  PaginationEllipsis
} from '@/components/ui/pagination'
import { FileText, Eye, ChevronDown, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// 定义组件名称
defineOptions({
  name: 'DebugLogPage'
})

// 状态定义
const logList = ref<DebugLog[]>([])
const isLoading = ref(false)
const selectedLog = ref<DebugLog | null>(null)
const isDialogOpen = ref(false)

// 分页状态
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 展开的内容项
const expandedItems = ref<Set<number>>(new Set())

// 获取日志列表
const getLogList = async (page = 1, pageSize = 10) => {
  isLoading.value = true
  try {
    const res = await getDebugLog({
      page,
      pageSize
    })

    if (res.code === 200 && res.data) {
      logList.value = res.data.data
      pagination.value = {
        current: res.data.page,
        pageSize: res.data.pageSize,
        total: res.data.total
      }
    } else {
      toast.error('获取日志失败', {
        description: res.message || '请稍后重试'
      })
    }
  } catch (error) {
    console.error('获取日志列表失败:', error)
    toast.error('获取日志失败', {
      description: '请检查网络连接后重试'
    })
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化 JSON 内容
const formatJSON = (obj: Record<string, any> | null | undefined) => {
  if (!obj) return '{}'
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    console.error('格式化JSON失败:', error)
    return '无法格式化的内容'
  }
}

// 获取内容预览（截取前50个字符）
const getContentPreview = (content: Record<string, any> | null | undefined) => {
  if (!content) return '无内容'
  try {
    const jsonStr = JSON.stringify(content)
    return jsonStr.length > 50 ? jsonStr.substring(0, 50) + '...' : jsonStr
  } catch (error) {
    console.error('获取内容预览失败:', error)
    return '无法解析的内容'
  }
}

// 切换展开/折叠
const toggleExpand = (id: number) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

// 检查是否展开
const isExpanded = (id: number) => {
  return expandedItems.value.has(id)
}

// 查看详情
const viewDetail = (log: DebugLog) => {
  selectedLog.value = log
  isDialogOpen.value = true
}

// 处理分页变化
const handlePageChange = (page: number) => {
  if (page < 1 || page > Math.ceil(pagination.value.total / pagination.value.pageSize)) {
    return
  }
  getLogList(page, pagination.value.pageSize)
}

// 初始化加载
getLogList()
</script>

<template>
  <div class="py-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <FileText class="h-5 w-5" />
          调试日志
        </CardTitle>
        <CardDescription>查看系统调试日志和详细信息</CardDescription>
      </CardHeader>
      <CardContent>
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span class="text-muted-foreground">加载中...</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="logList.length === 0" class="flex flex-col items-center justify-center py-12">
          <FileText class="h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-muted-foreground">暂无日志数据</p>
        </div>

        <!-- 日志表格 -->
        <div v-else class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[120px] text-center">ID</TableHead>
                <TableHead class="w-[150px] text-center">用户</TableHead>
                <TableHead class="min-w-[300px] text-center">内容</TableHead>
                <TableHead class="w-[180px] text-center">创建时间</TableHead>
                <TableHead class="w-[100px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in logList" :key="log.id">
                <!-- ID -->
                <TableCell class="font-medium text-center">{{ log.id }}</TableCell>

                <!-- 用户 -->
                <TableCell class="text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-xs font-medium text-primary">
                        {{ log.creator ? log.creator.charAt(0).toUpperCase() : '?' }}
                      </span>
                    </div>
                    <span class="text-sm">{{ log.creator || '未知用户' }}</span>
                  </div>
                </TableCell>

                <!-- 内容 -->
                <TableCell class="text-center">
                  <div v-if="log.content" class="space-y-2">
                    <!-- 折叠/展开按钮 -->
                    <button
                      class="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                      @click="toggleExpand(log.id)"
                    >
                      <ChevronRight v-if="!isExpanded(log.id)" class="h-4 w-4" />
                      <ChevronDown v-else class="h-4 w-4" />
                      <span>{{ isExpanded(log.id) ? '收起' : '展开' }}</span>
                    </button>

                    <!-- 预览或完整内容 -->
                    <div v-if="!isExpanded(log.id)" class="text-sm text-muted-foreground text-center">
                      {{ getContentPreview(log.content) }}
                    </div>
                    <pre
                      v-else
                      class="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-[200px] overflow-y-auto text-left"
                      >{{ formatJSON(log.content) }}</pre
                    >
                  </div>
                  <div v-else class="text-sm text-muted-foreground italic">无内容</div>
                </TableCell>

                <!-- 创建时间 -->
                <TableCell class="text-sm text-muted-foreground text-center">
                  {{ formatDate(log.createdAt) }}
                </TableCell>

                <!-- 操作 -->
                <TableCell class="text-center">
                  <Button variant="ghost" size="sm" @click="viewDetail(log)">
                    <Eye class="h-4 w-4 mr-1" />
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- 分页 -->
        <div v-if="logList.length > 0" class="mt-4 flex justify-between items-center">
          <div class="text-sm text-muted-foreground flex-shrink-0">共 {{ pagination.total }} 条记录</div>
          <Pagination
            v-slot="{ page }"
            :items-per-page="pagination.pageSize"
            :total="pagination.total"
            :sibling-count="1"
            show-edges
            :default-page="pagination.current"
            @update:page="handlePageChange"
          >
            <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
              <PaginationFirst @click="handlePageChange(1)" />
              <PaginationPrevious @click="handlePageChange(page - 1)" />

              <template v-for="(item, index) in items">
                <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                  <Button
                    class="w-9 h-9 p-0"
                    :variant="item.value === page ? 'default' : 'outline'"
                    @click="handlePageChange(item.value)"
                  >
                    {{ item.value }}
                  </Button>
                </PaginationItem>
                <PaginationEllipsis v-else :key="item.type" :index="index" />
              </template>

              <PaginationNext @click="handlePageChange(page + 1)" />
              <PaginationLast @click="handlePageChange(Math.ceil(pagination.total / pagination.pageSize))" />
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>

    <!-- 详情对话框 -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>日志详情</DialogTitle>
          <DialogDescription>查看完整的日志信息</DialogDescription>
        </DialogHeader>

        <div v-if="selectedLog" class="space-y-4">
          <!-- ID -->
          <div>
            <label class="text-sm font-medium">ID</label>
            <p class="text-sm text-muted-foreground mt-1">{{ selectedLog.id }}</p>
          </div>

          <!-- 用户 -->
          <div>
            <label class="text-sm font-medium">创建者</label>
            <p class="text-sm text-muted-foreground mt-1">{{ selectedLog.creator || '未知用户' }}</p>
          </div>

          <!-- 创建时间 -->
          <div>
            <label class="text-sm font-medium">创建时间</label>
            <p class="text-sm text-muted-foreground mt-1">{{ formatDate(selectedLog.createdAt) }}</p>
          </div>

          <!-- 内容 -->
          <div>
            <label class="text-sm font-medium">内容详情</label>
            <pre v-if="selectedLog.content" class="text-xs bg-muted p-4 rounded-md overflow-x-auto mt-2">{{
              formatJSON(selectedLog.content)
            }}</pre>
            <p v-else class="text-sm text-muted-foreground italic mt-2">无内容</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>
