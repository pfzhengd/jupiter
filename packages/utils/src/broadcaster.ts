import { TNoop } from '../types'
import { hasOwn } from './common'

type TStore = Record<string, any>
export interface IBroadcaster {
  subscribe: (channel: string, commit: Function) => void
  publish: (channel: string, data: any) => void
  unsubscribe: (channel: string, commit?: Function) => boolean
  getSubscribers:()=>TStore
}

export const Broadcaster = (): IBroadcaster => {
  const store: TStore = {}

  return {
    /** 订阅广播 */
    subscribe: (channel: string, commit: TNoop): void => {
      if (hasOwn(store, channel)) {
        store[channel].add(commit)
      } else {
        store[channel] = new Set([commit])
      }
    },

    /** 广播消息 */
    publish: (channel: string, data: any): void => {
      if (hasOwn(store, channel)) {
        if (!Array.isArray(data)) {
          data = [data]
        }

        store[channel].forEach((commit: Function) => {
          commit.apply(null, data)
        })
      } else {
        console.warn(`The '${channel}' is not found by the 'store'.`)
      }
    },

    /** 取消订阅广播 */
    unsubscribe: (channel: string, commit?: TNoop): boolean => {
      if (hasOwn(store, channel)) {
        if (commit) {
          const commits:Array<Function> = store[channel]
          const index = (Array.isArray(commits) && commits.indexOf(commit)) || -1
          if (index > -1) {
            commits.splice(index, 1)
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
      return Object.freeze({ ...store })
    }
  }
}

export default {}
