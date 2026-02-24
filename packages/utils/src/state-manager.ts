export type Observer<T> = (state: T) => Promise<void>;
export interface IStateManager<T>{
  state:T
  observer:Observer<T>

  setState(newState:T):Promise<void>

  getState():T
}

export class StateManager<T> implements IStateManager<T> {
  state: T;
  observer: Observer<T>

  constructor (state: T, observer: Observer<T>) {
    this.state = state
    this.observer = observer
  }

  async setState (newState: T): Promise<void> {
    this.state = newState
    await this.observer(newState)
  }

  getState () {
    return this.state
  }
}
