<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import Aplayer from './components/Aplayer.vue'
import {
  NConfigProvider,
  NMessageProvider,
  darkTheme,
  GlobalThemeOverrides
} from 'naive-ui'

// 导入 vfonts
import 'vfonts/FiraCode.css'
import 'vfonts/Inter.css'

const router = useRouter()

// 自定义主题
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#00ff00',
    primaryColorHover: '#00cc00',
    primaryColorPressed: '#009900',
  },
  Card: {
    color: 'rgba(18, 18, 18, 0.8)',
    borderRadius: '4px',
  },
  Button: {
    textColor: '#fff',
    borderRadius: '4px',
  },
  Input: {
    borderRadius: '4px',
  }
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view></router-view>
      <Aplayer
        :mini="true"
        :float="true"
        :mutex="true"
        theme="#41b883"
        :autoplay="true"
        :volume="0.7"
        :listFolded="true"
      />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
:root {
  /* Discord主题色变量 */
  --discord-bg: #36393f;
  --discord-primary: #5865f2;
  --discord-primary-hover: #4752c4;
  --discord-danger: #ed4245;
  --discord-danger-hover: #c03537;
  --discord-text: #dcddde;
  --discord-text-muted: #72767d;
  --discord-highlight: #18191c;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Fira Code', 'Source Code Pro', monospace;
}

* {
  font-family: var(--font-family);
}

.n-text-mono {
  font-family: var(--font-family-mono);
}

body {
  margin: 0;
  background: var(--discord-bg);
  color: var(--discord-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
