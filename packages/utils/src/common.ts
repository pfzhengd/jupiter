import { TBaseType } from '../types'

export const hasOwnProperty = Object.prototype.hasOwnProperty
export const _toString = Object.prototype.toString
export const slice = Array.prototype.slice

export const emptyObject: Readonly<{}> = Object.freeze({})

/**
 * 执行一个空操作
 *
 * @export
 * @param {any} args
 * @example
 * noop()
 */
export function noop (...rest: unknown[]): void { }

/**
 * 判断对象是否是纯粹的对象类型
 *
 * @export
 * @param {*} obj
 * @returns
 * @example
 * isPlainObject({ a: 1 }) // true
 * isPlainObject([]) // false
 */
export function isPlainObject (obj: object): boolean {
  if (_toString.call(obj) === '[object Object]') {
    return true
  }
  return false
}

/**
 *  检测对象里是否包含有指定属性
 *
 * @export
 * @param {Object} obj
 * @param {String} key
 * @returns Boolean
 * @example
 * hasOwn({ a: 1 }, 'a') // true
 */
export function hasOwn (obj: object, key: string | number | symbol): boolean {
  return hasOwnProperty.call(obj, key)
}

/**
 *  混合对象里的属性到指定的对象上
 *
 * @export
 * @param {Object} to
 * @param {Object} _from
 * @returns Object
 * @example
 * extend({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
 */
export function extend (to: object, _from: object): object {
  for (const key in _from) {
    if (hasOwn(_from, key)) {
      to[key] = _from[key]
    }
  }
  return to
}

/**
 * 确保只执行一次函数
 *
 * @export
 * @param {Function} fn
 * @returns Function
 * @example
 * const onlyOnce = once(() => 1)
 * onlyOnce() // 1
 * onlyOnce() // 1
 */
export function once<T extends (...args: any[]) => any> (fn: T): T {
  let called = false
  let cachedResult: ReturnType<T>
  let hasCachedResult = false
  return function (...rest: Parameters<T>): ReturnType<T> {
    if (called && hasCachedResult) {
      return cachedResult
    }
    try {
      const result = fn.apply(this, rest) as ReturnType<T>
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        cachedResult = (result as Promise<unknown>).catch((err) => {
          called = false
          hasCachedResult = false
          throw err
        }) as ReturnType<T>
      } else {
        cachedResult = result
      }
      called = true
      hasCachedResult = true
    } catch (err) {
      called = false
      hasCachedResult = false
      throw err
    }
    return cachedResult
  } as unknown as T
}

/**
 * 深度拷贝一个目标
 *
 * @export
 * @param {any} target
 * @returns any
 * @example
 * deepClone({ a: { b: 1 } })
 */
export function deepClone<T> (target: T): T {
  if (target === null || typeof target === 'undefined') {
    return target
  }
  if (typeof target !== 'object' && typeof target !== 'function') {
    // 原始类型直接返回
    return target
  }
  const obj: any = Array.isArray(target) ? [] : {}
  for (const i in target) {
    if (hasOwn(target, i)) {
      const current = target[i]
      obj[i] = typeof current === 'object' && current !== null ? deepClone(current) : current
    }
  }
  return obj as T
}

/**
 *
 * @param sources Object,string,number,null,undefined,boolean,symbol
 * @param target
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // { a: 1, b: { c: 2, d: 3 } }
 */
export const deepMerge = function (sources:Record<string, any>, target:Record<string, any>):Record<string, any> {
  if (typeof sources === 'object' && sources !== null && typeof target === 'object' && target !== null) {
    const names = Object.getOwnPropertyNames(sources)
    names.forEach(name => {
      if (_toString.call((sources[name])) === '[object Object]') {
        const base = (typeof target[name] === 'object' && target[name] !== null) ? target[name] : {}
        target[name] = deepMerge(sources[name], base)
      } else {
        target[name] = sources[name]
      }
    })
  } else {
    target = sources
  }
  return target
}

/**
 *
 * 判断是否是 string 对象
 * @param {any} obj
 * @returns
 * @example
 * isString('hello') // true
 * isString(1) // false
 */
export function isString (obj: unknown): boolean {
  return typeof obj === 'string'
}

/**
 * @description 格式化字占位符，例如：”{1}，{2}“
 * @author pfzheng
 * @date 2020-08-04
 * @export
 * @returns {(string)}
 * @example
 * formatOrThrow('{1}, {2}', 'a', 'b') // 'a, b'
 */
export function formatOrThrow (...rest: Array<unknown>): string {
  const args: Array<any> = slice.call(rest)
  const len: number = args.length
  if (len <= 1) {
    throw new Error('The number of parameters passed in is incorrect.')
  }
  let str: string = args[0]
  if (!isString(str)) {
    throw new Error('The first value in the parameters must be a string type.')
  }
  for (let i: number = 1; i < len; i++) {
    str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i])
  }
  return str
}

export function format (...rest: Array<unknown>): string | Error {
  try {
    return formatOrThrow(...rest)
  } catch (err) {
    return err as Error
  }
}

export interface FormatCurrencyOptionsType {
  unit?: string,
  decimalPlaces?:number
}

/**
 * @description 将数字进行货币格式化
 * @param value 要进行货币格式化的数字（支持String类型和Number类型）
 * @param unit 格式化货币的单元，默认是中国货币符号￥
 * @example
 * formatCurrency(12345) // '￥ 12,345.00'
 * formatCurrency('12345', '$') // '$ 12,345.00'
 */
