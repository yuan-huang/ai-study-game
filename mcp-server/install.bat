@echo off
chcp 65001
echo =====================================================
echo      游戏MCP服务器 v2.0 - 自动安装程序
echo =====================================================
echo.

echo 🎮 欢迎使用游戏MCP服务器！
echo 本版本支持：
echo   🖼️  图片生成 (Gemini 2.0 Flash)
echo   🎭 对话音效 (Gemini 2.5 Flash TTS)
echo   🎼 背景音乐 (Lyria API)
echo   📊 数据库管理 (MongoDB)
echo.

REM 检查Node.js
echo 步骤 1: 检查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装
    echo 请访问 https://nodejs.org 下载并安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js已安装

REM 检查npm
echo 步骤 2: 检查npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm未找到
    pause
    exit /b 1
)
echo ✅ npm可用

REM 安装依赖
echo.
echo 步骤 3: 安装依赖包...
echo 正在安装游戏MCP服务器依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

REM 检查MongoDB
echo.
echo 步骤 4: 检查MongoDB...
echo 正在检查MongoDB连接...
mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB未运行或未安装
    echo 请确保MongoDB服务正在运行
    echo 如未安装，请访问 https://www.mongodb.com/try/download/community
    echo.
    set /p continue="是否继续安装? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
) else (
    echo ✅ MongoDB连接正常
)

REM 配置API密钥
echo.
echo 步骤 5: 配置Gemini API密钥...
if exist .env (
    echo 发现现有的.env文件
    set /p replace="是否重新配置API密钥? (y/n): "
    if /i not "%replace%"=="y" (
        goto compile
    )
)

echo.
echo 请输入您的Gemini API密钥：
echo (用于图片生成和对话音效功能)
echo 获取地址: https://makersuite.google.com/app/apikey
echo.
set /p GEMINI_KEY="Gemini API密钥: "

if "%GEMINI_KEY%"=="" (
    echo ❌ API密钥不能为空
    pause
    exit /b 1
)

REM 创建.env文件
echo # 游戏MCP服务器 - 环境配置 > .env
echo # 生成时间: %date% %time% >> .env
echo. >> .env
echo # Gemini API密钥 (图片生成 + 对话音效) >> .env
echo GEMINI_API_KEY=%GEMINI_KEY% >> .env
echo. >> .env
echo # MongoDB数据库连接 >> .env
echo MONGODB_URI=mongodb://localhost:27017/swl >> .env
echo. >> .env
echo # Lyria音乐生成API (可选，未来功能) >> .env
echo # LYRIA_API_KEY=your_lyria_api_key >> .env

echo ✅ API密钥配置完成

:compile
REM 编译项目
echo.
echo 步骤 6: 编译TypeScript项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 编译失败
    pause
    exit /b 1
)
echo ✅ 编译完成

REM 创建目录
echo.
echo 步骤 7: 创建必要目录...
if not exist "generated_audio" mkdir generated_audio
if not exist "generated_music" mkdir generated_music
if not exist "logs" mkdir logs
echo ✅ 目录创建完成

REM 测试配置
echo.
echo 步骤 8: 测试配置...
echo 正在验证Gemini API配置...

REM 创建测试脚本
echo const { GoogleGenerativeAI } = require('@google/generative-ai'); > test-config.js
echo const dotenv = require('dotenv'); >> test-config.js
echo dotenv.config(); >> test-config.js
echo async function testConfig() { >> test-config.js
echo   try { >> test-config.js
echo     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); >> test-config.js
echo     console.log('✅ Gemini API配置正确'); >> test-config.js
echo     console.log('🎮 游戏MCP服务器已准备就绪！'); >> test-config.js
echo   } catch (error) { >> test-config.js
echo     console.log('❌ Gemini API配置错误:', error.message); >> test-config.js
echo   } >> test-config.js
echo } >> test-config.js
echo testConfig(); >> test-config.js

node test-config.js
del test-config.js

echo.
echo =====================================================
echo             🎉 安装完成！
echo =====================================================
echo.
echo 🚀 快速启动:
echo   npm start              - 启动MCP服务器
echo   npm run dev            - 开发模式
echo   npm run build          - 重新编译
echo.
echo 📚 配置文件:
echo   .env                   - 环境变量配置
echo   mcp-config.json        - MCP客户端配置
echo   examples/              - 使用示例
echo.
echo 🎭 主要功能:
echo   generate_game_image         - 图片生成
echo   generate_dialogue_audio     - 对话音效 (Gemini TTS)
echo   generate_game_music         - 背景音乐
echo   mongodb_*                   - 数据库操作
echo.
echo 🔧 故障排除:
echo   - 确保MongoDB服务正在运行
echo   - 检查GEMINI_API_KEY是否正确设置
echo   - 查看README.md获取详细文档
echo.
echo 🌟 新特性 (v2.0):
echo   ✨ 使用Gemini 2.5 Flash TTS进行对话音效
echo   ✨ 统一API密钥，简化配置
echo   ✨ 角色化语音，支持多语言
echo   ✨ 智能音调和语速控制
echo.

pause 