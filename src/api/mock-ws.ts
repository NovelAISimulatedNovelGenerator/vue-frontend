import type { WsClientMessage, WsServerMessage, Archive, GameEvent } from '../types'
import { mockService } from './mock'

type MessageHandler = (message: WsServerMessage) => void

export class MockWebSocketService {
  private handlers: Set<MessageHandler> = new Set()
  private currentArchiveId: string | null = null
  private eventCounter: number = 0  // 添加计数器

  addMessageHandler(handler: MessageHandler) {
    this.handlers.add(handler)
  }

  removeMessageHandler(handler: MessageHandler) {
    this.handlers.delete(handler)
  }

  private broadcast<T>(type: WsServerMessage['type'], data: T) {
    const message: WsServerMessage = {
      type,
      data,
      timestamp: Date.now()
    }
    this.handlers.forEach(handler => handler(message))
  }

  private getEventWithCounter(): GameEvent {
    return {
      event_id: `xianzhou_001 第${this.eventCounter}次选择`,
      type: "manual",
      name: `云无留迹 - 第${this.eventCounter}次选择`,
      "description": "玉衡城的天街飘着细雪，我站在朱漆斑驳的檐廊下，看着茶摊蒸腾的水雾里浮动的光影。说书人沙哑的嗓音穿透喧闹市声：\\\"要说这云中楼啊，每逢甲子轮回的星轨交汇之夜......\\\"\n\n茶碗里的碧色茶汤突然泛起涟漪。我按住腰间星穹列车的通讯器，能量读数正以诡异频率跳动。茶摊老板擦拭陶碗的手顿了顿，布满皱纹的眼角扫过我的异邦装扮，\\\"客官若想观云中奇景，需等到戌时三刻。\\\"他压低声音，枯枝般的手指在桌面划出暗红纹路，\\\"但切记莫要应答楼中呼唤。\\\"\n\n暮色四合时，我在云纹石阶上闻到腐朽的沉香。这座七层八角塔楼如同被时光遗忘的琥珀，琉璃瓦缝隙间垂落淡紫色的星芒。按《罗浮星经》推算，今夜恰逢青龙七宿与虚危二垣交叠，是观测量子纠缠现象的绝佳时机。\n\n盘坐在第三重飞檐的阴影里，我闭目感受灵台波动。戌时的更鼓穿透浓雾，耳畔忽然响起细碎银铃声——那是星槎海战时期天舶司特制的预警法器。再睁眼时，整座楼阁正褪去尘封外壳，无数半透明的星轨在梁柱间流转，宛如游弋在深海的水母群。\n\n\\\"当心！\\\"背后传来少女的惊呼。转身瞬间，我看见飘荡的素白襦裙掠过朱漆廊柱，绣着二十八星宿的衣袂被某种力量撕扯成光粒。地面浮现出暗红斑痕，那分明是六十年前星核污染事件中特有的结晶血渍。\n\n量子纠缠产生的幻象越来越清晰。我看见七名占星师围坐在顶层的浑天仪旁，他们的指尖流淌着银河般的光带，却在某个瞬间全部凝固成痛苦扭曲的姿势。最年长的老者胸口绽放出幽蓝冰花，那是被反物质侵蚀的典型症状。\n\n\\\"救...救...\\\"断断续续的灵波突然刺入意识，我循着波动望向西北角的斗拱，那里嵌着半块残缺的玉衡盘。当指尖触到冰凉的玉玦时，整座建筑突然剧烈震颤，青金石地面浮现出双重逆时针旋转的星阵——现代与往昔的星轨在此刻重叠。\n\n顶楼传来浑天仪齿轮卡死的刺耳声响，六十年前未完成的封印仪式正在量子领域重现。我掏出随身携带的星核稳定器，淡金色流光沿着古星阵的凹槽蔓延，却在触及核心时被某种黑色物质吞噬。那些被困在时空夹缝中的灵魂发出尖啸，他们的灵体正被两股相反的时间流撕扯。\n\n\\\"兑位转离宫！\\\"突然出现的白发老者挥动星幡，他道袍上绣着的云骑军徽记已褪成暗红，\\\"用虚数能量填补巽位缺口！\\\"我们同时将星穹列车的跃迁引擎能量注入阵眼，古老浑天仪突然爆发出刺目光芒，两重星阵终于咬合转动。\n\n当最后一丝黑雾消散时，玉衡盘浮现出全息投影：六十年前的监控记录显示，有戴着青铜面具的神秘人破坏了封印阵。那些本应安息的占星师们，是被刻意困在时空裂缝中的活祭品。\n\n茶摊老板不知何时出现在台阶尽头，他手中提着的灯笼映出眼角泪光：\\\"当年失踪的七曜星官...终于可以魂归星海了。\\\"夜风卷起他空荡荡的左袖，露出皮肤上被反物质灼伤的星形疤痕。",
      forks: [
        {
          event_id: "xianzhou_001_investigate",
          name: "调查真相",
          description: "你决定深入调查这个传言。或许这背后隐藏着什么重要的秘密，也可能是某种超自然现象的显现。作为开拓者，探索未知正是你的使命之一。"
        },
        {
          event_id: "xianzhou_001_meditation",
          name: "云端冥想",
          description: "你选择在云中楼附近找一个安静的角落打坐冥想。也许通过心灵的沉淀，你能感受到这个地方特殊的灵气，领悟到一些常人难以察觉的玄机。"
        },
        {
          event_id: "xianzhou_001_奶龙",
          name: "展露惊世修为",
          description: "奶龙大帝1a秒了。"
        },
        {
          event_id: "xianzhou_001_meditation",
          name: "云端冥想",
          description: "你选择在云中楼附近找一个安静的角落打坐冥想。也许通过心灵的沉淀，你能感受到这个地方特殊的灵气，领悟到一些常人难以察觉的玄机。"
        },
        {
          event_id: "xianzhou_001_奶龙",
          name: "展露惊世修为",
          description: "奶龙大帝1a秒了。"
        },
        {
          event_id: "xianzhou_001_meditation",
          name: "云端冥想",
          description: "你选择在云中楼附近找一个安静的角落打坐冥想。也许通过心灵的沉淀，你能感受到这个地方特殊的灵气，领悟到一些常人难以察觉的玄机。"
        },
        {
          event_id: "xianzhou_001_奶龙",
          name: "展露惊世修为",
          description: "奶龙大帝1a秒了。"
        },
        {
          event_id: "xianzhou_001_奶龙",
          name: "展露惊世修为",
          description: "奶龙大帝1a秒了。"
        },
        {
          event_id: "xianzhou_001_meditation",
          name: "云端冥想",
          description: "你选择在云中楼附近找一个安静的角落打坐冥想。也许通过心灵的沉淀，你能感受到这个地方特殊的灵气，领悟到一些常人难以察觉的玄机。"
        },
        {
          event_id: "xianzhou_001_奶龙",
          name: "展露惊世修为",
          description: "奶龙大帝1a秒了。"
        }
      ]
    }
  }

