import { LocalStorageStoreOptions } from '../types'
import { isFunction } from './common'


/**
 * LocalStorageStore 的定位：
 * 作为客户端本地缓存操作的统一收口层（API 收口）与能力代理层，
 * 统一管理本地数据的初始化、读写、更新与清理，减少业务侧直接操作 localStorage。
 */
export class LocalStorageStore {
  key:string
  data:unknown
  options:LocalStorageStoreOptions
  constructor (options:LocalStorageStoreOptions) {
    if (typeof localStorage !== 'object') {
      throw new Error('LocalStorage is not a valid Object')
    }
    this.options = options || this._createEmpty()
    this.key = options.key
    this._initData()
  }

  private _createEmpty () {
    return Object.create(null)
  }

  private _initData () {
    const data = localStorage.getItem(this.key)
    if (data) {
      this.data = JSON.parse(data)
    } else {
      if (isFunction(this.options.initData)) {
        this.data = this.options.initData()
      } else {
        this.data = this._createEmpty()
      }
      this.saveup()
    }
  }

  saveup () {
    localStorage.setItem(this.key, JSON.stringify(this.data))
  }

  cleanup () {
    localStorage.removeItem(this.key)
  }

  update (data:unknown) {
    this.data = data
    this.saveup()
  }

  getter (key:string) {
    return this.data[key]
  }
}
