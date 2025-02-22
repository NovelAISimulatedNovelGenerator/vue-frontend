<template>
  <div class="audio-player-container" ref="playerRef"></div>
</template>

<script setup lang="ts">
import APlayer from 'aplayer'
import 'aplayer/dist/APlayer.min.css'
import { reactive, onBeforeUnmount, onMounted, ref } from 'vue'

const playerRef = ref<HTMLElement | null>(null)
const state = reactive({
  instance: null as any
})

// 测试音频数据
const testAudio = {
  artist: '测试歌手',
  name: '测试歌曲',
  url: 'https://example.com/test.mp3',
  cover: 'https://example.com/cover.jpg',
  lrc: '[00:00.00]测试歌词'
}

onMounted(() => {
  if (playerRef.value) {
    state.instance = new APlayer({
      container: playerRef.value,
      fixed: true,
      mini: false,
      autoplay: false,
      theme: '#409eff',
      loop: 'all',
      order: 'random',
      preload: 'auto',
      volume: 0.7,
      mutex: true,
      lrcType: 3,
      listFolded: true,
      listMaxHeight: '200px',
      storageName: 'aplayer-setting',
      audio: [testAudio]
    })
  }
})

onBeforeUnmount(() => {
  if (state.instance) {
    state.instance.destroy()
  }
})
</script>

<style>
/* 容器样式 */
.audio-player-container {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
}

/* 播放器基础样式 */
.aplayer {
  z-index: 99999 !important;
  pointer-events: auto;
}

/* 固定播放器位置 */
.aplayer.aplayer-fixed {
  position: fixed !important;
  max-width: 300px !important;
  margin: 0 !important;
  right: 20px !important;
  left: auto !important;
  bottom: 20px !important;
  z-index: 99999 !important;
}

/* 播放列表样式 */
.aplayer.aplayer-fixed .aplayer-list {
  position: absolute !important;
  bottom: 100% !important;
  right: 0 !important;
  left: auto !important;
  max-height: 400px !important;
  z-index: 99999 !important;
}

/* 播放器主体 */
.aplayer.aplayer-fixed .aplayer-body {
  position: fixed !important;
  right: 20px !important;
  left: auto !important;
  bottom: 20px !important;
  z-index: 99999 !important;
}

/* 迷你开关按钮 */
.aplayer.aplayer-fixed .aplayer-miniswitcher {
  position: absolute !important;
  right: 0 !important;
  z-index: 99999 !important;
}
</style>