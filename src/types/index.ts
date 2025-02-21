export interface UserInfo {
  id: string
  username: string
  avatar: string
  status: 'online' | 'offline' | 'away'
}

export interface Attribute {
  id: string
  name: string
  value: number
  max?: number
  min?: number
}

export interface Event {
  id: string
  title: string
  description: string
  conditions?: EventCondition[]
  effects?: EventEffect[]
  choices?: EventChoice[]
  isRepeatable: boolean
}

export interface EventCondition {
  attributeId: string
  operator: '>>' | '<<' | '>=' | '<=' | '==' | '!='
  value: number
}

export interface EventEffect {
  attributeId: string
  value: number
  operator: '+' | '-' | '*' | '/' | '='
}

export interface EventChoice {
  id: string
  text: string
  effects: EventEffect[]
  nextEventId?: string
}

// 基础属性类型
export interface Attributes {
  [key: string]: number
}

// 存档数据模型
export interface Archive {
  id: string
  usrId: string
  title: string
  imageUrl?: string  // 可选的图片URL
  createdAt: string  // ISO 格式的日期字符串
  updatedAt: string  // ISO 格式的日期字符串
  attributes: Attributes  // 各种属性值的键值对
  eventPool: string[]  // 可触发事件池
  passiveEventPool: string[]  // 被动事件池
  executedEvents: string[]  // 已执行的事件列表
  currentEvent: {}  // 当前正在进行事件的完整信息
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 存档操作结果类型
export interface ArchiveOperationResult {
  success: boolean
  archive?: Archive
  error?: string
}
