# MoodAlbum APK 构建指南

由于 Android 构建需要特定环境，请按照以下步骤在本地构建 APK。

## 环境要求

- **JDK 17** 或更高版本
- **Android SDK** (API Level 31+)
- **Android Studio** (推荐) 或 命令行工具
- **Node.js 18+**

## 快速构建步骤

### 1. 安装 JDK 17

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version  # 确认版本
```

**macOS (Homebrew):**
```bash
brew install openjdk@17
```

**Windows:**
从 https://adoptium.net/ 下载并安装 Temurin 17

### 2. 安装 Android SDK

**方式 A: 使用 Android Studio (推荐)**
1. 下载 Android Studio: https://developer.android.com/studio
2. 安装后打开 SDK Manager
3. 安装 Android SDK Platform 31+ 和 Build Tools

**方式 B: 命令行工具**
```bash
# 下载命令行工具后
sdkmanager "platform-tools" "platforms;android-31" "build-tools;33.0.0"
```

### 3. 配置环境变量

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/33.0.0
```

### 4. 构建 APK

```bash
# 进入项目目录
cd mood-album

# 安装依赖
npm install

# 构建前端
npm run build

# 同步到 Android
npx cap sync android

# 构建 Debug APK
cd android
./gradlew assembleDebug

# APK 输出位置：
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. 构建 Release APK (用于发布)

```bash
# 1. 生成签名密钥
keytool -genkey -v -keystore mood-album.keystore -alias mood-album -keyalg RSA -keysize 2048 -validity 10000

# 2. 创建 android/key.properties 文件
storePassword=<你的密钥库密码>
keyPassword=<你的密钥密码>
keyAlias=mood-album
storeFile=<keystore 文件路径>

# 3. 修改 android/app/build.gradle，在 android 块中添加：
# signingConfigs {
#     release {
#         Properties props = new Properties()
#         props.load(new FileInputStream(rootProject.file("key.properties")))
#         keyAlias props['keyAlias']
#         keyPassword props['keyPassword']
#         storeFile file(props['storeFile'])
#         storePassword props['storePassword']
#     }
# }
# buildTypes {
#     release {
#         signingConfig signingConfigs.release
#         minifyEnabled true
#         proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
#     }
# }

# 4. 构建 Release APK
./gradlew assembleRelease

# APK 输出位置：
# android/app/build/outputs/apk/release/app-release.apk
```

## 在手机上安装

### 方式 1: USB 传输
1. 将 APK 文件复制到手机
2. 在手机上打开 APK 进行安装
3. 可能需要允许"未知来源"安装

### 方式 2: ADB 安装
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 方式 3: 通过二维码分享
```bash
# 使用 Python 快速启动 HTTP 服务器
cd android/app/build/outputs/apk/debug/
python3 -m http.server 8000
# 然后在手机浏览器访问 http://你的电脑IP:8000/app-debug.apk
```

## PWA 方式（无需 APK）

如果不想构建 APK，可以直接使用 PWA 方式：

1. 将项目部署到服务器（如 Vercel、Netlify 或自己的服务器）
2. 在手机浏览器打开网址
3. 点击浏览器菜单的"添加到主屏幕"
4. 应用会像原生 App 一样显示在主屏幕上

## 常见问题

### Q: Gradle 构建失败
A: 确保 JAVA_HOME 指向 JDK 17，不是 JRE

### Q: SDK 找不到
A: 检查 ANDROID_HOME 环境变量是否正确设置

### Q: 签名错误
A: Release 版本需要签名，Debug 版本不需要

## 联系支持

如有问题，请查看：
- Capacitor 文档：https://capacitorjs.com/docs
- Android 开发者文档：https://developer.android.com
