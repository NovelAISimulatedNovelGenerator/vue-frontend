import { api } from './index'
import type { GameEvent } from '../types'

// WebSocket 消息日志
const logWsMessage = (direction: 'SEND' | 'RECEIVE', type: string, data: any) => {
  console.log(
    `%c[WebSocket ${direction}]%c ${type}`,
    'color: #4a90e2; font-weight: bold',
    'color: #888',
    data
  )
}

export const gameEvents = {
  // 执行事件选择
  executeChoice: async (archiveId: string, choiceId: string, currentEventId: string) => {
    logWsMessage('SEND', 'EXECUTE_EVENT', { archiveId, eventId: choiceId, fromEventId: currentEventId })
    api.ws.send('EXECUTE_EVENT', {
      archiveId,
      eventId: choiceId,
      fromEventId: currentEventId
    })
  },

  // 订阅事件更新
  subscribeEvent: (handler: (event: GameEvent) => void) => {
    const wrappedHandler = (event: GameEvent) => {
      logWsMessage('RECEIVE', 'CURRENT_EVENT', event)
      handler(event)
    }
    api.ws.subscribe('CURRENT_EVENT', wrappedHandler)
    return () => api.ws.unsubscribe('CURRENT_EVENT', wrappedHandler)
  },

  // 订阅属性更新
  subscribeAttributes: (handler: (data: { attributeId: string, value: number }) => void) => {
    const wrappedHandler = (data: { attributeId: string, value: number }) => {
      logWsMessage('RECEIVE', 'UPDATE_ATTRIBUTE', data)
      handler(data)
    }
    api.ws.subscribe('UPDATE_ATTRIBUTE', wrappedHandler)
    return () => api.ws.unsubscribe('UPDATE_ATTRIBUTE', wrappedHandler)
  },

  // 切换存档
  switchArchive: (archiveId: string) => {
    logWsMessage('SEND', 'SWITCH_ARCHIVE', archiveId)
    api.ws.send('SWITCH_ARCHIVE', archiveId)
  }
}
