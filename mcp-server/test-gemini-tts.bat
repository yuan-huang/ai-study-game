@echo off
chcp 65001
echo =====================================================
echo      Gemini 2.5 Flash TTS 功能测试
echo =====================================================
echo.

echo 🎭 正在测试对话音效生成功能...
echo.

REM 检查环境
if not exist .env (
    echo ❌ 未找到.env配置文件
    echo 请先运行 install.bat 进行安装配置
    pause
    exit /b 1
)

if not exist dist (
    echo ❌ 项目未编译
    echo 正在编译项目...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ 编译失败
        pause
        exit /b 1
    )
)

REM 创建测试脚本
echo import { GameDialogueService } from './dist/services/gameDialogueService.js'; > test-tts.mjs
echo import dotenv from 'dotenv'; >> test-tts.mjs
echo. >> test-tts.mjs
echo dotenv.config(); >> test-tts.mjs
echo. >> test-tts.mjs
echo async function testDialogueService() { >> test-tts.mjs
echo   try { >> test-tts.mjs
echo     console.log('🎭 初始化对话音效服务...'); >> test-tts.mjs
echo     const dialogueService = new GameDialogueService(); >> test-tts.mjs
echo. >> test-tts.mjs
echo     console.log('📊 模型信息:'); >> test-tts.mjs
echo     console.log(JSON.stringify(dialogueService.getModelInfo(), null, 2)); >> test-tts.mjs
echo. >> test-tts.mjs
echo     console.log('\\n🎯 支持的角色:', dialogueService.getSupportedCharacters().join(', ')); >> test-tts.mjs
echo     console.log('😊 支持的情感:', dialogueService.getSupportedEmotions().join(', ')); >> test-tts.mjs
echo     console.log('🌍 支持的语言:', dialogueService.getSupportedLanguages().join(', ')); >> test-tts.mjs
echo. >> test-tts.mjs
echo     console.log('\\n🎪 开始测试对话生成...'); >> test-tts.mjs
echo. >> test-tts.mjs
echo     // 测试1: 商人角色对话 >> test-tts.mjs
echo     console.log('\\n===== 测试1: 商人角色对话 ====='); >> test-tts.mjs
echo     const result1 = await dialogueService.generateDialogue({ >> test-tts.mjs
echo       text: '欢迎来到我的店铺！需要什么武器吗？', >> test-tts.mjs
echo       character: 'merchant', >> test-tts.mjs
echo       emotion: 'happy', >> test-tts.mjs
echo       language: 'zh-CN' >> test-tts.mjs
echo     }); >> test-tts.mjs
echo     result1.content.forEach(item =^> console.log(item.text)); >> test-tts.mjs
echo. >> test-tts.mjs
echo     // 测试2: 战士角色愤怒对话 >> test-tts.mjs
echo     console.log('\\n===== 测试2: 战士角色愤怒对话 ====='); >> test-tts.mjs
echo     const result2 = await dialogueService.generateDialogue({ >> test-tts.mjs
echo       text: '敌人就在前方！准备战斗！', >> test-tts.mjs
echo       character: 'warrior', >> test-tts.mjs
echo       emotion: 'angry', >> test-tts.mjs
echo       language: 'zh-CN', >> test-tts.mjs
echo       speed: 1.2, >> test-tts.mjs
echo       pitch: 2 >> test-tts.mjs
echo     }); >> test-tts.mjs
echo     result2.content.forEach(item =^> console.log(item.text)); >> test-tts.mjs
echo. >> test-tts.mjs
echo     // 测试3: 英文对话 >> test-tts.mjs
echo     console.log('\\n===== 测试3: 英文对话 ====='); >> test-tts.mjs
echo     const result3 = await dialogueService.generateDialogue({ >> test-tts.mjs
echo       text: 'For honor and glory! We shall not surrender!', >> test-tts.mjs
echo       character: 'warrior', >> test-tts.mjs
echo       emotion: 'heroic', >> test-tts.mjs
echo       language: 'en-US', >> test-tts.mjs
echo       gender: 'male' >> test-tts.mjs
echo     }); >> test-tts.mjs
echo     result3.content.forEach(item =^> console.log(item.text)); >> test-tts.mjs
echo. >> test-tts.mjs
echo     console.log('\\n🎉 所有测试完成！'); >> test-tts.mjs
echo     console.log('\\n📁 生成的音频文件位于: ./generated_audio/'); >> test-tts.mjs
echo     console.log('\\n💡 提示: 这是模拟生成的音频文件'); >> test-tts.mjs
echo     console.log('   实际的Gemini TTS API集成需要根据官方API文档进行调整'); >> test-tts.mjs
echo. >> test-tts.mjs
echo   } catch (error) { >> test-tts.mjs
echo     console.error('❌ 测试失败:', error.message); >> test-tts.mjs
echo     if (error.message.includes('GEMINI_API_KEY')) { >> test-tts.mjs
echo       console.log('\\n🔧 请检查:'); >> test-tts.mjs
echo       console.log('   1. .env文件中的GEMINI_API_KEY是否正确设置'); >> test-tts.mjs
echo       console.log('   2. API密钥是否有效'); >> test-tts.mjs
echo     } >> test-tts.mjs
echo   } >> test-tts.mjs
echo } >> test-tts.mjs
echo. >> test-tts.mjs
echo testDialogueService(); >> test-tts.mjs

echo 🚀 正在运行Gemini TTS测试...
echo.

node test-tts.mjs

echo.
echo =====================================================
echo               测试完成
echo =====================================================
echo.
echo 📋 测试结果说明:
echo   ✅ 如果看到"对话音效生成完成"表示功能正常
echo   ⚠️  当前为模拟生成模式（开发阶段）
echo   🔧 实际集成需要Gemini TTS API正式发布
echo.
echo 📁 生成的文件:
echo   - generated_audio/  音频文件目录
echo   - 文件包含完整的语音配置信息
echo.
echo 🎯 下一步:
echo   - 运行 npm start 启动完整的MCP服务器
echo   - 查看 examples/usage-examples.json 获取更多示例
echo.

REM 清理测试文件
del test-tts.mjs

pause 