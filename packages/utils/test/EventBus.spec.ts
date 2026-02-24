import { EventBus } from '../src/index'

describe('EventBus', () => {
  test('初始化成功并暴露核心方法', () => {
    const bus = new EventBus()
    expect(bus).toHaveProperty('subscribe')
    expect(bus).toHaveProperty('unsubscribe')
    expect(bus).toHaveProperty('publish')
    expect(bus).toHaveProperty('getSubscribers')
  })

  test('同一频道多个订阅者都能收到消息', () => {
    const bus = new EventBus()
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    bus.subscribe('channel', listener1)
    bus.subscribe('channel', listener2)
    bus.publish('channel', 'payload')

    expect(listener1).toHaveBeenCalledWith('payload')
    expect(listener2).toHaveBeenCalledWith('payload')
  })

  test('subscribe 返回的 off 函数可取消订阅并清理空频道', () => {
    const bus = new EventBus()
    const listener = jest.fn()

    const off = bus.subscribe('channel', listener)
    expect(bus.getSubscribers().channel).toHaveLength(1)

    off()
    expect(bus.getSubscribers().channel).toBeUndefined()

    bus.publish('channel', 'after-off')
    expect(listener).not.toHaveBeenCalled()
  })

  test('publish 支持多参数并按顺序传递', () => {
    const bus = new EventBus()
    const listener = jest.fn()
    bus.subscribe('multi', listener)

    bus.publish('multi', 'a', 1, { ok: true })
    expect(listener).toHaveBeenCalledWith('a', 1, { ok: true })
  })

  test('单个 listener 抛错不会中断同频道其他 listener', () => {
    const bus = new EventBus()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const goodListener = jest.fn()

    bus.subscribe('safe', () => {
      throw new Error('boom')
    })
    bus.subscribe('safe', goodListener)

    bus.publish('safe', 'payload')
    expect(goodListener).toHaveBeenCalledWith('payload')
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  test('getSubscribers 返回只读快照，外部修改不影响内部状态', () => {
    const bus = new EventBus()
    const listener = jest.fn()
    bus.subscribe('snapshot', listener)

    const snapshot = bus.getSubscribers()
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.snapshot)).toBe(true)

    const listeners = snapshot.snapshot as unknown as Array<(...args: unknown[]) => void>
    expect(() => listeners.pop()).toThrow()

    expect(bus.getSubscribers().snapshot).toHaveLength(1)
  })

  test('unsubscribe(channel) 能清空整个频道', () => {
    const bus = new EventBus()
    const listener = jest.fn()

    bus.subscribe('clear', listener)
    bus.unsubscribe('clear')
    bus.publish('clear', 'payload')

    expect(listener).not.toHaveBeenCalled()
    expect(bus.getSubscribers().clear).toBeUndefined()
  })
})
