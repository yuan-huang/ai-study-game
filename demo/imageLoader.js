// 图片资源加载器 - Demo版本（使用占位符）
class ImageLoader {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onLoadComplete = null;
        this.onProgress = null;
    }
    
    // 定义所有需要的图片（Demo版本直接生成占位符）
    getImageList() {
        return {
            // 防御塔
            'arrow_tower_lv1': 'arrow_tower_lv1',
            'arrow_tower_lv2': 'arrow_tower_lv2',
            'arrow_tower_lv3': 'arrow_tower_lv3',
            'cannon_tower_lv1': 'cannon_tower_lv1',
            'cannon_tower_lv2': 'cannon_tower_lv2',
            'cannon_tower_lv3': 'cannon_tower_lv3',
            'ice_tower_lv1': 'ice_tower_lv1',
            'ice_tower_lv2': 'ice_tower_lv2',
            'ice_tower_lv3': 'ice_tower_lv3',
            'magic_tower_lv1': 'magic_tower_lv1',
            'magic_tower_lv2': 'magic_tower_lv2',
            'magic_tower_lv3': 'magic_tower_lv3',
            
            // 敌人
            'enemy_basic': 'enemy_basic',
            'enemy_armored': 'enemy_armored',
            'enemy_fast': 'enemy_fast',
            'enemy_boss': 'enemy_boss',
            
            // 子弹
            'arrow_projectile': 'arrow_projectile',
            'cannon_projectile': 'cannon_projectile',
            'ice_projectile': 'ice_projectile',
            'magic_projectile': 'magic_projectile'
        };
    }
    
    // 开始加载所有图片（Demo版本直接生成占位符）
    loadAll(onComplete, onProgress) {
        this.onLoadComplete = onComplete;
        this.onProgress = onProgress;
        
        const imageList = this.getImageList();
        this.totalCount = Object.keys(imageList).length;
        this.loadedCount = 0;
        
        // Demo版本：直接生成所有占位符图片
        Object.entries(imageList).forEach(([key, placeholder]) => {
            this.createPlaceholderImage(key);
        });
        
        // 模拟加载过程
        this.simulateLoading();
    }
    
    // 模拟加载过程
    simulateLoading() {
        const loadInterval = setInterval(() => {
            this.loadedCount++;
            
            // 更新进度
            if (this.onProgress) {
                this.onProgress(this.loadedCount, this.totalCount);
            }
            
            // 检查是否完成
            if (this.loadedCount >= this.totalCount) {
                clearInterval(loadInterval);
                if (this.onLoadComplete) {
                    setTimeout(() => {
                        this.onLoadComplete();
                    }, 200); // 稍微延迟一下让用户看到100%
                }
            }
        }, 100); // 每100ms加载一个
    }
    
    // 创建占位符图片
    createPlaceholderImage(key) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 根据图片类型设置不同尺寸和样式
        if (key.includes('tower')) {
            canvas.width = 48;
            canvas.height = 48;
            
            // 根据塔类型设置颜色
            if (key.includes('arrow')) {
                ctx.fillStyle = '#8B4513';
            } else if (key.includes('cannon')) {
                ctx.fillStyle = '#556B2F';
            } else if (key.includes('ice')) {
                ctx.fillStyle = '#4169E1';
            } else if (key.includes('magic')) {
                ctx.fillStyle = '#9932CC';
            }
            
            // 绘制塔身
            ctx.fillRect(8, 8, 32, 32);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(12, 12, 24, 24);
            
            // 绘制等级标识
            if (key.includes('lv2')) {
                ctx.fillStyle = '#f39c12';
                ctx.fillRect(40, 4, 8, 8);
            } else if (key.includes('lv3')) {
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(36, 0, 12, 12);
            }
            
        } else if (key.includes('enemy')) {
            canvas.width = 24;
            canvas.height = 24;
            
            // 根据敌人类型设置颜色
            if (key.includes('basic')) {
                ctx.fillStyle = '#e74c3c';
            } else if (key.includes('armored')) {
                ctx.fillStyle = '#95a5a6';
            } else if (key.includes('fast')) {
                ctx.fillStyle = '#f39c12';
            } else if (key.includes('boss')) {
                ctx.fillStyle = '#8e44ad';
            }
            
            // 绘制敌人
            ctx.beginPath();
            ctx.arc(12, 12, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制眼睛
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(8, 8, 2, 2);
            ctx.fillRect(14, 8, 2, 2);
            
        } else if (key.includes('projectile')) {
            canvas.width = 12;
            canvas.height = 12;
            
            // 根据子弹类型设置颜色
            if (key.includes('arrow')) {
                ctx.fillStyle = '#8B4513';
            } else if (key.includes('cannon')) {
                ctx.fillStyle = '#556B2F';
            } else if (key.includes('ice')) {
                ctx.fillStyle = '#4169E1';
            } else if (key.includes('magic')) {
                ctx.fillStyle = '#9932CC';
            }
            
            // 绘制子弹
            ctx.beginPath();
            ctx.arc(6, 6, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.images[key] = canvas;
    }
    
    // 获取图片
    getImage(key) {
        return this.images[key] || null;
    }
    
    // 检查图片是否已加载
    isLoaded(key) {
        return this.images.hasOwnProperty(key);
    }
    
    // 获取所有已加载的图片
    getAllImages() {
        return this.images;
    }
}

// 全局图片加载器实例
window.imageLoader = new ImageLoader(); 