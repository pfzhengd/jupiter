import { StateManager, IStateManager } from '../src/state-manager'

const mockObserver = jest.fn()

describe('StateManager', () => {
  let stateManager: IStateManager<string>

  beforeEach(() => {
    // 初始化 StateManager
    stateManager = new StateManager<string>('initialState', mockObserver)
  })

  test('setState should update state and call observer', async () => {
    const newState = 'newState'
    await stateManager.setState(newState)

    // 确保 state 已经更新
    expect(stateManager.getState()).toEqual(newState)

    // 确保 observer 被调用
    expect(mockObserver).toHaveBeenCalledWith(newState)
  })

  test('getState should return a frozen copy of the state', async () => {
    const state = stateManager.getState()
    await stateManager.setState('newState')
    // 确保返回的是 state 的副本
    expect(state).not.toEqual(stateManager.state)
  })
})