export function formatCurrency (value: string | number, options:FormatCurrencyOptionsType | string = { unit: '￥', decimalPlaces: 2 }) {
  let unit = '￥'
  let decimalPlaces = 2
  if (typeof (options) === 'object') {
    if (typeof options.unit === 'string') {
      unit = options.unit
    }
    if (typeof options.decimalPlaces === 'number') {
      decimalPlaces = options.decimalPlaces
    }
  } else if (typeof options === 'string') {
    unit = options
  }

  // 如果值的类型为undefined / null 直接返回空字符串。
  if (value === undefined || value === null) {
    return ''
  }
  let parsedValue: number = value as number
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return ''
    }
    parsedValue = Number(value)
  }
  if (!Number.isFinite(parsedValue)) {
    return ''
  }
  value = parsedValue

  if (decimalPlaces > 0) {
    value = value.toFixed(decimalPlaces)
  }

  const [integer, decimal] = value.toString().split('.')
  let formatValue = `${integer}`.replace(/\B(?=(\d{3})+(?!\d))/gi, ',')
  if (typeof decimal !== 'undefined') {
    formatValue += `.${decimal}`
  }
  if (unit && unit.length > 0) {
    return `${unit} ${formatValue}`
  } else {
    return formatValue
  }
}

/**
 * 判断传参是否是对象类型
 * @param obj
 * @returns
 * @example
 * isObject({}) // true
 * isObject(null) // false
 */
export function isObject (obj: any): boolean {
  return obj !== null && typeof obj === 'object'
}

/**
 * 判断目标是否为函数
 * @example
 * isFunction(() => {}) // true
 * isFunction(1) // false
 */
export function isFunction (target: unknown): target is (...args: unknown[]) => unknown {
  return typeof target === 'function'
}

/**
 * 生成一个非加密用途的唯一标识字符串
 * @example
 * getUUID() // UID-1700000000000-1234567890123
 */
export const getUUID = (prefix: string = 'UID') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`
}

export const ø = Object.create(null)

/**
 * 判断对象是否为空对象
 * @example
 * isEmptyObject({}) // true
 * isEmptyObject({ a: 1 }) // false
 */
export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0
}

/**
 * 防抖函数：短时间内多次触发只执行一次
 * @example
 * const onResize = debounce(() => console.log('resize'), 300)
 * window.addEventListener('resize', onResize)
 */
export function debounce (
  event = noop,
  wait = 50,
  immediately = false
) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let called = false

  return function (...rest) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    if (immediately) {
      const shouldCallNow = !called
      called = true
      timeout = setTimeout(() => {
        called = false
        timeout = null
      }, wait)
      if (shouldCallNow) {
        event.call(this, ...rest)
      }
      return
    }
    timeout = setTimeout(() => {
      event.call(this, ...rest)
      timeout = null
    }, wait)
  }
}

/**
 * 为对象定义属性
 * @example
 * const obj = {}
 * def(obj, 'name', 'jupiter')
 */
export function def (obj: object, key: string, val: unknown, enumerable?: boolean):void {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * 将对象某个已有属性设置为只读
 * @example
 * const obj = { a: 1 }
 * setPropertyReadonly(obj, 'a')
 * // obj.a = 2 // throw Error
 */
export function setPropertyReadonly (obj:Record<string, any>, propertyName:string) {
  if (!hasOwn(obj, propertyName)) {
    throw new Error(`Property '${propertyName}' does not exist on the object`)
  }
  const value = obj[propertyName] // 保存原始值

  Object.defineProperty(obj, propertyName, {
    get: function () {
      return value // 返回原始值
    },
    set: function (newValue:any) {
      throw new Error(`Cannot set read-only property "${propertyName}"`)
    },
    enumerable: true,
    configurable: false
  })
}

/**
 * 一个将类似 8.5K,8.5M,8.5B,8.5T,8.5Q 格式的数据转换成数字的函数
 * @example
 * parseNumber('8.5K') // 8500
 */
export function parseNumber (value: string): number {
  const number = parseFloat(value)
  if (isNaN(number)) {
    return 0
  }
  const unit = value.replace(number.toString(), '').toUpperCase()
  switch (unit) {
    case 'K':
      return number * 1000
    case 'M':
      return number * 1000000
    case 'B':
      return number * 1000000000
    case 'T':
      return number * 1000000000000
    case 'Q':
      return number * 1000000000000000
    default:
      return number
  }
}

/**
 * 在给定长度的数组中，通过平均分配指定的数字，使每个元素的值尽可能接近平均值。
 * @example
 * distributeEvenly(10, 3) // [4, 3, 3]
 */
export function distributeEvenly (total:number, num:number) {
  const quotient = Math.floor(total / num)
  const remainder = total % num
  const result = Array(num).fill(quotient)

  for (let i = 0; i < remainder; i++) {
    result[i] += 1
  }
  return result
}

/**
 * 判断两个对象是否相等
 * @param objA
 * @param objB
 * @returns
 * @example
 * shallowEqual({ a: 1 }, { a: 1 }) // true
 * shallowEqual({ a: 1 }, { a: 2 }) // false
 */
export function shallowEqual (objA: Record<string, TBaseType>, objB: Record<string, TBaseType>) {
  if (objA === objB) {
    return true
  }
  if (Object.keys(objA).length !== Object.keys(objB).length) {
    return false
  }
  for (const key in objA) {
    if (hasOwn(objA, key) && (!hasOwn(objB, key) || objA[key] !== objB[key])) {
      return false
    }
  }
  return true
}

export default {}
