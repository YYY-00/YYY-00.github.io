#!/usr/bin/env python3
"""
简单的HTTP服务器启动脚本
用于运行音频剪辑工具
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def start_server():
    """启动HTTP服务器并自动打开浏览器"""

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"

        print("=" * 60)
        print("🎵 音频剪辑与音效合成工具")
        print("=" * 60)
        print(f"\n✓ 服务器已启动: {url}")
        print(f"✓ 按 Ctrl+C 停止服务器\n")

        # 自动打开浏览器
        webbrowser.open(url)

        print("服务器运行中...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n服务器已停止")
            sys.exit(0)

if __name__ == "__main__":
    start_server()
