Write-Host "🎮 启动智慧塔防游戏统一服务器..." -ForegroundColor Green
Write-Host ""

try {
    python unified_server.py
} catch {
    Write-Host "错误：无法启动服务器" -ForegroundColor Red
    Write-Host "请检查Python是否已安装" -ForegroundColor Yellow
}

Read-Host "按回车键退出" 