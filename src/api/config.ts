import type { ApiConfig } from './types'

const isDev = process.env.NODE_ENV === 'development'

export const apiConfig: ApiConfig = {
  baseURL: isDev ? 'http://localhost:3000/api' : '/api',
  wsURL: isDev ? 'ws://localhost:3000/ws' : `//${window.location.host}/ws`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}
