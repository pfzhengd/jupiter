# @jupjs/biome-config

Jupiter 工程的共享 Biome 配置包，用于统一代码格式化与静态检查规则。

## 包含内容

- `biome.json`：默认规则配置
- 忽略目录与文件模式（如 `node_modules`、`dist`、`coverage` 等）
- TypeScript 规则增强（例如对 `any` 的更严格约束）

## 适用范围

适用于前端工程中的 `ts/tsx/js/jsx/json/css/scss/less` 文件。

## 在项目中使用

1. 安装依赖：

```bash
pnpm add -D @biomejs/biome @jupjs/biome-config
```

2. 在项目根目录创建（或更新）`biome.json`：

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "extends": ["./node_modules/@jupjs/biome-config/biome.json"]
}
```

## 常用命令

```bash
# 检查
npx biome check .

# 自动修复
npx biome check . --write

# 仅格式化
npx biome format . --write
```

## 维护说明

- 该包是共享规则源，修改后会影响所有依赖项目。
- 建议先在业务仓库验证，再发版配置包。
