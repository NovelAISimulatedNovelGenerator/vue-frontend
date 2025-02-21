declare module 'aplayer' {
  interface APlayerAudio {
    name: string
    artist: string
    url: string
    cover: string
    lrc?: string
    theme?: string
  }

  interface APlayerOptions {
    container: HTMLElement
    mini?: boolean
    autoplay?: boolean
    theme?: string
    loop?: 'all' | 'one' | 'none'
    preload?: 'auto' | 'metadata' | 'none'
    volume?: number
    mutex?: boolean
    listFolded?: boolean
    fixed?: boolean
    audio: APlayerAudio | APlayerAudio[]
  }

  export default class APlayer {
    constructor(options: APlayerOptions)
    play(): void
    pause(): void
    seek(time: number): void
    toggle(): void
  }
}
