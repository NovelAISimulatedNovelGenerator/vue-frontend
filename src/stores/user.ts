import { defineStore } from 'pinia'
import type { UserInfo } from '../types'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    isLoggedIn: true, // 暂时默认为登录状态
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
  },

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    logout() {
      this.userInfo = null
      this.isLoggedIn = false
    },
  },
})
