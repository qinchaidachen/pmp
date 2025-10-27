#!/bin/bash

# 项目管理平台 - 测试数据导入脚本
# 用于快速启动项目并导入测试数据

echo "🚀 项目管理平台 - 测试数据导入脚本"
echo "=================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 安装依赖..."
npm install

echo "🔧 启动开发服务器..."
npm run dev &
DEV_PID=$!

# 等待服务器启动
echo "⏳ 等待开发服务器启动..."
sleep 5

# 检查服务器是否启动成功
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 开发服务器启动成功!"
    echo ""
    echo "🌐 项目地址: http://localhost:5173"
    echo "📊 测试数据导入: http://localhost:5173/test-data"
    echo ""
    echo "📋 使用说明:"
    echo "1. 访问 http://localhost:5173/test-data"
    echo "2. 点击 '导入测试数据' 按钮"
    echo "3. 导入完成后，访问以下页面测试功能:"
    echo "   - 任务看板: http://localhost:5173/taskboard (甘特图功能)"
    echo "   - 效能分析: http://localhost:5173/performance"
    echo "   - 资源预定: http://localhost:5173/resources"
    echo "   - 团队管理: http://localhost:5173/team"
    echo ""
    echo "🛑 按 Ctrl+C 停止服务器"
    
    # 等待用户中断
    wait $DEV_PID
else
    echo "❌ 开发服务器启动失败"
    kill $DEV_PID 2>/dev/null
    exit 1
fi