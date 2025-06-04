@echo off
echo ================================
echo 配置Gemini API密钥
echo ================================
echo.

echo 正在配置API密钥...

echo # Gemini API配置 > .env
echo GEMINI_API_KEY=AIzaSyCdlRl_sO3Y05tBwFkVvowMD6bQg7mqa54 >> .env
echo. >> .env
echo # MongoDB配置 >> .env
echo MONGODB_URI=mongodb://localhost:27017/swl >> .env
echo MONGODB_DATABASE=swl >> .env
echo. >> .env
echo # 音效生成配置（可选） >> .env
echo AUDIO_API_KEY= >> .env
echo. >> .env
echo # 服务器配置 >> .env
echo PORT=3000 >> .env

echo.
echo ✅ API密钥配置完成！
echo.
echo 配置内容：
echo - Gemini API密钥: AIzaSyCdlRl_sO3Y05tBwFkVvowMD6bQg7mqa54
echo - MongoDB URI: mongodb://localhost:27017/swl
echo - 数据库名称: swl
echo.
echo 现在可以启动MCP服务器了！
echo 运行: start.bat
echo.
pause 