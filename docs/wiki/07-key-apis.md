# 07 关键函数与接口

## 应用入口

### registerRootComponent(App)

位置：[index.js](file:///Users/huyi/GerminationDiary/index.js#L1-L8)

- 将 `App` 注册为运行时主组件
- 兼容 Expo Go 与原生构建运行环境

## App.js：顶层 API（数据中心）

文件：[App.js](file:///Users/huyi/GerminationDiary/App.js)

### App()

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L40-L218)

职责：

- 提供全局状态：`page/babies/selectedBabyId`
- 计算派生数据：`currentBaby/themeColor`
- 通过 `renderScreen()` 绑定 props 并渲染页面

### updateBaby(updated)

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L48-L50)

- 语义：按 `id` 合并更新某个宝宝的档案字段
- 用例：头像变更（SettingsScreen）、档案编辑（BabyProfileScreen）

### addBaby(baby)

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L52-L68)

- 语义：创建新宝宝并追加到 `babies`
- 关键点
  - `id` 通过 `Date.now()` 生成
  - 会初始化所有 `xxxRecords` 数组与 pending 字段
  - 创建后自动切换 `selectedBabyId` 到新宝宝

### addRecord(type, record)

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L70-L79)

- 语义：对当前宝宝的 `${type}Records` 头插一条记录（最新在前）
- `id` 生成规则：`${type}-${Date.now()}`

### updateRecord(type, recordId, updatedFields)

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L81-L92)

- 语义：对当前宝宝的 `${type}Records` 找到目标 `id` 并做浅合并更新
- Screen 通常传入“完整字段集合”或“部分 patch”

### deleteRecord(type, recordId)

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L94-L103)

- 语义：从当前宝宝的 `${type}Records` 中删除目标记录

### setPendingSleepStart / setPendingFeedingStart

位置：

- [App.js](file:///Users/huyi/GerminationDiary/App.js#L105-L111)
- [App.js](file:///Users/huyi/GerminationDiary/App.js#L113-L119)

语义：保存“开始时间”，便于用户离开页面后再回来继续记录结束时间。

### clearRecords()

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L121-L139)

- 语义：清空当前宝宝所有记录与 pending 状态
- SettingsScreen 在“清空记录”按钮触发时调用：[SettingsScreen.js](file:///Users/huyi/GerminationDiary/screens/SettingsScreen.js#L73-L86)

### renderScreen()

位置：[App.js](file:///Users/huyi/GerminationDiary/App.js#L141-L204)

- 语义：根据 `page` 映射到对应 Screen，并绑定所需 props
- 注意：这是项目当前唯一的“路由层”

## timeUtils.js：时间域 API

文件：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js)

- `formatDateTimeYYYYMMDDHHmm()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L1-L9)
- `formatTimeHHmm()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L11-L16)
- `formatDateYYYYMMDD()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L18-L24)
- `getTodayDateString()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L26-L30)
- `getWeekDateRange()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L32-L47)
- `getMonthDateRange()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L49-L56)
- `isRecordInRange()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L58-L62)
- `countRecordsInRange()`：[timeUtils.js](file:///Users/huyi/GerminationDiary/utils/timeUtils.js#L64-L67)

