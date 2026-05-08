# 06 依赖与配置

## package.json

文件：[package.json](file:///Users/huyi/GerminationDiary/package.json)

### Scripts

定义：[package.json](file:///Users/huyi/GerminationDiary/package.json#L6-L11)

- `npm run start`：启动 Expo 开发服务器（Metro Bundler）
- `npm run android`：启动并尝试打开 Android（依赖本机 Android 环境）
- `npm run ios`：启动并尝试打开 iOS（依赖 macOS + Xcode 环境）
- `npm run web`：启动 Web 目标（Expo Web）

### Dependencies

定义：[package.json](file:///Users/huyi/GerminationDiary/package.json#L12-L18)

- `expo`：运行时与工程化能力
- `react` / `react-native`：UI 框架
- `expo-image-picker`：相册/相机
- `expo-status-bar`：状态栏

## Expo 配置（app.json）

文件：[app.json](file:///Users/huyi/GerminationDiary/app.json)

- `name/slug/version`：应用元信息 [app.json](file:///Users/huyi/GerminationDiary/app.json#L2-L6)
- `newArchEnabled: true`：启用 RN 新架构开关（依 Expo/RN 版本支持）[app.json](file:///Users/huyi/GerminationDiary/app.json#L8-L10)
- `icon/splash/android.adaptiveIcon/web.favicon`：应用图标与启动图 [app.json](file:///Users/huyi/GerminationDiary/app.json#L7-L27)

## 静态资源（assets）

目录：[assets/](file:///Users/huyi/GerminationDiary/assets)

- `icon.png`：应用图标
- `adaptive-icon.png`：Android 自适应图标前景
- `splash-icon.png`：启动图
- `favicon.png`：Web favicon

## 项目现状与缺失项（对接/扩展时常用）

- 无 TypeScript、无 ESLint/Prettier 配置（纯 JS 文件）
- 无路由/导航库（未引入 `react-navigation`）
- 无数据持久化（未引入 `AsyncStorage`/SQLite/Realm 等）
- 无构建流水线脚本（未配置 `eas build`，也未提供 CI 配置）

