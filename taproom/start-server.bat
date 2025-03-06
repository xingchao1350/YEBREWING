@echo off
echo 正在启动野鹅微醺门店管理系统服务器...
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到Node.js
    echo 请先安装Node.js，然后再运行此脚本。
    echo 您可以从 https://nodejs.org/ 下载Node.js
    echo.
    pause
    exit /b 1
)

REM 启动服务器
echo 服务器启动中，请稍候...
echo 服务器启动后，请在浏览器中访问: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.
node server.js

pause 