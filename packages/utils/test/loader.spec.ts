import { loader } from '../src/loader'

test('loader:检测加载js', () => {
  expect(loader('https://unpkg.com/flyer-ui/lib/index.js', () => {
    console.log('动态加载成功。。。')
  }))
})
