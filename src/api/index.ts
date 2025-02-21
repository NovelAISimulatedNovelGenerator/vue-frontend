import { HttpApi } from './http'
import { WebSocketApi } from './websocket'

export const httpApi = new HttpApi()
export const wsApi = new WebSocketApi()

// 可以在这里导出一些便捷方法
export const api = {
  http: httpApi,
  ws: wsApi,
  
  // 便捷方法示例
  async refreshArchives() {
    return httpApi.getArchives()
  },
  
  subscribeGameEvents(handler: (data: any) => void) {
    wsApi.subscribe('game_event', handler)
  }
}

export default api
