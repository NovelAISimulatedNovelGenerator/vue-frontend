import { defineStore } from 'pinia'
import type { Archive, GameEvent } from '../types'
import { api } from '../api'

const STORAGE_KEY = 'novelai-archives'

// 存储时保存基础URL，不保存时间戳参数
const stripUrlParams = (url: string) => {
  try {
    const urlObj = new URL(url)
    urlObj.search = '' // 清除所有查询参数
    return urlObj.toString()
  } catch {
    return url
  }
}

// 添加时间戳参数
const addUrlTimestamp = (url: string) => {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('_t', Math.random().toString(36).substring(2))
    return urlObj.toString()
  } catch {
    return url
  }
}

// 更新默认属性
const DEFAULT_ATTRIBUTES = {
  // 基础属性
  '基础属性_生命值': 1000,
  '基础属性_魔力': 500,
  '基础属性_体力': 100,
  '进阶属性_力量': 10,
  '进阶属性_敏捷': 20,
  '进阶属性_智力': 30,
  // 战斗属性
  '战斗属性_攻击力': 50,
  '战斗属性_防御力': 30,
  '战斗属性_暴击率': 10,
  '战斗属性_暴击伤害': 200,
  // 技能属性
  '技能_火焰': 100,
  '技能_冰霜': 50,
  '道具_三连击': 100,
  '道具_药': 50,
  '好感度_黄泉老婆': 999999999,
  '好感度_牛赢': 999999999,
  // 其他属性
  'other_移动速度': 300,
}

export const useArchiveStore = defineStore('archive', {
  state: () => ({
    archives: [] as Archive[],
    currentArchiveId: null as string | null,
    loading: false,
    error: null as string | null,
    creating: false,
  }),

  getters: {
    getCurrentArchive: (state) => 
      state.archives.find(archive => archive.id === state.currentArchiveId),
    
    getArchives: (state) => state.archives,
  },

  actions: {
    setCurrentArchive(archiveId: string) {
      this.currentArchiveId = archiveId
    },

    // 加载存档数据
    async loadArchives() {
      this.loading = true
      this.error = null
      try {
        const response = await api.http.getArchives()
        this.archives = response.data.map((archive: Archive) => ({
          ...archive,
          imageUrl: addUrlTimestamp(archive.imageUrl)
        }))
      } catch (err) {
        this.error = '加载存档失败'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 保存到本地存储 - 保存时去除时间戳参数
    async saveArchives() {
      return // API 模式下不需要手动保存
    },

    // 创建新存档
    async createArchive(title: string) {
      try {
        this.creating = true
        this.error = null

        // 检查是否存在同名存档
        if (this.archives.some(a => a.title === title)) {
          throw new Error('已存在同名存档')
        }

        const response = await api.http.createArchive({
          title,
          imageUrl: 'https://moe.jitsu.top/api/?sort=setu'
        })

        const newArchive = {
          ...response.data,
          imageUrl: addUrlTimestamp(response.data.imageUrl)
        }

        this.archives = [newArchive, ...this.archives]

        return {
          success: true,
          archive: newArchive
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建存档失败'
        return {
          success: false,
          error: this.error
        }
      } finally {
        this.creating = false
      }
    },

    // 重写更新存档方法
    async updateArchive(archive: Archive) {
      try {
        const response = await api.http.updateArchive(archive.id, archive)
        const updatedArchive = {
          ...response.data,
          imageUrl: addUrlTimestamp(response.data.imageUrl)
        }
        
        const index = this.archives.findIndex(a => a.id === archive.id)
        if (index !== -1) {
          this.archives[index] = updatedArchive
        }
      } catch (err) {
        this.error = '更新存档失败'
        console.error(err)
      }
    },

    // 重写删除存档方法
    async deleteArchive(archiveId: string) {
      try {
        await api.http.deleteArchive(archiveId)
        const index = this.archives.findIndex(a => a.id === archiveId)
        if (index !== -1) {
          this.archives.splice(index, 1)
          if (this.currentArchiveId === archiveId) {
            this.currentArchiveId = null
          }
        }
      } catch (err) {
        this.error = '删除存档失败'
        console.error(err)
      }
    },

    // 游戏逻辑相关的操作
    executeEvent(archiveId: string, eventId: string) {
      const archive = this.archives.find(a => a.id === archiveId)
      if (archive) {
        archive.executedEvents.push(eventId)
        archive.updatedAt = new Date().toISOString()
      }
    },

    async updateArchiveTitle(archiveId: string, newTitle: string) {
      try {
        this.error = null

        // 检查是否存在同名存档（排除自身）
        if (this.archives.some(a => a.id !== archiveId && a.title === newTitle)) {
          throw new Error('已存在同名存档')
        }

        const index = this.archives.findIndex(a => a.id === archiveId)
        if (index === -1) {
          throw new Error('存档不存在')
        }

        const updatedArchive = {
          ...this.archives[index],
          title: newTitle,
          updatedAt: new Date().toISOString()
        }

        await api.http.updateArchive(archiveId, { title: newTitle })

        this.archives[index] = updatedArchive

        return {
          success: true,
          archive: updatedArchive
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : '更新存档失败'
        this.error = error
        return {
          success: false,
          error
        }
      }
    },

    // 修改更新图片方法
    async updateArchiveImage(archiveId: string, imageUrl: string) {
      try {
        const index = this.archives.findIndex(a => a.id === archiveId)
        if (index === -1) {
          throw new Error('存档不存在')
        }

        // 保存基础URL，但显示时添加随机参数
        const baseUrl = stripUrlParams(imageUrl)
        this.archives[index] = {
          ...this.archives[index],
          imageUrl: addUrlTimestamp(baseUrl),
          updatedAt: new Date().toISOString()
        }

        await api.http.updateArchive(archiveId, { imageUrl: baseUrl })

        return {
          success: true,
          archive: this.archives[index]
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : '更新图片失败'
        this.error = error
        return {
          success: false,
          error
        }
      }
    },

    // 添加更新当前事件的方法
    async updateCurrentEvent(archiveId: string, event: GameEvent) {
      try {
        const archive = this.archives.find(a => a.id === archiveId)
        if (!archive) {
          throw new Error('存档不存在')
        }

        const updatedArchive = {
          ...archive,
          currentEvent: event,
          updatedAt: new Date().toISOString()
        }

        await api.http.updateArchive(archiveId, { currentEvent: event })
        
        const index = this.archives.findIndex(a => a.id === archiveId)
        if (index !== -1) {
          this.archives[index] = updatedArchive
        }
      } catch (err) {
        this.error = '更新当前事件失败'
        console.error(err)
      }
    },
  },
})
