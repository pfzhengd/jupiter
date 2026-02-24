import { hasOwn } from './common'

type Listener = (...args: unknown[]) => void
type Unsubscriber = () => boolean
type TStore = Record<string, Set<Listener>>
type TSubscriberSnapshot = Readonly<Record<string, readonly Listener[]>>
export interface IEventBus {
  subscribe: (channel: string, commit: Listener) => Unsubscriber
  publish: (channel: string, ...args: unknown[]) => void
  unsubscribe: (channel: string, commit?: Listener) => boolean
  getSubscribers:()=>TSubscriberSnapshot
}

/**
 * EventBus 用于页面内的消息发布订阅：
 * - subscribe 订阅频道并返回取消订阅函数
 * - publish 向频道广播消息
 * - unsubscribe 取消指定订阅或清空频道
 */
export class EventBus implements IEventBus {
  private store: TStore = {}

  /** 订阅频道，返回对应的取消订阅函数。 */
  subscribe (channel: string, commit: Listener): Unsubscriber {
    if (hasOwn(this.store, channel)) {
      this.store[channel].add(commit)
    } else {
      this.store[channel] = new Set([commit])
    }
    return () => this.unsubscribe(channel, commit)
  }

  /** 向指定频道发布消息，单个回调异常不会影响其他回调。 */
  publish (channel: string, ...args: unknown[]): void {
    if (hasOwn(this.store, channel)) {
      this.store[channel].forEach((commit: Listener) => {
        try {
          commit(...args)
        } catch (err) {
          console.warn(`The commit in channel '${channel}' threw an error.`, err)
        }
      })
    } else {
      console.warn(`The '${channel}' is not found by the 'store'.`)
    }
  }

  /** 取消订阅；不传 commit 时清空整个频道。 */
  unsubscribe (channel: string, commit?: Listener): boolean {
    if (hasOwn(this.store, channel)) {
      if (commit) {
        const commits:Set<Listener> = this.store[channel]
        const deleted = commits.delete(commit)
        if (deleted) {
          if (commits.size === 0) {
            delete this.store[channel]
          }
        } else {
          console.warn(`The ${commit} is not found by the 'store'.`)
        }
      } else {
        delete this.store[channel]
      }
    } else {
      console.warn(`The '${channel}' is not found by the 'store'.`)
    }
    return true
  }

  /** 获取订阅快照（只读，不暴露内部可变 Set）。 */
  getSubscribers (): TSubscriberSnapshot {
    const snapshot: Record<string, readonly Listener[]> = {}
    Object.keys(this.store).forEach((channel) => {
      snapshot[channel] = Object.freeze(Array.from(this.store[channel]))
    })
    return Object.freeze(snapshot)
  }
}

