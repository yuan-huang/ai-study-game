# 音量设置功能

## 功能概述

在游戏的每个场景右上角都有一个设置图标（⚙️），点击后可以打开音量设置面板，对游戏的音频进行全面控制。

## 功能特性

### 🔊 音量控制
- **主音量**: 控制整体音量大小
- **音乐音量**: 单独控制背景音乐音量
- **音效音量**: 单独控制游戏音效音量
- **静音功能**: 一键静音/取消静音

### 💾 设置持久化
- 所有音量设置会自动保存到浏览器本地存储
- 下次打开游戏时会自动恢复之前的设置
- 支持跨会话保持音量偏好

### 🎛️ 实时生效
- 音量调整立即生效，无需重启
- 拖动滑块时实时预览音量效果
- 静音状态立即应用到所有音频

## 技术实现

### 核心组件

#### AudioManager (音频管理器)
```typescript
// 单例模式，全局音频控制
const audioManager = AudioManager.getInstance();

// 设置音量
audioManager.setMasterVolume(0.8);
audioManager.setMusicVolume(0.6);
audioManager.setSoundVolume(0.7);

// 播放音频（自动应用音量设置）
audioManager.playMusic(scene, 'background-music');
audioManager.playSound(scene, 'click-sound');
```

#### VolumeSettingsPanel (音量设置面板)
- 响应式UI设计
- 滑动条交互
- 淡入淡出动画
- 点击外部区域关闭

#### BaseScene (基础场景)
- 所有游戏场景的基类
- 自动创建设置图标
- 统一的音频管理

### 数据存储

音量设置保存在 `localStorage` 中：
```javascript
{
  "gameAudio_masterVolume": "1.0",
  "gameAudio_musicVolume": "0.5", 
  "gameAudio_soundVolume": "0.8",
  "gameAudio_isMuted": "false"
}
```

## 使用方法

### 用户操作
1. 在任意游戏场景中找到右上角的设置图标（⚙️）
2. 点击图标打开音量设置面板
3. 拖动滑动条调整各类音量
4. 点击"静音"按钮可快速静音/取消静音
5. 点击面板外部或关闭按钮（✕）关闭设置

### 开发者集成
```typescript
// 在新场景中继承BaseScene即可自动获得音量设置功能
export class MyScene extends BaseScene {
    create() {
        super.create(); // 自动创建设置图标和音量面板
        
        // 使用AudioManager播放音频
        this.audioManager.playMusic(this, 'my-background-music');
        this.audioManager.playSound(this, 'my-sound-effect');
    }
}
```

## 设计细节

### UI/UX 设计
- **设置图标**: 采用齿轮emoji (⚙️)，通用易识别
- **悬停效果**: 图标缩放1.1倍，提供视觉反馈
- **点击效果**: 缩放0.9倍后回弹，增强交互感
- **面板设计**: 白色背景配蓝色边框，现代简洁风格
- **滑动条**: 蓝色主题，实时显示百分比数值

### 动画效果
- 面板淡入/淡出 (300ms/200ms)
- 图标悬停缩放动画 (200ms)
- 按钮点击反弹动画 (100ms)

### 音频分类
```typescript
// 音乐类型（背景音乐）
const musicKeys = [
    'landing-interface-music',
    'main-city-bgm', 
    'level-background-music',
    'garden-bgm',
    'curious-tree-bgm'
];

// 音效类型（交互音效）
const soundKeys = [
    'click-sound',
    'correct-answer-sound',
    'elimination-sound',
    // ... 其他音效
];
```

## 文件结构

```
frontend/src/
├── utils/
│   └── AudioManager.ts          # 音频管理器
├── components/  
│   └── VolumeSettingsPanel.ts   # 音量设置面板
├── scenes/
│   └── BaseScene.ts             # 基础场景（包含设置图标）
└── public/
    ├── audio/                   # 音频文件
    └── images/ui/icons/         # 设置图标
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ 移动端浏览器

## 注意事项

1. **自动播放策略**: 现代浏览器需要用户交互后才能播放音频
2. **音频格式**: 使用MP3格式保证最佳兼容性
3. **性能优化**: 音频文件预加载，避免播放延迟
4. **内存管理**: 场景切换时正确清理音频资源

## 未来扩展

- [ ] 添加音频可视化效果
- [ ] 支持自定义音效
- [ ] 添加均衡器功能
- [ ] 支持多语言界面
- [ ] 键盘快捷键支持 