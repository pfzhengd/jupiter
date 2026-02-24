import { noop } from './common'

const resourceTasks = new Map<string, Promise<void>>()

/**
 * 可动态加载 JS/CSS 资源（基于 script/link 标签）。
 * 注意：不支持 ESM 模块加载语义（import/export、type="module"、import()）。
 * @param paths
 * @param callback
 */
export function ResourceLoader (paths: string | Array<string>, callback: Function):void {
  if (typeof paths === 'string') {
    paths = [paths]
  }

  if (!Array.isArray(paths)) {
    console.warn('loader', 'The type of passed argument must be an Array or String.')
    return
  }

  const head: HTMLHeadElement | null = document.querySelector('head') || document.head
  if (!head) {
    console.warn('loader', 'The document head element was not found.')
    return
  }

  let index: number = 0
  callback = typeof callback === 'function' ? callback : noop

  const uniquePaths: string[] = []
  const visited = new Set<string>()
  paths.forEach((path: string) => {
    if (visited.has(path)) {
      return
    }
    visited.add(path)

    if (path.endsWith('.js') || path.endsWith('.css')) {
      uniquePaths.push(path)
    } else {
      console.warn('loader', `Unsupported resource type: ${path}`)
    }
  })

  if (uniquePaths.length === 0) {
    callback.apply(null)
    return
  }

  uniquePaths.forEach((path: string) => {
    loadResource(path, head)
      .then(() => completed())
      .catch((err) => {
        console.warn('loader', `Failed to load resource: ${path}`, err)
        completed()
      })
  })

  function loadResource (path: string, targetHead: HTMLHeadElement): Promise<void> {
    if (resourceTasks.has(path)) {
      return resourceTasks.get(path) as Promise<void>
    }

    const task = new Promise<void>((resolve, reject) => {
      if (path.endsWith('.js')) {
        const script: HTMLScriptElement = document.createElement('script')
        script.src = path
        script.type = 'text/javascript'
        script.async = true
        script.onload = () => resolve()
        script.onerror = (err) => reject(err)
        targetHead.appendChild(script)
      } else {
        const link: HTMLLinkElement = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = path
        link.onload = () => resolve()
        link.onerror = (err) => reject(err)
        targetHead.appendChild(link)
      }
    })

    resourceTasks.set(path, task)
    task.catch(() => {
      // 加载失败时移除缓存，允许后续重试加载。
      resourceTasks.delete(path)
    })
    return task
  }

  function completed (): void {
    index++
    if (index === uniquePaths.length) {
      callback.apply(null)
    }
  }
}
