#!/bin/bash

# MoodAlbum APK 构建脚本
# 使用前请确保已安装 JDK 17 和 Android SDK

echo "🌿 MoodAlbum APK 构建工具"
echo "========================"

# 检查 Java 版本
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
echo "Java 版本：$JAVA_VERSION"

if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ 错误：需要 JDK 17 或更高版本"
    echo "   当前版本：$JAVA_VERSION"
    echo ""
    echo "请安装 JDK 17:"
    echo "  Ubuntu: sudo apt install openjdk-17-jdk"
    echo "  macOS:  brew install openjdk@17"
    echo "  Windows: 从 https://adoptium.net/ 下载"
    exit 1
fi

echo "✅ Java 版本符合要求"

# 检查 ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  警告：ANDROID_HOME 未设置"
    echo "   请设置环境变量："
    echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
    exit 1
fi

echo "✅ Android SDK: $ANDROID_HOME"

# 构建流程
echo ""
echo "📦 开始构建..."
echo ""

# 1. 安装依赖
echo "步骤 1/4: 安装依赖..."
npm install

# 2. 构建前端
echo "步骤 2/4: 构建前端..."
npm run build

# 3. 同步到 Android
echo "步骤 3/4: 同步到 Android..."
npx cap sync android

# 4. 构建 APK
echo "步骤 4/4: 构建 APK..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ 构建完成!"
echo ""
echo "📱 APK 文件位置:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📲 安装到手机:"
echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
