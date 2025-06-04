#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智慧塔防游戏 - 统一服务器
同时提供游戏文件服务和AI题目生成API
"""

import os
import sys
import webbrowser
import threading
import time
import socket
import json
import requests
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from socketserver import TCPServer

# Gemini API 配置
GEMINI_API_KEY = "AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def generate_prompt(grade, subject, custom_content, questions_count=8):
    """根据用户配置生成 Gemini 提示词"""
    
    subject_names = {
        'math': '数学',
        'chinese': '语文', 
        'english': '英语'
    }
    
    subject_cn = subject_names.get(subject, '数学')
    
    base_prompt = f"""请为{grade}年级学生生成{questions_count}道{subject_cn}题目，用于塔防游戏中的答题环节。

要求：
1. 题目难度适合{grade}年级学生
2. 每道题目包含：题目内容、4个选项、正确答案
3. 题目要有趣且富有挑战性，避免重复
4. 题目难度要有梯度变化，从简单到困难
5. 请严格按照以下JSON格式返回，不要包含任何其他文字：

[
  {{
    "id": 1,
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correct": "正确答案",
    "grade": {grade},
    "subject": "{subject_cn}",
    "difficulty": "easy/medium/hard"
  }},
  ...
]

"""

    # 根据科目添加特定要求
    if subject == 'math':
        if grade <= 2:
            subject_prompt = "数学题目重点：10以内加减法、简单的数数、基础几何图形识别、认识时间"
        elif grade <= 4:
            subject_prompt = "数学题目重点：乘法表、两位数运算、简单分数、基础几何、面积周长"
        else:
            subject_prompt = "数学题目重点：小数运算、分数运算、百分数、几何面积计算、解方程"
    
    elif subject == 'chinese':
        if grade <= 2:
            subject_prompt = "语文题目重点：汉字识别、拼音、简单词语、基础阅读理解、看图说话"
        elif grade <= 4:
            subject_prompt = "语文题目重点：词语理解、成语、简单古诗、阅读理解、标点符号"
        else:
            subject_prompt = "语文题目重点：古诗词、文言文、修辞手法、综合阅读理解、作文技巧"
    
    elif subject == 'english':
        if grade <= 2:
            subject_prompt = "英语题目重点：基础单词、字母、简单句型、日常用语、颜色数字"
        elif grade <= 4:
            subject_prompt = "英语题目重点：常用词汇、简单语法、基础对话、词汇翻译、现在时态"
        else:
            subject_prompt = "英语题目重点：语法时态、词汇理解、阅读理解、句型转换、完形填空"
    
    base_prompt += f"\n{subject_prompt}\n"
    
    # 添加自定义内容
    if custom_content and custom_content.strip():
        base_prompt += f"\n特别关注以下内容：{custom_content}\n"
    
    base_prompt += f"\n请确保返回的是有效的JSON数组格式，包含{questions_count}道题目，题目要多样化且有趣。"
    
    return base_prompt

def generate_questions_api(post_data):
    """生成个性化题目的API接口"""
    try:
        # 解析请求数据
        data = json.loads(post_data.decode('utf-8'))
        grade = data.get('grade', 1)
        subject = data.get('subject', 'math')
        custom_content = data.get('customContent', '')
        questions_count = data.get('questionsCount', 8)
        
        print(f"收到请求: 年级={grade}, 科目={subject}, 自定义内容={custom_content}, 题目数量={questions_count}")
        
        # 生成提示词
        prompt = generate_prompt(grade, subject, custom_content, questions_count)
        print(f"生成的提示词:\n{prompt}")
        
        # 调用 Gemini API
        gemini_payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 4096
            }
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        print("正在调用 Gemini API...")
        response = requests.post(GEMINI_API_URL, 
                               headers=headers, 
                               json=gemini_payload,
                               timeout=45)
        
        if response.status_code != 200:
            print(f"Gemini API 错误: {response.status_code}, {response.text}")
            return {
                'success': False,
                'error': f'Gemini API 调用失败: {response.status_code}'
            }
        
        gemini_response = response.json()
        print(f"Gemini API 响应: {gemini_response}")
        
        # 解析 Gemini 响应
        if 'candidates' in gemini_response and len(gemini_response['candidates']) > 0:
            content = gemini_response['candidates'][0]['content']['parts'][0]['text']
            print(f"Gemini 返回内容:\n{content}")
            
            # 尝试解析 JSON
            try:
                # 清理内容，移除可能的markdown标记
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                content = content.strip()
                
                questions = json.loads(content)
                
                # 验证题目格式
                if not isinstance(questions, list) or len(questions) == 0:
                    raise ValueError("题目格式不正确")
                
                # 验证每道题目的必要字段
                for i, q in enumerate(questions):
                    if not all(key in q for key in ['question', 'options', 'correct']):
                        raise ValueError(f"第{i+1}道题目缺少必要字段")
                    if not isinstance(q['options'], list) or len(q['options']) != 4:
                        raise ValueError(f"第{i+1}道题目选项数量不正确")
                
                # 为题目添加唯一ID
                for i, q in enumerate(questions):
                    if 'id' not in q:
                        q['id'] = i + 1
                
                print(f"成功生成 {len(questions)} 道题目")
                return {
                    'success': True,
                    'questions': questions,
                    'config': {
                        'grade': grade,
                        'subject': subject,
                        'customContent': custom_content,
                        'questionsCount': len(questions)
                    }
                }
                
            except json.JSONDecodeError as e:
                print(f"JSON 解析错误: {e}")
                print(f"原始内容: {content}")
                return {
                    'success': False,
                    'error': 'AI 返回的题目格式解析失败，请重试'
                }
            except ValueError as e:
                print(f"题目验证错误: {e}")
                return {
                    'success': False,
                    'error': f'题目验证失败: {str(e)}'
                }
        else:
            print("Gemini API 没有返回有效内容")
            return {
                'success': False,
                'error': 'AI 服务暂时不可用，请稍后重试'
            }
            
    except requests.exceptions.Timeout:
        print("Gemini API 请求超时")
        return {
            'success': False,
            'error': 'AI 服务请求超时，请重试'
        }
    except requests.exceptions.RequestException as e:
        print(f"请求异常: {e}")
        return {
            'success': False,
            'error': f'网络请求失败: {str(e)}'
        }
    except Exception as e:
        print(f"未知错误: {e}")
        return {
            'success': False,
            'error': f'服务器内部错误: {str(e)}'
        }

class UnifiedHTTPRequestHandler(SimpleHTTPRequestHandler):
    """统一HTTP请求处理器 - 同时处理文件服务和API"""
    
    def end_headers(self):
        # 添加CORS头，避免跨域问题
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 禁用缓存，确保开发时能看到最新更改
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_OPTIONS(self):
        """处理OPTIONS请求（CORS预检）"""
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """处理POST请求 - API接口"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/generate_questions':
            # 处理题目生成API
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # 调用题目生成API
                result = generate_questions_api(post_data)
                
                # 返回JSON响应
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                
                response_json = json.dumps(result, ensure_ascii=False, indent=2)
                self.wfile.write(response_json.encode('utf-8'))
                
            except Exception as e:
                print(f"API错误: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                
                error_response = {
                    'success': False,
                    'error': f'服务器内部错误: {str(e)}'
                }
                response_json = json.dumps(error_response, ensure_ascii=False)
                self.wfile.write(response_json.encode('utf-8'))
        
        elif parsed_path.path == '/health':
            # 健康检查接口
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            health_response = {
                'status': 'ok',
                'message': '智慧塔防游戏统一服务运行正常',
                'services': ['game_files', 'ai_questions']
            }
            response_json = json.dumps(health_response, ensure_ascii=False)
            self.wfile.write(response_json.encode('utf-8'))
        
        else:
            # 其他POST请求返回404
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        """处理GET请求 - 文件服务"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            # 健康检查接口
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            health_response = {
                'status': 'ok',
                'message': '智慧塔防游戏统一服务运行正常',
                'services': ['game_files', 'ai_questions']
            }
            response_json = json.dumps(health_response, ensure_ascii=False)
            self.wfile.write(response_json.encode('utf-8'))
        
        elif parsed_path.path == '/api/info':
            # API信息接口
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            api_info = {
                'service': '智慧塔防游戏 - 统一服务器',
                'version': '2.0.0',
                'endpoints': [
                    'POST /generate_questions - 生成个性化题目',
                    'GET /health - 健康检查',
                    'GET /api/info - 服务信息',
                    'GET /* - 游戏文件服务'
                ]
            }
            response_json = json.dumps(api_info, ensure_ascii=False, indent=2)
            self.wfile.write(response_json.encode('utf-8'))
        
        else:
            # 默认文件服务
            super().do_GET()
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def check_conda_environment():
    """检查是否在conda环境中运行"""
    conda_default_env = os.environ.get('CONDA_DEFAULT_ENV')
    if conda_default_env:
        print(f"🐍 检测到Conda环境: {conda_default_env}")
        return conda_default_env
    else:
        print("⚠️  警告: 未检测到Conda环境，建议使用conda base环境")
        return None

def find_free_port(start_port=8000):
    """查找可用的端口"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except socket.error:
            continue
    return None

def open_browser(url, delay=1.5):
    """延迟打开浏览器"""
    def open_url():
        time.sleep(delay)
        print(f"\n🌐 正在打开浏览器: {url}")
        webbrowser.open(url)
    
    browser_thread = threading.Thread(target=open_url)
    browser_thread.daemon = True
    browser_thread.start()

def start_unified_server():
    """启动统一HTTP服务器"""
    # 确保在正确的目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("🎮 智慧塔防游戏 - 统一服务器 (游戏+AI)")
    print("=" * 50)
    
    # 检查conda环境
    conda_env = check_conda_environment()
    
    # 显示Python版本信息
    print(f"🐍 Python版本: {sys.version}")
    print(f"📁 Python路径: {sys.executable}")
    
    # 检查index.html是否存在
    if not os.path.exists('index.html'):
        print("❌ 错误: 当前目录下未找到 index.html 文件")
        print(f"📁 当前目录: {os.getcwd()}")
        print("📝 请确保在包含游戏文件的目录中运行此脚本")
        input("\n按回车键退出...")
        return
    
    # 查找可用端口
    port = find_free_port(8000)
    if port is None:
        print("❌ 错误: 无法找到可用端口 (8000-8099)")
        input("\n按回车键退出...")
        return
    
    # 创建服务器
    try:
        server = HTTPServer(('localhost', port), UnifiedHTTPRequestHandler)
        
        print(f"✅ 统一服务器启动成功!")
        if conda_env:
            print(f"🐍 使用环境: conda {conda_env}")
        print(f"📂 服务目录: {os.getcwd()}")
        print(f"🌐 访问地址: http://localhost:{port}")
        print(f"🎯 游戏入口: http://localhost:{port}/index.html")
        print(f"🤖 AI API: http://localhost:{port}/generate_questions")
        print(f"💡 健康检查: http://localhost:{port}/health")
        
        print("\n📋 可用文件:")
        files = ['index.html', 'style.css', 'game.js', 'imageLoader.js']
        for file in files:
            if os.path.exists(file):
                size = os.path.getsize(file)
                print(f"   ✓ {file} ({size} bytes)")
            else:
                print(f"   ✗ {file} (不存在)")
        
        print(f"\n🚀 统一服务器运行在端口 {port}")
        print("📡 提供服务: 游戏文件 + AI题目生成")
        print("⏹️  按 Ctrl+C 停止服务器")
        print("-" * 50)
        
        # 自动打开浏览器
        url = f"http://localhost:{port}"
        open_browser(url)
        
        # 启动服务器
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n\n⏹️  服务器已停止")
        print("👋 感谢使用智慧塔防游戏!")
    except Exception as e:
        print(f"\n❌ 服务器启动失败: {e}")
        input("\n按回车键退出...")

if __name__ == "__main__":
    try:
        start_unified_server()
    except KeyboardInterrupt:
        print("\n\n👋 再见!")
    except Exception as e:
        print(f"\n❌ 意外错误: {e}")
        input("\n按回车键退出...") 