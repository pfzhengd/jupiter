# @jupiter/utils

前端工具库，提供一组可复用的小能力函数与浏览器侧工具模块。

## 安装

```bash
pnpm add @jupiter/utils
```

## 当前导出模块

- `common`：通用小函数集合（类型判断、对象处理、格式化、节流防抖等）
- `ResourceLoader`：动态加载 JS/CSS 资源（`script/link`）
- `EventBus`：页面内发布订阅
- `LocalStorageStore`：本地存储操作封装

## 使用示例

### 1) common

```ts
import { formatCurrency, debounce, deepMerge } from '@jupiter/utils'

const money = formatCurrency(12345) // ￥ 12,345.00

const merged = deepMerge(
  { feature: { a: true } },
  { feature: { b: true } }
)

const onResize = debounce(() => {
  console.log('resize')
}, 200)
```

### common API

#### 类型判断

```ts
import { isString, isObject, isFunction, isPlainObject } from '@jupiter/utils'

isString('a') // true
isObject({}) // true
isFunction(() => {}) // true
isPlainObject({ a: 1 }) // true
```

#### 对象处理

```ts
import { hasOwn, extend, deepClone, deepMerge, shallowEqual } from '@jupiter/utils'

hasOwn({ a: 1 }, 'a') // true
extend({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
deepClone({ a: { b: 1 } })
deepMerge({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
shallowEqual({ a: 1 }, { a: 1 }) // true
```

#### 字符串与数字

```ts
import { format, formatOrThrow, formatCurrency, parseNumber } from '@jupiter/utils'

format('{1}-{2}', 'a', 'b') // 'a-b'
formatOrThrow('{1}', 'x') // 'x'
formatCurrency(12345) // '￥ 12,345.00'
parseNumber('8.5K') // 8500
```

#### 函数控制

```ts
import { once, debounce, noop } from '@jupiter/utils'

const onlyOnce = once(() => 1)
onlyOnce() // 1
onlyOnce() // 1

const fn = debounce(() => console.log('trigger'), 300)
noop()
```

#### 其他工具

```ts
import { getUUID, def, setPropertyReadonly, distributeEvenly } from '@jupiter/utils'

getUUID() // UID-...
const obj: Record<string, unknown> = {}
def(obj, 'name', 'jupiter')
setPropertyReadonly(obj, 'name')
distributeEvenly(10, 3) // [4, 3, 3]
```

### 2) ResourceLoader

```ts
import { ResourceLoader } from '@jupiter/utils'

ResourceLoader(
  ['https://cdn.example.com/a.js', 'https://cdn.example.com/a.css'],
  () => {
    console.log('资源加载流程完成')
  }
)
```

> 注意：`ResourceLoader` 仅支持基于 `script/link` 的资源注入，不支持 ESM 模块语义加载（`import/export`、`type="module"`、`import()`）。

### 3) EventBus

```ts
import { EventBus } from '@jupiter/utils'

const bus = new EventBus()

const off = bus.subscribe('user:update', (payload) => {
  console.log('收到更新', payload)
})

bus.publish('user:update', { id: 1, name: 'zekai' })
off()
```

### 4) LocalStorageStore

```ts
import { LocalStorageStore } from '@jupiter/utils'

const store = new LocalStorageStore({
  key: 'app:user',
  initData: () => ({ id: 0, name: '' })
})

store.update({ id: 1, name: 'zekai' })
const name = store.getter('name')
console.log(name)
```

## 本地开发

在 `packages/utils` 目录执行：

```bash
npm run test
npm run lint
npm run build:prod
```

按文件执行测试：

```bash
npx jest test/EventBus.spec.ts --no-cache
npx jest test/ResourceLoader.spec.ts --no-cache
```