# 05 Utils 与通用逻辑

## utils/timeUtils.js

文件：[timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js)

该文件集中提供“时间格式化 + 周/月范围 + 记录统计”能力，主要被 `HomeScreen` 用于统计聚合，也被各记录类 Screen 用于生成时间字符串。

### formatDateTimeYYYYMMDDHHmm

定义：[timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L1-L9)

- 输入：`Date`（默认 `new Date()`）
- 输出：形如 `YYYY-M-D HH:mm` 的字符串
- 使用场景
  - 作为 `createdAt` 写入记录
  - 作为表单 focus 自动填充时间（如 Diaper/Growth/Vaccine/Illness）

### formatTimeHHmm

定义：[timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L11-L16)

- 输出：`HH:mm` 字符串（2 位补零）
- 当前仓库中暂未发现明显业务依赖点，但可以用于更细的 UI 展示。

### formatDateYYYYMMDD 与 getTodayDateString

定义：[timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L18-L30)

- `formatDateYYYYMMDD()` 输出 `YYYY-M-D`
- `getTodayDateString()` 获取“今天”的 `YYYY-M-D`
- 首页用 `createdAt.startsWith(today)` 判断是否是今日记录：
  - [HomeScreen.js](file:///Users/huyi/SproutDiary/screens/HomeScreen.js#L10-L16)

### getWeekDateRange / getMonthDateRange

定义：

- [timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L32-L47)
- [timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L49-L56)

返回：

```ts
{ startOfWeek: Date, endOfWeek: Date }
{ startOfMonth: Date, endOfMonth: Date }
```

### isRecordInRange / countRecordsInRange

定义：[timeUtils.js](file:///Users/huyi/SproutDiary/utils/timeUtils.js#L58-L67)

- `isRecordInRange(record, startDate, endDate)`
  - 依赖：`new Date(record.createdAt)`
- `countRecordsInRange(records, startDate, endDate)`：过滤计数

## 通用 UI/交互模式（跨多个 Screen）

### 编辑态

几乎所有“记录类 Screen”都采用同一个编辑态模式：

- `editId` 存在则视为编辑态（`const isEditing = !!editId`）
- `handleEdit(item)` 将 item 字段回填到表单
- `resetForm()` 清空表单并退出编辑态
- `submit()` 在编辑态调用 `onUpdateX(editId, payload)`，否则调用 `onAddX(payloadWithCreatedAt)`

### 图片选择与存储

典型流程（以喂养为例）：[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L125-L168)

- 申请权限：`requestMediaLibraryPermissionsAsync()` / `requestCameraPermissionsAsync()`
- 获取图片：`launchImageLibraryAsync()` / `launchCameraAsync()`
- 将 `assets[0].uri` 追加到 `images: string[]`

图片在数据模型里仅保存 URI；没有拷贝到应用沙盒、也没有持久化到云端/本地存储。

