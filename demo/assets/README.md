# 游戏资源组织结构

## 📁 文件夹结构

```
demo/
├── assets/                 # 游戏资源文件夹
│   ├── images/            # 图片资源
│   │   ├── towers/        # 防御塔贴图
│   │   ├── enemies/       # 敌人贴图
│   │   ├── projectiles/   # 子弹/技能效果
│   │   ├── ui/            # UI界面元素
│   │   ├── backgrounds/   # 背景和地图
│   │   └── effects/       # 特效贴图
│   ├── sounds/            # 音效文件
│   │   ├── sfx/           # 音效
│   │   └── music/         # 背景音乐
│   └── fonts/             # 字体文件
```

## 🎨 图片命名规范

### 防御塔 (towers/)
```
arrow_tower_lv1.png        # 箭塔1级
arrow_tower_lv2.png        # 箭塔2级
arrow_tower_lv3.png        # 箭塔3级
cannon_tower_lv1.png       # 炮塔1级
cannon_tower_lv2.png       # 炮塔2级
cannon_tower_lv3.png       # 炮塔3级
ice_tower_lv1.png          # 冰塔1级
ice_tower_lv2.png          # 冰塔2级
ice_tower_lv3.png          # 冰塔3级
magic_tower_lv1.png        # 魔法塔1级
magic_tower_lv2.png        # 魔法塔2级
magic_tower_lv3.png        # 魔法塔3级

# 塔的额外组件
tower_base.png             # 塔底座
tower_range_indicator.png  # 射程指示器
```

### 敌人 (enemies/)
```
# 基础兵种
enemy_basic_idle.png       # 基础兵待机
enemy_basic_walk_01.png    # 基础兵行走帧1
enemy_basic_walk_02.png    # 基础兵行走帧2
enemy_basic_death.png      # 基础兵死亡

# 装甲兵种
enemy_armored_idle.png
enemy_armored_walk_01.png
enemy_armored_walk_02.png
enemy_armored_death.png

# 快速兵种
enemy_fast_idle.png
enemy_fast_walk_01.png
enemy_fast_walk_02.png
enemy_fast_death.png

# BOSS
enemy_boss_idle.png
enemy_boss_walk_01.png
enemy_boss_walk_02.png
enemy_boss_attack.png
enemy_boss_death.png
```

### 子弹和特效 (projectiles/ & effects/)
```
# 子弹
arrow_projectile.png       # 箭矢
cannonball_projectile.png  # 炮弹
ice_projectile.png         # 冰弹
magic_projectile.png       # 魔法弹

# 爆炸特效
explosion_01.png
explosion_02.png
explosion_03.png
explosion_04.png

# 击中特效
hit_effect_normal.png
hit_effect_ice.png
hit_effect_magic.png

# 粒子特效
particle_spark.png
particle_ice.png
particle_magic.png
```

### UI元素 (ui/)
```
# 按钮
btn_normal.png
btn_hover.png
btn_pressed.png
btn_disabled.png

# 面板
panel_question.png
panel_tower_menu.png
panel_upgrade.png
modal_background.png

# 图标
icon_health.png
icon_score.png
icon_combo.png
icon_timer.png

# 塔图标（用于菜单）
icon_arrow_tower.png
icon_cannon_tower.png
icon_ice_tower.png
icon_magic_tower.png
```

### 背景和地图 (backgrounds/)
```
game_background.png        # 游戏主背景
path_tile.png             # 路径贴图
grass_tile.png            # 草地贴图
stone_tile.png            # 石头贴图
water_tile.png            # 水面贴图

# 不同主题的背景
bg_forest.png             # 森林主题
bg_desert.png             # 沙漠主题
bg_snow.png               # 雪地主题
bg_volcano.png            # 火山主题
```

## 📏 推荐图片尺寸

### 防御塔
- 塔主体: 64x64px 或 128x128px
- 塔底座: 80x80px 或 160x160px

### 敌人
- 小型敌人: 32x32px 或 48x48px
- 中型敌人: 48x48px 或 64x64px
- 大型BOSS: 96x96px 或 128x128px

### 子弹
- 普通子弹: 16x16px 或 24x24px
- 特殊技能: 32x32px 或 48x48px

### UI元素
- 按钮: 建议使用矢量图标或高DPI图片
- 面板: 根据实际需要设计，支持拉伸

## 🎨 图片格式建议

- **PNG**: 适用于有透明背景的图片（塔、敌人、UI元素）
- **JPG**: 适用于背景图片（无透明需求）
- **SVG**: 适用于简单的图标和UI元素
- **WebP**: 现代浏览器支持，文件更小

## 📱 分辨率适配

建议提供多种分辨率的图片：
```
# 标准分辨率
tower_arrow_lv1.png        # 1x
tower_arrow_lv1@2x.png     # 2x (高DPI)
tower_arrow_lv1@3x.png     # 3x (超高DPI)
```

## 🔧 在代码中的使用

### 预加载图片
```javascript
// 在game.js中添加图片预加载
this.images = {};
this.loadImages([
    'assets/images/towers/arrow_tower_lv1.png',
    'assets/images/enemies/enemy_basic_idle.png',
    // ... 更多图片
]);

loadImages(imageUrls) {
    let loadedCount = 0;
    imageUrls.forEach(url => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount === imageUrls.length) {
                this.onImagesLoaded();
            }
        };
        img.src = url;
        const key = url.split('/').pop().split('.')[0];
        this.images[key] = img;
    });
}
```

### 在渲染中使用
```javascript
// 替换原来的简单绘制
render(ctx) {
    if (this.images.arrow_tower_lv1) {
        ctx.drawImage(
            this.images.arrow_tower_lv1,
            this.x - 32, this.y - 32,
            64, 64
        );
    }
}
``` 