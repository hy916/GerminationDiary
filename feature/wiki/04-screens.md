# 04 Screen 模块说明

`screens/` 是项目的主要业务模块目录，每个文件对应一个页面组件：[screens/](file:///Users/huyi/SproutDiary/screens)

## 页面导航约定（page key）

`App.js` 使用 `page` 字符串进行页面切换：[App.js](file:///Users/huyi/SproutDiary/App.js#L141-L204)

- `Home`
- `Settings`
- `Profile`
- `Feeding`
- `Sleep`
- `Diaper`
- `Growth`
- `Vaccine`
- `Illness`

`HomeScreen`/`SettingsScreen` 等页面通过 `onNavigate(nextPage)` 触发切换，本质是调用 `setPage`。

## HomeScreen（首页聚合）

文件：[HomeScreen.js](file:///Users/huyi/SproutDiary/screens/HomeScreen.js)

- 职责
  - “今日/本周/本月”三个视图模式的统计概览（喂养/排便/睡眠/生长）
  - 组装 `allRecords`（所有记录的最近 20 条）用于时间线展示
  - 支持点击缩略图预览图片（Modal）
- 关键逻辑
  - `todayRecords()`：通过 `createdAt.startsWith(today)` 筛选今日记录 [HomeScreen.js](file:///Users/huyi/SproutDiary/screens/HomeScreen.js#L10-L16)
  - `countRecordsInRange()`：通过 `utils/timeUtils` 统计周/月记录 [HomeScreen.js](file:///Users/huyi/SproutDiary/screens/HomeScreen.js#L18-L30)

## BabyProfileScreen（宝宝档案与宝宝切换）

文件：[BabyProfileScreen.js](file:///Users/huyi/SproutDiary/screens/BabyProfileScreen.js)

- 职责
  - 切换当前宝宝：`babies` 列表横向滚动选择 [BabyProfileScreen.js](file:///Users/huyi/SproutDiary/screens/BabyProfileScreen.js#L63-L76)
  - 编辑当前宝宝档案并保存：调用 `onUpdateBaby(payload)` [BabyProfileScreen.js](file:///Users/huyi/SproutDiary/screens/BabyProfileScreen.js#L32-L47)
  - 新增宝宝：调用 `onAddBaby({ ... })` [BabyProfileScreen.js](file:///Users/huyi/SproutDiary/screens/BabyProfileScreen.js#L49-L59)
- 输入输出（props）
  - `baby: Baby`
  - `babies: Baby[]`
  - `onSwitchBaby(id: string)`
  - `onAddBaby(baby: Partial<Baby>)`
  - `onUpdateBaby(baby: Partial<Baby> & { id: string })`

## FeedingScreen（喂养记录）

文件：[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js)

- 职责
  - 支持“开始/结束”计时式记录
  - 支持编辑/删除历史记录
  - 支持添加多张图片（相册/拍照）
  - 支持 pending start（跨页面保留开始时间）
- 关键逻辑
  - `handleRecordStart()`：写入开始时间并同步到 `pendingFeedingStart` [FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L72-L95)
  - `handleRecordEnd()`：结束时生成记录并 `onAddFeeding(...)` [FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L97-L123)
  - `formatDuration()`：基于时间字符串计算分钟差 [FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L58-L66)
- 输入输出（props）
  - `baby: Baby`
  - `onAddFeeding(record)`
  - `onUpdateFeeding(id, patch)`
  - `onDeleteFeeding(id)`
  - `onSetPendingFeedingStart(value: string)`

## SleepScreen（睡眠记录）

文件：[SleepScreen.js](file:///Users/huyi/SproutDiary/screens/SleepScreen.js)

- 职责与 FeedingScreen 类似
  - “入睡/醒来”计时式记录
  - pending start（`pendingSleepStart`）
  - 编辑/删除历史记录
  - 图片选择与预览
- 关键逻辑
  - `handleRecordStart()`：写入 `pendingSleepStart` [SleepScreen.js](file:///Users/huyi/SproutDiary/screens/SleepScreen.js#L66-L85)
  - `handleRecordEnd()`：结束时生成记录并 `onAddSleep(...)` [SleepScreen.js](file:///Users/huyi/SproutDiary/screens/SleepScreen.js#L87-L110)

## DiaperScreen（排便/小便）

文件：[DiaperScreen.js](file:///Users/huyi/SproutDiary/screens/DiaperScreen.js)

- 职责
  - “大便/小便”二选一
  - 记录时间（输入框 focus 自动填充当前时间）[DiaperScreen.js](file:///Users/huyi/SproutDiary/screens/DiaperScreen.js#L101-L103)
  - 颜色、备注、图片
  - 编辑/删除
- 关键逻辑
  - `submit()`：新增或编辑 [DiaperScreen.js](file:///Users/huyi/SproutDiary/screens/DiaperScreen.js#L88-L99)

## GrowthScreen（生长发育）

文件：[GrowthScreen.js](file:///Users/huyi/SproutDiary/screens/GrowthScreen.js)

- 职责
  - 记录时间、体重、身长、头围、备注、图片
  - 编辑/删除
- 关键逻辑
  - `submit()`：新增或编辑 [GrowthScreen.js](file:///Users/huyi/SproutDiary/screens/GrowthScreen.js#L91-L102)

## VaccineScreen（疫苗）

文件：[VaccineScreen.js](file:///Users/huyi/SproutDiary/screens/VaccineScreen.js)

- 职责
  - 疫苗名称、接种时间（focus 自动填充）、地点、备注、图片
  - 编辑/删除
- 关键逻辑
  - `submit()`：校验必填并新增/编辑 [VaccineScreen.js](file:///Users/huyi/SproutDiary/screens/VaccineScreen.js#L88-L102)

## IllnessScreen（生病）

文件：[IllnessScreen.js](file:///Users/huyi/SproutDiary/screens/IllnessScreen.js)

- 职责
  - 症状类型、开始时间（focus 自动填充）、症状描述、用药情况、备注、图片
  - 编辑/删除
- 关键逻辑
  - `submit()`：校验必填并新增/编辑 [IllnessScreen.js](file:///Users/huyi/SproutDiary/screens/IllnessScreen.js#L91-L105)

## SettingsScreen（我的/设置）

文件：[SettingsScreen.js](file:///Users/huyi/SproutDiary/screens/SettingsScreen.js)

- 职责
  - 头像选择（相册/拍照）并写回宝宝档案：`onUpdateBaby({ ...baby, avatar: uri })` [SettingsScreen.js](file:///Users/huyi/SproutDiary/screens/SettingsScreen.js#L18-L38)
  - 清空当前宝宝记录：`onClearRecords()`（二次确认）[SettingsScreen.js](file:///Users/huyi/SproutDiary/screens/SettingsScreen.js#L73-L86)
  - 功能入口列表：通过 `onNavigate(page)` 跳转 [SettingsScreen.js](file:///Users/huyi/SproutDiary/screens/SettingsScreen.js#L115-L132)

