# 喝水打卡

一个简洁美观的喝水打卡 Cordova 应用，支持 iOS 和 Android 平台。

## 功能

- 点击按钮快速打卡记录喝水
- 显示今日打卡次数
- 显示今日喝水时间记录列表
- 数据本地存储（localStorage）
- 渐变色美观界面
- 深色模式支持
- 触觉反馈（震动）

## 项目结构

```
Ruthirsty-cordova/
├── www/
│   ├── index.html       # 主页面
│   ├── cordova.js       # Cordova 框架文件（构建时生成）
│   ├── css/
│   │   └── index.css    # 样式文件
│   └── js/
│       └── index.js     # 应用逻辑
├── config.xml           # Cordova 配置文件
├── package.json         # 项目依赖配置
└── .gitignore          # Git 忽略文件
```

## 安装和构建

### 前置要求

1. 安装 Node.js (推荐 v18 或更高版本)
2. 安装 Cordova CLI
   ```bash
   npm install -g cordova
   ```

### iOS 开发要求

1. macOS 系统
2. Xcode (推荐最新版本)
3. Xcode Command Line Tools
   ```bash
   xcode-select --install
   ```

### Android 开发要求

1. Android Studio
2. Android SDK (API 22+)
3. 设置环境变量：
   ```bash
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### 快速开始

1. 安装依赖：
   ```bash
   npm install
   ```

2. 添加平台：
   ```bash
   # 添加 iOS 平台
   cordova platform add ios

   # 添加 Android 平台
   cordova platform add android
   ```

3. 在浏览器中预览：
   ```bash
   # 使用浏览器服务器预览
   npx cordova serve
   # 然后访问 http://localhost:8000
   ```

### 构建

```bash
# 构建 iOS
npm run build:ios
# 或
cordova build ios

# 构建 Android
npm run build:android
# 或
cordova build android
```

### 运行

```bash
# 在 iOS 设备或模拟器上运行
npm run run:ios
# 或
cordova run ios

# 在 Android 设备或模拟器上运行
npm run run:android
# 或
cordova run android
```

## iOS 部署

### 使用 Xcode

1. 构建项目后，打开 Xcode 项目：
   ```bash
   open platforms/ios/*.xcworkspace
   ```

2. 在 Xcode 中：
   - 选择你的开发团队（需要 Apple Developer 账号）
   - 选择目标设备或模拟器
   - 点击运行按钮

### 使用 cordova-ios

```bash
# 在连接的 iOS 设备上运行
cordova run ios --device

# 在 iOS 模拟器上运行
cordova run ios --emulator
```

## 应用说明

- **打卡按钮**：点击圆形的💧按钮即可打卡记录
- **今日计数**：顶部显示今日打卡总次数
- **记录列表**：显示每次打卡的时间，最新记录在上方

## 数据存储

应用使用 localStorage 存储数据，按日期分隔记录。每天的数据独立存储，切换日期时自动显示当天记录。

## 技术栈

- HTML5
- CSS3 (渐变色、Flexbox、响应式设计)
- Vanilla JavaScript
- Cordova (移动端封装)

## 许可证

MIT
