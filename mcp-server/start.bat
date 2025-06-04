@echo off
echo ================================
echo 游戏开发MCP服务器启动
echo ================================
echo.

echo 检查环境配置...
if not exist .env (
    echo 错误：未找到 .env 配置文件
    echo 请先运行 install.bat 进行安装
    pause
    exit /b 1
)

echo 检查编译文件...
if not exist dist\index.js (
    echo 编译文件不存在，正在编译...
    npm run build
)

echo.
echo 正在启动MCP服务器...
echo 使用 Ctrl+C 停止服务器
echo.

npm start 