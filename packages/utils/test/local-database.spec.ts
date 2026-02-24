import { LocalDataBase } from '../src'

test('1. 测试 LocalDataBase 实例', (done) => {
  const localDataBase = new LocalDataBase({ key: 'test', initData: () => ({}) })
  expect(localDataBase).toBeInstanceOf(LocalDataBase)
  expect(localDataBase.data).toEqual({})
  expect(localDataBase.key).toBe('test')
  expect(localDataBase.options).toEqual({ key: 'test', initData: expect.any(Function) })
  done()
})

test('2. 测试 LocalDataBase 实例的 saveup 方法', (done) => {
  const localDataBase = new LocalDataBase({ key: 'test', initData: () => ({}) })
  localDataBase.saveup()
  expect(localStorage.getItem('test')).toBe('{}')
  expect(localDataBase.data).toEqual({})
  expect(localDataBase.key).toBe('test')
  done()
})
