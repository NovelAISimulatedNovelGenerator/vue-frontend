<template>
  <div ref="playerRef" class="aplayer-wrapper"></div>
</template>
  
<script lang="ts" setup>
import APlayer from 'aplayer';
import 'aplayer/dist/APlayer.min.css';
import type {PropType} from '@vue/runtime-core';
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
  
const playerRef = ref()
let instance: any;

// 定义正确的 props
const props = defineProps({
  // 迷你模式
  mini: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 浮动模式
  float: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 显示歌词
  showLrc: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 互斥播放
  mutex: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  // 主题色
  theme: {
    type: String as PropType<string>,
    default: '#41b883'
  },
  // 随机播放
  shuffle: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 循环模式
  repeat: {
    type: String as PropType<'repeat-one' | 'repeat-all' | 'no-repeat'>,
    default: 'no-repeat'
  },
  // 列表最大高度
  listMaxHeight: {
    type: String as PropType<string>,
    default: 'none'
  },
  // 列表默认收起
  listFolded: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 自动播放
  autoplay: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  // 预加载
  preload: {
    type: String as PropType<'none' | 'metadata' | 'auto'>,
    default: 'metadata'
  },
  // 音量
  volume: {
    type: Number as PropType<number>,
    default: 0.8
  }
})

// 初始化播放器
onMounted(() => {
  nextTick(() => {
    instance = new APlayer({
      container: playerRef.value,
      mini: props.mini,
      float: props.float,
      showLrc: props.showLrc,
      mutex: props.mutex,
      theme: props.theme,
      listMaxHeight: props.listMaxHeight,
      listFolded: props.listFolded,
      autoplay: true,
      preload: 'auto',
      volume: props.volume,
      audio: [{
        name: '郭天昊',
        artist: '生生世世爱（竹笛版）',
        url: '/生生世世爱（竹笛版） - 郭天昊.mp3',  // 使用本地文件
        cover: '/image/hqq.jpg'
      }]
    })
  })
})

// 销毁
onBeforeUnmount(() => {
  if (instance) {
    instance.destroy()
  }
})
</script>

<style>
/* 设置容器样式 */
.aplayer-wrapper {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483647;
  border-radius: 50% !important;
  overflow: hidden !important;
}

/* 播放器固定定位样式 */
.aplayer.aplayer-fixed {
  right: 20px !important;
  bottom: 20px !important;
  left: unset !important;
  max-width: 400px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
}

/* 播放器主体样式 */
.aplayer.aplayer-fixed .aplayer-body {
  border-radius: 50% !important;
  overflow: hidden !important;
}

.aplayer .aplayer-pic {
  border-radius: 50% !important;
  overflow: hidden !important;
}

/* mini模式下的圆形样式 */
.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
  border-radius: 50% !important;
}

/* 悬停效果 */
.aplayer-wrapper:hover {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* 展开模式下的样式 */
.aplayer:not(.aplayer-narrow) .aplayer-info {
  border-radius: 25px !important;
  overflow: hidden !important;
}

/* 确保没有任何白色边框 */
.aplayer {
  margin: 0 !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}
</style>