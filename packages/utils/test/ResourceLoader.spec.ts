import { ResourceLoader } from '../src'

describe('ResourceLoader', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('支持加载 JS/CSS，并在完成后回调', async () => {
    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation(((node: Node) => {
        setTimeout(() => {
          (node as HTMLElement).dispatchEvent(new Event('load'))
        }, 0)
        return node
      }) as typeof document.head.appendChild)

    await new Promise<void>((resolve) => {
      ResourceLoader(
        ['https://cdn.example.com/a.js', 'https://cdn.example.com/a.css'],
        resolve
      )
    })

    expect(appendSpy).toHaveBeenCalledTimes(2)
  })

  test('同一批次重复路径会去重', async () => {
    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation(((node: Node) => {
        setTimeout(() => {
          (node as HTMLElement).dispatchEvent(new Event('load'))
        }, 0)
        return node
      }) as typeof document.head.appendChild)

    await new Promise<void>((resolve) => {
      ResourceLoader(
        ['https://cdn.example.com/dup.js', 'https://cdn.example.com/dup.js'],
        resolve
      )
    })

    expect(appendSpy).toHaveBeenCalledTimes(1)
  })

  test('不支持的资源类型会告警并直接完成', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const appendSpy = jest.spyOn(document.head, 'appendChild')

    await new Promise<void>((resolve) => {
      ResourceLoader(['https://cdn.example.com/file.txt'], resolve)
    })

    expect(warnSpy).toHaveBeenCalled()
    expect(appendSpy).not.toHaveBeenCalled()
  })

  test('资源加载失败不会阻塞整体回调，并且后续可重试', async () => {
    const attempts = new Map<string, number>()
    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation(((node: Node) => {
        const element = node as HTMLScriptElement
        const src = element.src || ''
        const count = attempts.get(src) ?? 0
        attempts.set(src, count + 1)

        setTimeout(() => {
          if (count === 0) {
            element.dispatchEvent(new Event('error'))
          } else {
            element.dispatchEvent(new Event('load'))
          }
        }, 0)
        return node
      }) as typeof document.head.appendChild)

    await new Promise<void>((resolve) => {
      ResourceLoader(['https://cdn.example.com/retry.js'], resolve)
    })
    await new Promise<void>((resolve) => {
      ResourceLoader(['https://cdn.example.com/retry.js'], resolve)
    })

    expect(appendSpy).toHaveBeenCalledTimes(2)
  })

  test('会创建正确的 script/link，并设置 src/href', async () => {
    const createdScripts: HTMLScriptElement[] = []
    const createdLinks: HTMLLinkElement[] = []

    jest.spyOn(document.head, 'appendChild').mockImplementation(((node: Node) => {
      if (node instanceof HTMLScriptElement) {
        createdScripts.push(node)
      }
      if (node instanceof HTMLLinkElement) {
        createdLinks.push(node)
      }

      setTimeout(() => {
        (node as HTMLElement).dispatchEvent(new Event('load'))
      }, 0)
      return node
    }) as typeof document.head.appendChild)

    await new Promise<void>((resolve) => {
      ResourceLoader(
        ['https://cdn.example.com/assert.js', 'https://cdn.example.com/assert.css'],
        resolve
      )
    })

    expect(createdScripts).toHaveLength(1)
    expect(createdLinks).toHaveLength(1)
    expect(createdScripts[0].src).toContain('https://cdn.example.com/assert.js')
    expect(createdLinks[0].href).toContain('https://cdn.example.com/assert.css')
  })

  test('失败分支会告警，但不会阻塞完成回调', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    let callbackCalled = 0

    jest.spyOn(document.head, 'appendChild').mockImplementation(((node: Node) => {
      const el = node as HTMLElement
      setTimeout(() => {
        if (node instanceof HTMLScriptElement) {
          el.dispatchEvent(new Event('error'))
        } else {
          el.dispatchEvent(new Event('load'))
        }
      }, 0)
      return node
    }) as typeof document.head.appendChild)

    await new Promise<void>((resolve) => {
      ResourceLoader(
        ['https://cdn.example.com/fail-again.js', 'https://cdn.example.com/ok-again.css'],
        () => {
          callbackCalled++
          resolve()
        }
      )
    })

    expect(callbackCalled).toBe(1)
    expect(warnSpy).toHaveBeenCalled()
  })
})
