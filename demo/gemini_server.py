#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智慧塔防游戏 - Gemini API 题目生成服务器
调用 Google Gemini API 根据用户配置生成个性化题目
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

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

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    """生成个性化题目的API接口"""
    try:
        # 获取请求数据
        data = request.get_json()
        grade = data.get('grade', 1)
        subject = data.get('subject', 'math')
        custom_content = data.get('customContent', '')
        questions_count = data.get('questionsCount', 8)  # 新增题目数量参数
        
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
                "maxOutputTokens": 4096  # 增加输出token限制
            }
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        print("正在调用 Gemini API...")
        response = requests.post(GEMINI_API_URL, 
                               headers=headers, 
                               json=gemini_payload,
                               timeout=45)  # 增加超时时间
        
        if response.status_code != 200:
            print(f"Gemini API 错误: {response.status_code}, {response.text}")
            return jsonify({
                'success': False,
                'error': f'Gemini API 调用失败: {response.status_code}'
            }), 500
        
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
                return jsonify({
                    'success': True,
                    'questions': questions,
                    'config': {
                        'grade': grade,
                        'subject': subject,
                        'customContent': custom_content,
                        'questionsCount': len(questions)
                    }
                })
                
            except json.JSONDecodeError as e:
                print(f"JSON 解析错误: {e}")
                print(f"原始内容: {content}")
                return jsonify({
                    'success': False,
                    'error': 'AI 返回的题目格式解析失败，请重试'
                }), 500
            except ValueError as e:
                print(f"题目验证错误: {e}")
                return jsonify({
                    'success': False,
                    'error': f'题目验证失败: {str(e)}'
                }), 500
        else:
            print("Gemini API 没有返回有效内容")
            return jsonify({
                'success': False,
                'error': 'AI 服务暂时不可用，请稍后重试'
            }), 500
            
    except requests.exceptions.Timeout:
        print("Gemini API 请求超时")
        return jsonify({
            'success': False,
            'error': 'AI 服务请求超时，请重试'
        }), 500
    except requests.exceptions.RequestException as e:
        print(f"请求异常: {e}")
        return jsonify({
            'success': False,
            'error': f'网络请求失败: {str(e)}'
        }), 500
    except Exception as e:
        print(f"未知错误: {e}")
        return jsonify({
            'success': False,
            'error': f'服务器内部错误: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'message': '题目生成服务运行正常'
    })

@app.route('/', methods=['GET'])
def index():
    """根路径返回服务信息"""
    return jsonify({
        'service': '智慧塔防游戏 - 题目生成服务',
        'version': '1.0.0',
        'endpoints': [
            'POST /generate_questions - 生成个性化题目',
            'GET /health - 健康检查'
        ]
    })

if __name__ == '__main__':
    print("🎮 智慧塔防游戏 - 题目生成服务")
    print("=" * 50)
    print("✅ 服务正在启动...")
    print("🌐 访问地址: http://localhost:5000")
    print("📋 API 接口: http://localhost:5000/generate_questions")
    print("💡 健康检查: http://localhost:5000/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True) 