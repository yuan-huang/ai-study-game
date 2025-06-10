#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
意图识别模块
"""

import google.generativeai as genai

def classify_intent(user_input):
    """
    对用户输入进行意图识别
    
    Args:
        user_input (str): 用户输入的问题
        
    Returns:
        int: 意图类别 (1: 游戏相关, 2: 学习相关, 3: 闲聊)
    """
    try:
        # 配置API
        genai.configure(api_key="AIzaSyAVf5sVj0n6ZGFqxHzVlRPD7WJ4y_0LKqM")
        client = genai.GenerativeModel("gemini-2.0-flash-lite")
        
        # 构建提示词
        prompt = f'''你是一个游戏里的NPC LLM，知识花园保卫战的核心玩法围绕以下几大模块展开：
在游戏中，孩子们将扮演知识星球的守护者，与两个AI NPC——花园精灵和好奇树一起，保卫正在遭受"无知军团"进攻的知识花园。

学科岛： 孩子们可以在这里选择相应的学科岛进行闯关学习。AI会根据他们的学习进度和掌握情况，智能匹配个性化关卡图库和题库，通关后可以获得"知识种子"。

而孩子们获得的"知识种子"将在"知识花园"里生根发芽，植物的生长状态会根据遗忘曲线自动更新，提醒孩子温故知新。我需要你来做意图识别，将用户的问题分为三类
1. 是游戏相关的问题，比如用户希望获得任务清单
2. 用户提出了一些学习相关的疑问，需要你解答
3. 用户在说一些生活化的闲聊问题
你只需要做意图识别，输出数字1，2，3，不需要回复任何其他内容，要不允许加其他信息。以下是用户问题：{user_input}'''
        
        # 调用API
        response = client.generate_content(prompt)
        result = response.text.strip()
        
        # 提取数字
        if '1' in result:
            return 1
        elif '2' in result:
            return 2
        elif '3' in result:
            return 3
        else:
            return 3  # 默认返回闲聊
            
    except Exception as e:
        print(f"意图识别出错：{e}")
        return 3  # 出错时默认返回闲聊


if __name__ == "__main__":
    # 测试
    test_input = "我怎样获得更多植物"
    intent = classify_intent(test_input)
    print(f"用户输入：{test_input}")
    print(f"意图识别结果：{intent}") 