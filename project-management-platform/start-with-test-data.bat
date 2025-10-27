@echo off
chcp 65001 >nul

echo 🚀 项目管理平台 - 测试数据导入脚本
echo ==================================

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 📦 安装依赖...
call npm install

echo 🔧 启动开发服务器...
start /b npm run dev

REM 等待服务器启动
echo ⏳ 等待开发服务器启动...
timeout /t 5 /nobreak >nul

REM 检查服务器是否启动成功
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 开发服务器启动成功!
    echo.
    echo 🌐 项目地址: http://localhost:5173
    echo 📊 测试数据导入: http://localhost:5173/test-data
    echo.
    echo 📋 使用说明:
    echo 1. 访问 http://localhost:5173/test-data
    echo 2. 点击 "导入测试数据" 按钮
    echo 3. 导入完成后，访问以下页面测试功能:
    echo    - 任务看板: http://localhost:5173/taskboard ^(甘特图功能^)
    echo    - 效能分析: http://localhost:5173/performance
    echo    - 资源预定: http://localhost:5173/resources
    echo    - 团队管理: http://localhost:5173/team
    echo.
    echo 🛑 按任意键停止服务器
    pause >nul
    
    REM 停止开发服务器
    taskkill /f /im node.exe >nul 2>&1
) else (
    echo ❌ 开发服务器启动失败
    pause
    exit /b 1
)