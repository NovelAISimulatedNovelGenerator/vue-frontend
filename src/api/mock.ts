import type { MockStorage, MockResponse } from './types'
import type { Archive } from '../types'

const STORAGE_KEY = 'novelai-archives-mock'

// 默认属性配置
const DEFAULT_ATTRIBUTES = {
  '基础属性_生命值': 1000,
  '基础属性_魔力': 500,
  '基础属性_体力': 1000,
  '基础属性_智力': 500,
  '基础属性_感应': 1000,
  '基础属性_san': 500,
  '技能_火焰': 100,
  '技能_冰霜': 50,
  '道具_三连击': 100,
  '道具_药': 50,
  '好感度_黄泉老婆': 999999999,
  '好感度_牛赢': 999999999,
  // ...其他属性保持不变...
}

class MockService {
  private storage: MockStorage = {
    archives: []
  }

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      this.storage = JSON.parse(stored)
    } else {
      // 初始测试数据
      this.storage.archives = [{
        id: '114514',
        title: '有我奶龙便有天',
        imageUrl: 'https://moe.jitsu.top/api/?sort=setu',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attributes: { ...DEFAULT_ATTRIBUTES },
        eventPool: [],
        passiveEventPool: [],
        executedEvents: [],
      }]
      this.saveToStorage()
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage))
  }

  private delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getArchives(): MockResponse<Archive[]> {
    await this.delay()
    return {
      code: 200,
      message: 'success',
      data: this.storage.archives
    }
  }

  async createArchive(data: Partial<Archive>): MockResponse<Archive> {
    await this.delay()
    const newArchive = {
      ...data,
      id: Date.now().toString(),
      attributes: data.attributes || { ...DEFAULT_ATTRIBUTES },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Archive

    this.storage.archives.unshift(newArchive)
    this.saveToStorage()

    return {
      code: 200,
      message: 'success',
      data: newArchive
    }
  }

  async updateArchive(id: string, data: Partial<Archive>): MockResponse<Archive> {
    await this.delay()
    const index = this.storage.archives.findIndex(a => a.id === id)
    if (index === -1) {
      throw new Error('存档不存在')
    }

    const updatedArchive = {
      ...this.storage.archives[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    this.storage.archives[index] = updatedArchive
    this.saveToStorage()

    return {
      code: 200,
      message: 'success',
      data: updatedArchive
    }
  }

  async deleteArchive(id: string): MockResponse<void> {
    await this.delay()
    const index = this.storage.archives.findIndex(a => a.id === id)
    if (index !== -1) {
      this.storage.archives.splice(index, 1)
      this.saveToStorage()
    }

    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  }
}

export const mockService = new MockService()
