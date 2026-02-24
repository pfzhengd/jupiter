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
 */
export function noop (...rest: any[]): Promise<any>|any { }

/**
 * 判断对象是否是纯粹的对象类型
 *
 * @export
 * @param {*} obj
 * @returns
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
 */
export function extend (to: object, _from: object): object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * 确保只执行一次函数
 *
 * @export
 * @param {Function} fn
 * @returns Function
 */
export function once<T extends Function> (fn: T): T {
  let called = false
  return function (...rest: [any]): Promise<any>|any {
    if (!called) {
      called = true
      return fn.apply(this, rest)
    }
  } as unknown as T
}

/**
 * 深度拷贝一个目标
 *
 * @export
 * @param {any} target
 * @returns any
 */
export function deepClone (target: any): object {
  if ([null, undefined, NaN, false].indexOf(target)) {
    return target
  }
  if (typeof target !== 'object' && typeof target !== 'function') {
    // 原始类型直接返回
    return target
  }
  const obj = Array.isArray(target) ? [] : {}
  for (const i in target) {
    if (hasOwn(target, i)) {
      obj[i] = typeof target[i] === 'object' ? deepClone(target[i]) : target[i]
    }
  }
  return obj
}

/**
 *
 * @param sources Object,string,number,null,undefined,boolean,symbol
 * @param target
 */
export const deepMerge = function (sources:Record<string, any>, target:Record<string, any>):Record<string, any> {
  if (typeof sources === 'object' && typeof target === 'object') {
    const names = Object.getOwnPropertyNames(sources)
    names.forEach(name => {
      if (_toString.call((sources[name])) === '[object Object]') {
        target[name] = deepMerge(sources[name], target[name])
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
 */
export function isString (obj: any): Boolean {
  return typeof obj === 'string'
}

/**
 * @description 格式化字占位符，例如：”{1}，{2}“
 * @author pfzheng
 * @date 2020-08-04
 * @export
 * @returns {(string | Error)}
 */
export function format (...rest: Array<any>): string | Error {
  const args: Array<any> = slice.call(rest)
  const len: number = args.length
  if (len > 1) {
    let str: string = args[0]

    if (!isString(str)) {
      return new Error('The first value in the parameters must be a string type.')
    }

    for (let i: number = 1; i < len; i++) {
      str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i])
    }
    return str
  } else {
    return new Error('The number of parameters passed in is incorrect.')
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
  if (typeof value === 'string') {
    value = parseFloat(value)
  }

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
 */
export function isObject (obj: any): boolean {
  return obj !== null && typeof obj === 'object'
}

export function isFunction (target: any) {
  return typeof target === 'function'
}

export const getUUID = (prefix: string = 'UID') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`
}

export const ø = Object.create(null)

export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0
}

export function debounce (
  event = noop,
  wait = 50,
  immediately = false
) {
  let timeout = null
  let called = false

  return function (...rest) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    const execute = () => {
      event.call(this, ...rest)
      timeout = null
    }

    if (immediately && !called) {
      execute()
      called = true
    } else {
      timeout = setTimeout(execute, wait)
    }
  }
}

export function def (obj: Object, key: string, val: any, enumerable?: boolean):void {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

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
 */
export function shallowEqual (objA: Record<string, TBaseType>, objB: Record<string, TBaseType>) {
  if (objA === objB) {
    return true
  }
  if (objA.length !== objB.length) {
    return false
  }
  for (const key in objA) {
    if (objA[key] !== objB[key]) {
      return false
    }
  }
  return true
}

export default {}
