# 02 架构概览

## 技术栈

- Expo + React Native（应用框架）：[package.json](file:///Users/huyi/SproutDiary/package.json#L1-L19)
- React（组件与状态）：`react@19.1.0`
- 多媒体选择：`expo-image-picker`（相册/相机）

## 代码组织方式

本仓库没有常见的 `src/` 分层，采用“根目录入口 + screens 目录页面化拆分”的方式：

- 应用启动/注册：`index.js`
- 应用壳/顶层状态/路由：`App.js`
- 页面：`screens/*.js`
- 工具方法：`utils/*.js`
- Expo 配置：`app.json`

## 运行时架构（文字版）

```
Expo Runtime
  └─ index.js
      └─ App.js (Root Component)
          ├─ Top-level State: babies[], selectedBabyId, page
          ├─ CRUD methods: addRecord/updateRecord/deleteRecord/clearRecords
          ├─ Pending timers: pendingSleepStart/pendingFeedingStart
          └─ renderScreen() → 根据 page 渲染不同 Screen（手写路由）
                ├─ HomeScreen
                ├─ BabyProfileScreen
                ├─ FeedingScreen
                ├─ SleepScreen
                ├─ DiaperScreen
                ├─ GrowthScreen
                ├─ VaccineScreen
                ├─ IllnessScreen
                └─ SettingsScreen
```

## 模块职责

### App.js（应用壳 + 数据中心）

- 维护应用核心状态
  - `babies`: 多宝宝列表（每个宝宝内含各类记录数组与 pending 字段）[App.js](file:///Users/huyi/SproutDiary/App.js#L13-L33)
  - `selectedBabyId`: 当前宝宝选择 [App.js](file:///Users/huyi/SproutDiary/App.js#L41-L46)
  - `page`: 当前页面 [App.js](file:///Users/huyi/SproutDiary/App.js#L41-L45)
- 通过 props 将数据与回调下发到 Screen
  - “读”：`baby={currentBaby}`
  - “写”：`onAddX / onUpdateX / onDeleteX`、`onClearRecords`、`onUpdateBaby`
- 负责页面切换
  - `renderScreen()`：根据 `page` 字符串 switch 渲染 [App.js](file:///Users/huyi/SproutDiary/App.js#L141-L204)
- 负责底部 Tab
  - 仅提供“首页 / 我的”两项 [App.js](file:///Users/huyi/SproutDiary/App.js#L35-L38)

### screens（页面模块）

`screens/` 下每个文件基本遵循相同结构：

- 组件为默认导出的函数组件 `export default function XxxScreen(...)`
- 内部维护表单状态与编辑态（`editId`）
- 对图片：统一通过 `expo-image-picker` 获取 URI 存入 `images: string[]`
- 保存/编辑：通过 props 回调将数据写回 `App.js` 的 `babies` state

### utils（工具模块）

`utils/timeUtils.js` 提供：

- 当前时间与日期的字符串格式化
- 本周/本月范围计算
- 按日期范围统计记录数量（用于首页聚合）

## 依赖关系（模块级）

```
index.js → App.js
App.js → screens/*
screens/* → utils/timeUtils.js
screens/* → expo-image-picker
```

依赖方向总体为单向：页面依赖工具与回调；业务状态集中在 `App.js`，Screen 不直接互相依赖。

