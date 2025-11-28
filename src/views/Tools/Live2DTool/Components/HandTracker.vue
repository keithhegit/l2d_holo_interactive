<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isReady = ref(false)
let hands: any
let raf = 0
let lastGesture = 'IDLE'
let cooldown = 0
let prevX = 0.5
let prevY = 0.5

const emitGesture = (gesture: string, isPinching: boolean, x: number, y: number) => {
  const now = Date.now()
  if (gesture !== lastGesture && now - cooldown > 200) {
    window.dispatchEvent(
      new CustomEvent('holo3d-gesture', {
        detail: { gesture, isPinching, cursor: { x, y } }
      })
    )
    lastGesture = gesture
    cooldown = now
  }
}

const onResults = (results: any) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (ctx && canvas) {
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(-1, 1)
    ctx.translate(-canvas.width, 0)
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        if ((window as any).drawConnectors && (window as any).HAND_CONNECTIONS) {
          ;(window as any).drawConnectors(ctx, landmarks, (window as any).HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 1
          })
        }
        if ((window as any).drawLandmarks) {
          ;(window as any).drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 })
        }
      }
    }
    ctx.restore()
  }

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0]
    const wrist = lm[0]
    const thumbTip = lm[4]
    const indexTip = lm[8]
    const cursorX = 1 - indexTip.x
    const cursorY = indexTip.y
    const getDistance = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y)
    const pinchDistance = getDistance(indexTip, thumbTip)
    const isPinching = pinchDistance < 0.05
    let extended = 0
    const fingerTips = [8, 12, 16, 20]
    const fingerPips = [6, 10, 14, 18]
    for (let i = 0; i < fingerTips.length; i++) {
      const tipDist = getDistance(lm[fingerTips[i]], wrist)
      const pipDist = getDistance(lm[fingerPips[i]], wrist)
      if (tipDist > pipDist * 1.1) extended++
    }
    const thumbDist = getDistance(thumbTip, lm[17])
    const isThumbExtended = thumbDist > 0.2
    if (isThumbExtended) extended++
    let base = 'IDLE'
    if (isPinching) base = 'PINCH'
    else if (extended >= 4) base = 'OPEN'
    else if (extended <= 1) base = 'CLOSED'
    const dx = cursorX - prevX
    const dy = cursorY - prevY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const THR = 0.03
    let gesture = base
    if (base === 'PINCH' || base === 'OPEN' || base === 'CLOSED') {
      if (Math.max(absX, absY) > THR) {
        let dir = ''
        if (absX >= absY) dir = dx > 0 ? 'RIGHT' : 'LEFT'
        else dir = dy > 0 ? 'DOWN' : 'UP'
        gesture = `${base}_${dir}`
      }
    }
    prevX = cursorX
    prevY = cursorY
    emitGesture(gesture, isPinching, cursorX, cursorY)
  } else {
    emitGesture('IDLE', false, 0.5, 0.5)
  }
}

onMounted(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
  if (videoRef.value) {
    videoRef.value.srcObject = stream
    await videoRef.value.play()
    isReady.value = true
  }
  hands = new (window as any).Hands({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  })
  hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
  hands.onResults(onResults)
  const loop = async () => {
    if (hands && videoRef.value && videoRef.value.readyState === 4) {
      await hands.send({ image: videoRef.value })
    }
    raf = requestAnimationFrame(loop)
  }
  loop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (hands) hands.close()
  const stream = videoRef.value?.srcObject as MediaStream | null
  stream?.getTracks().forEach((t) => t.stop())
})
</script>

<template>
  <div
    class="pointer-events-none w-48 h-36 border border-cyan-800 bg-black/80 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.2)]"
  >
    <video ref="videoRef" class="absolute inset-0 w-full h-full object-cover opacity-50" playsinline muted></video>
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full object-cover z-10"></canvas>
    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center text-cyan-500 text-xs">
      INITIALIZING CAM...
    </div>
  </div>
</template>

<style scoped></style>
