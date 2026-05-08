# 01 快速开始

## 环境要求

- Node.js（建议使用 LTS 版本）
- npm（仓库包含 package-lock.json，默认 npm 工作流）
- Expo 运行环境
  - 最常见方式：安装 Expo Go（真机调试）
  - 或者：本机 Android/iOS 模拟器（需要各自开发环境）

## 安装依赖

在仓库根目录执行：

```bash
npm install
```

## 启动开发服务器

```bash
npm run start
```

常用变体（等价于 expo start 的不同参数）：

```bash
npm run android
npm run ios
npm run web
```

## 项目入口

- JS 入口：`index.js` 注册根组件 [index.js](file:///Users/huyi/GerminationDiary/index.js#L1-L8)
- 根组件：`App.js` [App.js](file:///Users/huyi/GerminationDiary/App.js#L40-L218)

## 本项目的“运行时约束”

- 无后端、无数据库、无本地持久化：所有数据都保存在 React state 中；重启应用后数据会丢失。
- 无第三方导航库：页面切换由 `App.js` 内部 `page` 字符串状态驱动（类似手写路由）。

