#!/bin/bash

# 音频剪辑工具启动脚本

echo "🎵 音频剪辑与音效合成工具 - 启动器"
echo "======================================"
echo ""
echo "请选择启动方式:"
echo ""
echo "1) Python 3 (推荐)"
echo "2) Python 2"
echo "3) PHP"
echo "4) Node.js (http-server)"
echo "5) 直接打开 index.html (可能有限制)"
echo ""
read -p "输入选项 (1-5): " choice

case $choice in
    1)
        if command -v python3 &> /dev/null; then
            echo "正在使用 Python 3 启动服务器..."
            python3 -m http.server 8000
        else
            echo "❌ Python 3 未安装"
        fi
        ;;
    2)
        if command -v python &> /dev/null; then
            echo "正在使用 Python 2 启动服务器..."
            python -m SimpleHTTPServer 8000
        else
            echo "❌ Python 2 未安装"
        fi
        ;;
    3)
        if command -v php &> /dev/null; then
            echo "正在使用 PHP 启动服务器..."
            php -S localhost:8000
        else
            echo "❌ PHP 未安装"
        fi
        ;;
    4)
        if command -v npx &> /dev/null; then
            echo "正在使用 Node.js http-server 启动..."
            npx http-server -p 8000
        else
            echo "❌ Node.js/npx 未安装"
            echo "   可以通过 npm install -g http-server 安装"
        fi
        ;;
    5)
        echo "正在直接打开 index.html..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open index.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open index.html
        else
            start index.html
        fi
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac
