# 03 数据模型与状态流

## 顶层状态（App.js）

`App.js` 将所有业务数据集中保存在 React state 中：[App.js](file:///Users/huyi/SproutDiary/App.js#L40-L69)

- `babies: Baby[]`
- `selectedBabyId: string`
- `page: string`

其中 `currentBaby` 通过 `selectedBabyId` 从 `babies` 中派生得到：[App.js](file:///Users/huyi/SproutDiary/App.js#L45-L46)

## Baby 数据结构

初始宝宝结构 `initialBaby`（也是所有 Baby 的参考结构）：[App.js](file:///Users/huyi/SproutDiary/App.js#L13-L33)

```ts
type Baby = {
  id: string
  name: string
  gender: '男' | '女' | string
  birthday: string
  avatar: string
  birthInfo: {
    weight?: string
    length?: string
    headCircumference?: string
    delivery?: string
  }

  feedingRecords: FeedingRecord[]
  sleepRecords: SleepRecord[]
  diaperRecords: DiaperRecord[]
  growthRecords: GrowthRecord[]
  vaccineRecords: VaccineRecord[]
  illnessRecords: IllnessRecord[]

  pendingSleepStart: string
  pendingFeedingStart: string
}
```

## 记录通用字段与约定

所有类型的记录在写入时都会附加：

- `id`: `${type}-${Date.now()}`
- `createdAt`: `formatDateTimeYYYYMMDDHHmm()` 输出的时间字符串（如 `2026-5-6 09:30`）
- `recordType`: 中文类型（如 `喂养/睡眠/排便/生长/疫苗/生病`）

其中 `createdAt` 的写入位置通常在各 Screen 的 `submit`/`handleRecordEnd` 中（例如喂养）：[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L107-L120)

## 各类记录 Schema（按 Screen 实现推导）

### FeedingRecord（喂养）

来源：[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L97-L123)

```ts
type FeedingRecord = {
  id: string
  createdAt: string
  recordType: '喂养'
  type: '母乳' | '奶粉' | string
  startTime: string
  endTime: string
  duration: string
  amount: string
  note: string
  images: string[]
}
```

### SleepRecord（睡眠）

来源：[SleepScreen.js](file:///Users/huyi/SproutDiary/screens/SleepScreen.js#L87-L110)

```ts
type SleepRecord = {
  id: string
  createdAt: string
  recordType: '睡眠'
  type: '白天小睡' | '夜间睡眠' | string
  startTime: string
  endTime: string
  duration: string
  note: string
  images: string[]
}
```

### DiaperRecord（排便/小便）

来源：[DiaperScreen.js](file:///Users/huyi/SproutDiary/screens/DiaperScreen.js#L88-L99)

```ts
type DiaperRecord = {
  id: string
  createdAt: string
  recordType: '排便'
  type: '大便' | '小便' | string
  startTime: string
  color: string
  note: string
  images: string[]
}
```

### GrowthRecord（生长）

来源：[GrowthScreen.js](file:///Users/huyi/SproutDiary/screens/GrowthScreen.js#L91-L102)

```ts
type GrowthRecord = {
  id: string
  createdAt: string
  recordType: '生长'
  startTime: string
  weight: string
  length: string
  headCircumference: string
  note: string
  images: string[]
}
```

### VaccineRecord（疫苗）

来源：[VaccineScreen.js](file:///Users/huyi/SproutDiary/screens/VaccineScreen.js#L88-L103)

```ts
type VaccineRecord = {
  id: string
  createdAt: string
  recordType: '疫苗'
  vaccineName: string
  vaccinationDate: string
  location: string
  note: string
  images: string[]
}
```

### IllnessRecord（生病）

来源：[IllnessScreen.js](file:///Users/huyi/SproutDiary/screens/IllnessScreen.js#L91-L105)

```ts
type IllnessRecord = {
  id: string
  createdAt: string
  recordType: '生病'
  illnessType: string
  startTime: string
  symptoms: string
  medication: string
  note: string
  images: string[]
}
```

## 状态写入方式（单向数据流）

### 写入入口：App.js 的通用 CRUD

- `addRecord(type, record)`：[App.js](file:///Users/huyi/SproutDiary/App.js#L70-L79)
- `updateRecord(type, recordId, updatedFields)`：[App.js](file:///Users/huyi/SproutDiary/App.js#L81-L92)
- `deleteRecord(type, recordId)`：[App.js](file:///Users/huyi/SproutDiary/App.js#L94-L103)
- `clearRecords()`：[App.js](file:///Users/huyi/SproutDiary/App.js#L121-L139)

这些函数只更新“当前选中宝宝”的数据（通过 `selectedBabyId` 过滤）：[App.js](file:///Users/huyi/SproutDiary/App.js#L73-L77)

### Screen 的调用方式（示例：喂养）

`App.js` 为 `FeedingScreen` 绑定三类回调：[App.js](file:///Users/huyi/SproutDiary/App.js#L155-L162)

- `onAddFeeding(record)` → `addRecord('feeding', record)`
- `onUpdateFeeding(id, patch)` → `updateRecord('feeding', id, patch)`
- `onDeleteFeeding(id)` → `deleteRecord('feeding', id)`

Screen 内部只关心“如何组织 payload”，不直接操作 `babies`：
[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L170-L181)

## Pending Start 机制（跨页面续记）

喂养与睡眠都支持“先记录开始、稍后记录结束”的体验：

- `pendingFeedingStart`：[App.js](file:///Users/huyi/SproutDiary/App.js#L113-L119)
- `pendingSleepStart`：[App.js](file:///Users/huyi/SproutDiary/App.js#L105-L111)

Screen 通过 `onSetPendingXxxStart` 写入；重新进入页面时用 `useEffect` 同步到本地 state：

- 喂养：[FeedingScreen.js](file:///Users/huyi/SproutDiary/screens/FeedingScreen.js#L18-L21)
- 睡眠：[SleepScreen.js](file:///Users/huyi/SproutDiary/screens/SleepScreen.js#L16-L18)