  // 模拟接收消息处理
  async handleClientMessage(message: WsClientMessage) {
    switch (message.type) {
      case 'SWITCH_ARCHIVE': {
        const archiveId = message.data as string
        if (this.currentArchiveId !== archiveId) {
          this.currentArchiveId = archiveId
          const response = await mockService.getArchives()
          const archive = response.data.find(a => a.id === archiveId)
          if (archive) {
            // 切换存档时使用新的事件
            const event = this.getEventWithCounter()
            archive.currentEvent = event
            await mockService.updateArchive(archiveId, { currentEvent: event })
            
            this.broadcast('ARCHIVE_UPDATED', archive)
            this.broadcast('CURRENT_EVENT', event)
            this.broadcast('ATTRIBUTE_UPDATED', archive.attributes)
          }
        }
        break
      }

      case 'EXECUTE_EVENT': {
        const { archiveId, eventId } = message.data as { archiveId: string, eventId: string }
        if (!this.currentArchiveId || this.currentArchiveId !== archiveId) {
          this.broadcast('ERROR', { message: '存档未选择或不匹配' })
          return
        }

        // 增加计数
        this.eventCounter++

        // 更新属性
        this.broadcast('UPDATE_ATTRIBUTE', {
          attributeId: '基础属性_生命值',
          value: Math.floor(Math.random() * 100)
        })

        // 使用统一的事件生成方法
        const nextEvent = this.getEventWithCounter()
        
        // 更新存档的当前事件
        const response = await mockService.getArchives()
        const archive = response.data.find(a => a.id === archiveId)
        if (archive) {
          archive.currentEvent = nextEvent
          await mockService.updateArchive(archiveId, { currentEvent: nextEvent })
          this.broadcast('CURRENT_EVENT', nextEvent)
        }
        break
      }
    }
  }
}

export const mockWsService = new MockWebSocketService()
