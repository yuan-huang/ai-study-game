#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识花园植物状态监控程序
根据植物状态表提取需要知识甘露的植物
"""

import pandas as pd

def get_plant_tasks(display=True):
    """
    获取需要知识甘露的植物任务清单
    
    Args:
        display (bool): 是否打印显示结果，默认True
        
    Returns:
        list: 任务清单列表，每个元素包含植物信息
    """
    try:
        # 读取植物数据
        df = pd.read_csv("knowledge_garden_plant_status_table.csv", encoding='utf-8')
        
        # 筛选状态小于等于50的植物
        low_health_plants = df[df['plant_status'] <= 50]
        
        if low_health_plants.empty:
            if display:
                print("所有植物状态良好！")
            return []
        
        # 按状态排序，最紧急的在前面
        low_health_plants = low_health_plants.sort_values('plant_status')
        
        tasks = []
        
        if display:
            print("知识花园任务清单：")
            print("-" * 40)
        
        for _, plant in low_health_plants.iterrows():
            name = plant['plant_name']
            status = plant['plant_status']
            
            # 根据状态确定紧急程度和行动
            if status < 30:
                priority = "【紧急】"
                action = "急需浇灌知识甘露"
            else:  # status 30-50
                priority = "【重要】"
                action = "尽快浇灌知识甘露"
            
            task_info = {
                'name': name,
                'status': status,
                'priority': priority,
                'action': action,
                'display_text': f"{priority} {name}（状态：{status}）- {action}"
            }
            tasks.append(task_info)
            
            if display:
                print(task_info['display_text'])
        
        return tasks
            
    except Exception as e:
        if display:
            print(f"错误：{e}")
        return []

if __name__ == "__main__":
    get_plant_tasks() 