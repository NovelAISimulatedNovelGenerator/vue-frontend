import type { ApiResponse } from './types'
import type { Archive } from '../types'
import { mockService } from './mock'

export class HttpApi {
  // 存档相关接口
  async getArchives(): Promise<ApiResponse<Archive[]>> {
    return mockService.getArchives()
  }

  async createArchive(data: Partial<Archive>): Promise<ApiResponse<Archive>> {
    return mockService.createArchive(data)
  }

  async updateArchive(id: string, data: Partial<Archive>): Promise<ApiResponse<Archive>> {
    return mockService.updateArchive(id, data)
  }

  async deleteArchive(id: string): Promise<ApiResponse<void>> {
    return mockService.deleteArchive(id)
  }

  // 添加用户认证相关接口
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    //await this.delay(1000) // 模拟网络延迟
    if (username === 'admin' && password === 'admin') {
      return {
        code: 200,
        message: 'success',
        data: {
          token: 'mock_token_' + Date.now(),
          user: { id: '1', username }
        }
      }
    }
    throw new Error('用户名或密码错误')
  }

  async register(username: string, password: string): Promise<ApiResponse<any>> {
    await this.delay(1000) // 模拟网络延迟
    return {
      code: 200,
      message: 'success',
      data: {
        token: 'mock_token_' + Date.now(),
        user: { id: Date.now().toString(), username }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
