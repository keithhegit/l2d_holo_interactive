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

    // Finger States: Thumb, Index, Middle, Ring, Pinky
    const fingerStates = [false, false, false, false, false]
    const fingerTips = [8, 12, 16, 20]
    const fingerPips = [6, 10, 14, 18]

    // Check Index, Middle, Ring, Pinky
    for (let i = 0; i < fingerTips.length; i++) {
      const tipDist = getDistance(lm[fingerTips[i]], wrist)
      const pipDist = getDistance(lm[fingerPips[i]], wrist)
      if (tipDist > pipDist * 1.1) {
        fingerStates[i + 1] = true
      }
    }

    // Check Thumb
    // Thumb is tricky. Simplified check: tip is far from index MCP (5) and Pinky MCP (17)
    const thumbDist = getDistance(thumbTip, lm[17])
    const thumbPip = lm[2]
    const thumbTipDist = getDistance(thumbTip, wrist)
    const thumbPipDist = getDistance(thumbPip, wrist)
    // 拇指伸直通常意味着指尖离手腕比关节远，且横向张开
    const isThumbExtended = thumbDist > 0.15 && thumbTipDist > thumbPipDist
    if (isThumbExtended) fingerStates[0] = true

    const extendedCount = fingerStates.filter((s) => s).length

    let base = 'IDLE'

    // Classification logic
    // Priority: Special Gestures -> Count -> General

    // THUMBS_UP: Thumb extended, others curled (Index, Middle, Ring, Pinky false)
    if (fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]) {
      base = 'THUMBS_UP'
    }
    // PISTOL: Thumb and Index extended, others curled
    else if (fingerStates[0] && fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]) {
      base = 'PISTOL'
    }
    // THREE: 3 fingers extended (Any 3, usually Thumb+Index+Middle or Index+Middle+Ring)
    else if (extendedCount === 3) {
      base = 'THREE'
    }
    // FOUR: 4 fingers extended
    else if (extendedCount === 4) {
      base = 'FOUR'
    }
    // OPEN: 5 fingers extended
    else if (extendedCount === 5) {
      base = 'OPEN'
    }
    // CLOSED: 0 or 1 finger extended (if not Thumbs Up/Pistol)
    else if (extendedCount <= 1) {
      // Double check pinch
      if (isPinching) base = 'PINCH'
      else base = 'CLOSED'
    } else if (isPinching) {
      base = 'PINCH'
    }

    const dx = cursorX - prevX
    const dy = cursorY - prevY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const THR = 0.03

    let gesture = base

    // Only allow direction modifiers for specific base gestures to avoid confusion
    // Users specifically asked for "Swipe Left/Right" (Open Left/Right)
    if (base === 'OPEN' || base === 'CLOSED') {
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
