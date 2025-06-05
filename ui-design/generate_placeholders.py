from PIL import Image, ImageDraw, ImageFont
import os

# 配置
BASE_DIR = "E:/AI游戏/frontend/public/ui-placeholders"
FONT_SIZE = 16
BG_COLOR = (255, 255, 255)  # 白色背景
TEXT_COLOR = (0, 0, 0)      # 黑色文字
GUIDE_COLOR = (200, 200, 200)  # 灰色参考线
BORDER_COLOR = (150, 150, 150) # 边框颜色

# 分类配置
CATEGORIES = {
    "main-ui": "主界面布局",
    "buttons": "按钮和交互控件",
    "sprites": "精灵和角色",
    "buildings": "建筑和关卡",
    "dialogs": "弹窗界面"
}

# UI元素规格(分类目录: [(英文名, 宽度, 高度, 中文名)])
UI_ELEMENTS = {
    "main-ui": [
         ("login-canvas", 1280, 720, "登录页面"),
        ("main-canvas", 1280, 720, "游戏主画布"),
        ("top-bar", 1280, 80, "顶部状态栏"),
        ("bottom-menu", 1280, 100, "底部菜单栏"),
        ("left-task-bar", 300, 540, "左侧任务栏"),
        ("right-quick-bar", 200, 540, "右侧快捷栏")
    ],
    "buttons": [
        ("btn-primary", 240, 80, "主要按钮"),
        ("btn-secondary", 160, 60, "次要按钮"),
        ("btn-icon", 80, 80, "图标按钮"),
        ("drag-item", 100, 100, "可拖拽元素")
    ],
    "sprites": [
        ("sprite-main", 200, 200, "主界面精灵"),
        ("sprite-task", 120, 120, "任务精灵"),
        ("flower-garden", 150, 150, "花园花朵"),
        ("flower-inventory", 80, 80, "仓库花朵")
    ],
    "buildings": [
        ("building-main", 180, 180, "主城建筑"),
        ("tower-defense", 100, 100, "防御塔"),
        ("monster", 80, 80, "怪物单位"),
        ("level-entry", 160, 120, "关卡入口")
    ],
    "dialogs": [
        ("dialog-task", 800, 500, "任务弹窗"),
        ("dialog-inventory", 1000, 600, "仓库弹窗"),
        ("dialog-settings", 600, 400, "设置弹窗"),
        ("dialog-achievement", 900, 550, "成就弹窗")
    ]
}

def get_text_dimensions(draw, text, font):
    """获取文本的宽度和高度"""
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]

def generate_placeholder(category, name, width, height, chinese_name):
    """生成带中英文标注的白色占位图"""
    img = Image.new("RGB", (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # 添加1像素边框
    draw.rectangle([0, 0, width-1, height-1], outline=BORDER_COLOR, width=1)
    
    # 添加参考线
    draw.line([(0, 0), (width, height)], fill=GUIDE_COLOR, width=1)
    draw.line([(0, height-1), (width, 0)], fill=GUIDE_COLOR, width=1)
    
    # 尝试加载中文字体
    try:
        font = ImageFont.truetype("msyh.ttc", FONT_SIZE)  # 微软雅黑
    except:
        try:
            font = ImageFont.truetype("simhei.ttf", FONT_SIZE)  # 黑体
        except:
            font = ImageFont.load_default()
            print("警告: 未找到中文字体，使用默认字体可能无法正常显示中文")
    
    # 要显示的文字内容
    texts = [
        f"{name}",
        f"{chinese_name}",
        f"{width}×{height}"
    ]
    
    # 计算总文本高度
    text_heights = [get_text_dimensions(draw, text, font)[1] for text in texts]
    total_height = sum(text_heights) + 10 * (len(texts) - 1)
    
    # 计算起始y位置(垂直居中)
    y_position = (height - total_height) // 2
    
    # 绘制每行文字
    for text in texts:
        text_width = get_text_dimensions(draw, text, font)[0]
        x_position = (width - text_width) // 2  # 水平居中
        draw.text((x_position, y_position), text, fill=TEXT_COLOR, font=font)
        y_position += get_text_dimensions(draw, text, font)[1] + 10
    
    # 确保分类目录存在
    category_dir = os.path.join(BASE_DIR, category)
    os.makedirs(category_dir, exist_ok=True)
    
    # 保存为PNG
    filename = os.path.join(category_dir, f"{name}.png")
    img.save(filename, "PNG")
    return filename

def generate_markdown_doc():
    """生成Markdown文档"""
    md_content = """# UI占位图目录

## 分类说明

"""
    # 添加分类说明
    for category_id, category_name in CATEGORIES.items():
        md_content += f"- [{category_name}](#{category_id})\n"
    
    # 添加每个分类的详情
    for category_id, elements in UI_ELEMENTS.items():
        md_content += f"\n## {CATEGORIES[category_id]}\n\n"
        md_content += "| 预览 | 英文名 | 中文名 | 尺寸 |\n"
        md_content += "|------|--------|--------|------|\n"
        
        for element in elements:
            name, width, height, chinese_name = element
            img_path = os.path.join(category_id, f"{name}.png")
            md_content += f"| ![ {name} ]({img_path}) | `{name}` | {chinese_name} | {width}×{height} |\n"
    
    # 写入文件
    with open(os.path.join(BASE_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(md_content)

if __name__ == "__main__":
    print(f"正在生成UI占位图到 '{BASE_DIR}'...")
    
    # 生成所有占位图
    total_count = 0
    for category_id, elements in UI_ELEMENTS.items():
        print(f"\n生成分类: {CATEGORIES[category_id]}")
        for element in elements:
            name, width, height, chinese_name = element
            generate_placeholder(category_id, name, width, height, chinese_name)
            print(f"  - 已生成: {name}.png")
            total_count += 1
    
    # 生成Markdown文档
    generate_markdown_doc()
    print(f"\n已生成文档: {os.path.join(BASE_DIR, 'README.md')}")
    
    print(f"\n完成! 共生成 {total_count} 张占位图")
    print(f"输出目录: {os.path.abspath(BASE_DIR)}")