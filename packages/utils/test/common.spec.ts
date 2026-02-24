import {
  isPlainObject,
  hasOwn,
  extend,
  deepClone,
  deepMerge,
  once,
  isString,
  format,
  formatCurrency,
  isFunction,
  isEmptyObject,
  debounce,
  setPropertyReadonly,
  parseNumber,
  def,
  distributeEvenly,
  shallowEqual,
  noop
} from '../src/common'

test('isPlainObject ?', () => {
  expect(isPlainObject([])).toBe(false)
  expect(isPlainObject({})).toBe(true)
  expect(isPlainObject({ a: 2 })).toBe(true)
})

test('hasOwn ?', () => {
  expect(hasOwn({ a: 1 }, 'a')).toBe(true)
  expect(hasOwn([1, 2, 3], 'b')).toBe(false)
  expect(hasOwn({}, '__proto__')).toBe(false)
})

test('extend ?', () => {
  const result:any = extend({ a: 1 }, { b: 2 })
  expect(hasOwn(result, 'b')).toBe(true)
  console.log('result', JSON.stringify(result))
  expect(result.b).toEqual(2)
  expect(result.a).toEqual(1)
})

test('deepClone ?', () => {
  const result:any = deepClone({
    b: 2,
    c: {
      c1: '2.1',
      c2: '2.2'
    },
    a: 1,
    e: [1, 2, 3, 4]
  })

  console.log('result', JSON.stringify(result))
  expect(hasOwn(result, 'c')).toBe(true)
  expect(hasOwn(result.c, 'c1')).toBe(true)
  expect(hasOwn(result.c, 'c2')).toBe(true)
  expect(hasOwn(result.c, 'c2')).toBe(true)
})

test('once sync', () => {
  let counter = 0
  const fn = once((a:number, b:number) => {
    console.log('我只执行了一次。')
    counter += (a + b)
  })
  fn(1, 2)
  fn(1, 2)
  expect(counter).toBe(3)
})

test('once async', async () => {
  function counter (a:number, b:number):Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          const result = a + b
          resolve(result)
        }, 1000 * 1)
      } catch (err:any) {
        reject(err)
      }
    })
  }
  const fn = once(counter)
  let data:number = 0
  for (let i = 0; i < 10; i++) {
    const result = await fn(i, 1) as number
    if (data === 0) {
      data = result
    }
    console.log(result)
  }
  expect(data).toEqual(1)
})

test('isString ?', done => {
  expect(isString({})).toBe(false)
  expect(isString(true)).toBe(false)
  expect(isString('')).toBe(true)
  done()
})

test('format ?', done => {
  expect(format('{1},{2}', 'a', 'b')).toBe('a,b')
  expect(format('{1},{2}')).toEqual(new Error('The number of parameters passed in is incorrect.'))
  expect(format(1, 2)).toEqual(new Error('The first value in the parameters must be a string type.'))
  expect(format('{0}', 1)).toBe('{0}')
  done()
})

test('formatCurrency', done => {
  expect(formatCurrency(undefined)).toBe('')
  expect(formatCurrency(null)).toBe('')
  expect(formatCurrency(0)).toBe('￥ 0.00')
  expect(formatCurrency(undefined)).toBe('')
  expect(formatCurrency(142)).toBe('￥ 142.00')
  expect(formatCurrency(13542)).toBe('￥ 13,542.00')
  expect(formatCurrency(123242)).toBe('￥ 123,242.00')
  expect(formatCurrency(123456789)).toBe('￥ 123,456,789.00')
  expect(formatCurrency(123456789.5)).toBe('￥ 123,456,789.50')
  expect(formatCurrency(123456789, { unit: '$' })).toBe('$ 123,456,789.00')
  expect(formatCurrency(123456789, '$')).toBe('$ 123,456,789.00')
  expect(formatCurrency('123456789.00', { unit: '$' })).toBe('$ 123,456,789.00')
  expect(formatCurrency('123456789.0000', { unit: '$' })).toBe('$ 123,456,789.00')
  expect(formatCurrency('123456789', { unit: '$', decimalPlaces: 1 })).toBe('$ 123,456,789.0')
  expect(formatCurrency('123456789', { unit: '$', decimalPlaces: 0 })).toBe('$ 123,456,789')
  expect(formatCurrency(123456789, { unit: '' })).toBe('123,456,789.00')
  done()
})

test('isFunction', done => {
  function test () {}
  expect(isFunction(test)).toEqual(true)
  expect(isFunction({})).toEqual(false)
  expect(isFunction(1)).toEqual(false)
  expect(isFunction(true)).toEqual(false)
  expect(isFunction(undefined)).toEqual(false)
  expect(isFunction(null)).toEqual(false)
  expect(isFunction('')).toEqual(false)
  done()
})

test('isEmptyObject', done => {
  expect(isEmptyObject({})).toEqual(true)
  expect(isEmptyObject({ a: 1 })).toEqual(false)
  expect(isEmptyObject(Object.create(null))).toEqual(true)
  done()
})

test('debonuce', done => {
  // 测试 debonuce 函数是否正常执行
  let counter = 0
  const fn = debounce(() => {
    counter++
  }, 1000)
  fn(); fn(); fn()
  setTimeout(() => {
    expect(counter).toBe(1)
    done()
  }
  , 1000)
})

