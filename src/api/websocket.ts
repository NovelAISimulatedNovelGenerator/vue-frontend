import type { WsClientMessage, WsServerMessage } from '../types'
import { mockWsService } from './mock-ws'

export class WebSocketApi {
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    // 添加模拟消息处理器
    mockWsService.addMessageHandler(this.handleMessage.bind(this))
  }

  private handleMessage(message: WsServerMessage) {
    const handlers = this.messageHandlers.get(message.type)
    handlers?.forEach(handler => handler(message.data))
  }

  subscribe<T>(type: string, handler: (data: T) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    this.messageHandlers.get(type)?.add(handler)
  }

  unsubscribe<T>(type: string, handler: (data: T) => void) {
    this.messageHandlers.get(type)?.delete(handler)
  }

  send(type: WsClientMessage['type'], data: any) {
    // 使用模拟服务处理消息
    mockWsService.handleClientMessage({ type, data })
  }
}
