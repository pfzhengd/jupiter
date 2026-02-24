import { hasOwn } from './common'

type Listener = (...args: unknown[]) => void
type TStore = Record<string, Set<Listener>>
type TSubscriberSnapshot = Readonly<Record<string, readonly Listener[]>>
export interface IBroadcaster {
  subscribe: (channel: string, commit: Listener) => void
  publish: (channel: string, data: unknown | unknown[]) => void
  unsubscribe: (channel: string, commit?: Listener) => boolean
  getSubscribers:()=>TSubscriberSnapshot
}

export const Broadcaster = (): IBroadcaster => {
  const store: TStore = {}

  return {
    /** 订阅广播 */
    subscribe: (channel: string, commit: Listener): void => {
      if (hasOwn(store, channel)) {
        store[channel].add(commit)
      } else {
        store[channel] = new Set([commit])
      }
    },

    /** 广播消息 */
    publish: (channel: string, data: unknown | unknown[]): void => {
      if (hasOwn(store, channel)) {
        if (!Array.isArray(data)) {
          data = [data]
        }

        store[channel].forEach((commit: Listener) => {
          try {
            commit.apply(null, data)
          } catch (err) {
            console.warn(`The commit in channel '${channel}' threw an error.`, err)
          }
        })
      } else {
        console.warn(`The '${channel}' is not found by the 'store'.`)
      }
    },

    /** 取消订阅广播 */
    unsubscribe: (channel: string, commit?: Listener): boolean => {
      if (hasOwn(store, channel)) {
        if (commit) {
          const commits:Set<Listener> = store[channel]
          const deleted = commits.delete(commit)
          if (deleted) {
            if (commits.size === 0) {
              delete store[channel]
            }
          } else {
            console.warn(`The ${commit} is not found by the 'store'.`)
          }
        } else {
          delete store[channel]
        }
      } else {
        console.warn(`The '${channel}' is not found by the 'store'.`)
      }
      return true
    },

    /**
     * 获取订阅个数
     */
    getSubscribers () {
      const snapshot: Record<string, readonly Listener[]> = {}
      Object.keys(store).forEach((channel) => {
        snapshot[channel] = Object.freeze(Array.from(store[channel]))
      })
      return Object.freeze(snapshot)
    }
  }
}

export default {}
