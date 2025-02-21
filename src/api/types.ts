// API 响应的基础接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// WebSocket 消息类型
export interface WsMessage<T = any> {
  type: string
  data: T
  timestamp: number
}

// API 配置接口
export interface ApiConfig {
  baseURL: string
  wsURL: string
  timeout?: number
  headers?: Record<string, string>
}

// 模拟数据存储
export interface MockStorage {
  archives: Archive[]
}

// 添加模拟数据工具类型
export type MockResponse<T> = Promise<ApiResponse<T>>
