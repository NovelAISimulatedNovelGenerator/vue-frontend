export interface Archive {
  id: string;
  imageUrl?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  currentEvent?: GameEvent;
  attributes?: Record<string, any>;
  executedEvents?: string[];
}

export interface GameEvent {
  event_id: string;
  type: string;
  name: string;
  description: string;
  forks: Array<{
    event_id: string;
    name: string;
    description: string;
  }>;
}

export interface WsClientMessage {
  type: string;
  data?: any;
}

export interface WsServerMessage {
  type: string;
  data?: any;
}

export interface UserInfo {
  id: string;
  name: string;
}