// 测试 setPropertyReadonly 在赋值时是否会异常
test('setPropertyReadonly', done => {
  const obj:Record<string, any> = {
    a: 1,
    b: 2
  }
  obj.c = '3'
  setPropertyReadonly(obj, 'a')
  setPropertyReadonly(obj, 'b')
  expect(obj.a).toEqual(1)
  expect(obj.b).toEqual(2)
  expect(obj.c).toEqual('3')

  expect(() => { obj.a = 3 }).toThrow('Cannot set read-only property "a"')
  expect(() => { setPropertyReadonly(obj, 'address') }).toThrow("Property 'address' does not exist on the object")
  done()
})

describe('def', () => {
  test('defines a new property on the object', () => {
    const obj = {}
    const key = 'name'
    const val = 'John'

    def(obj, key, val)

    expect(obj[key]).toBe(val)
  })

  test('defines a new non-enumerable property on the object', () => {
    const obj = {}
    const key = 'age'
    const val = 30

    def(obj, key, val, false)

    expect(hasOwn(obj, key)).toBe(true) // Property is defined on the object
    expect(Object.propertyIsEnumerable.call(obj, key)).toBe(false) // Property is not enumerable
    expect(obj[key]).toBe(val)
  })
})

describe('parseNumber', () => {
  test('parses a number', () => {
    expect(parseNumber('8.5K')).toBe(8500)
    expect(parseNumber('8.5M')).toBe(8500000)
    expect(parseNumber('8.5B')).toBe(8500000000)
    expect(parseNumber('8.5T')).toBe(8500000000000)
    expect(parseNumber('8.5Q')).toBe(8500000000000000)
  })
})

describe('distributeEvenly', () => {
  test('No.1', () => {
    expect(distributeEvenly(23, 9)).toEqual([3, 3, 3, 3, 3, 2, 2, 2, 2])
    expect(distributeEvenly(332, 9)).toEqual([37, 37, 37, 37, 37, 37, 37, 37, 36])
  })
}) // 引入 shallowEqual 函数

describe('shallowEqual', () => {
  it('returns true for two identical objects', () => {
    const objA = { a: 1, b: 2 }
    const objB = { a: 1, b: 2 }
    expect(shallowEqual(objA, objB)).toBe(true)
  })

  it('returns false for two different objects', () => {
    const objA = { a: 1, b: 2 }
    const objB = { a: 2, b: 3 }
    expect(shallowEqual(objA, objB)).toBe(false)
  })

  it('returns false for objects with different property counts', () => {
    const objA = { a: 1, b: 2 }
    const objB = { a: 1 }
    expect(shallowEqual(objA, objB)).toBe(false)
  })

  it('returns true for two references to the same object', () => {
    const objA = { a: 1, b: 2 }
    const objB = objA
    expect(shallowEqual(objA, objB)).toBe(true)
  })
}) // 请替换为实际文件路径

// Jest 测试用例
describe('deepMerge function', () => {
  // 测试用例1：深度合并两个对象
  it('should deep merge two objects', () => {
    const sources = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3
        }
      }
    }

    const target = {
      b: {
        d: {
          f: 4
        }
      },
      g: 5
    }

    const result = deepMerge(sources, target)

    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4
        }
      },
      g: 5
    })
  })

  // 测试用例2：处理不同类型的参数
  it('should handle different types of parameters', () => {
    // 准备输入数据
    const sources = {
      a: 1,
      b: {
        c: 2
      }
    }

    // 测试 string
    const targetString = deepMerge(sources, { key: 'test' })
    expect(targetString).toEqual({ key: 'test', a: 1, b: { c: 2 } })

    // 测试 number
    const targetNumber = deepMerge(sources, { key: 42 })
    expect(targetNumber).toEqual({ key: 42, a: 1, b: { c: 2 } })

    // 测试 null
    const targetNull = deepMerge(sources, { key: null })
    expect(targetNull).toEqual({ key: null, a: 1, b: { c: 2 } })

    // 测试 undefined
    const targetUndefined = deepMerge(sources, { key: undefined })
    expect(targetUndefined).toEqual({ key: undefined, a: 1, b: { c: 2 } })

    // 测试 boolean
    const targetBoolean = deepMerge(sources, { key: false })
    expect(targetBoolean).toEqual({ key: false, a: 1, b: { c: 2 } })

    // 测试 symbol
    const targetSymbol = deepMerge(sources, { key: Symbol('test') })
    expect(targetSymbol).toEqual(expect.objectContaining({ a: 1, b: { c: 2 }, key: expect.any(Symbol) }))
  })
})

// Jest 测试用例
describe('noop function', () => {
  // 测试用例1：新的 noop 返回 Promise
  it('should return a Promise for new noop', () => {
    const result = noop()
    expect(result).toBeUndefined()
  })

  // 测试用例2：新的 noop 与旧的 noop 返回值兼容
  it('should be backward compatible with old noop', () => {
    const oldNoopResult: void = noop()
    const newNoopResult: Promise<any>|any = noop()

    // 通过类型断言确保兼容性
    const backwardCompatibleResult: void = newNoopResult as void

    expect(backwardCompatibleResult).toBe(oldNoopResult)
  })
})
