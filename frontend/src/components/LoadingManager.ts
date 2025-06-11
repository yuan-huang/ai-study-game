import { gameEvents } from '@/utils/gameEvents';

/**
 * 游戏加载管理器
 * 通过事件机制控制加载动画的显示、隐藏、文本更新和音效
 */
export class LoadingManager {
    private static instance: LoadingManager;
    private loadingElement: HTMLElement | null = null;
    private textElement: HTMLElement | null = null;
    private progressElement: HTMLElement | null = null;
    private isVisible: boolean = false;
    private soundEnabled: boolean = true;
    private currentProgress: number = 0;
    private unsubscribeFunctions: (() => void)[] = [];

    private constructor() {
        this.initialize();
        this.setupEventListeners();
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): LoadingManager {
        if (!LoadingManager.instance) {
            LoadingManager.instance = new LoadingManager();
        }
        return LoadingManager.instance;
    }

    /**
     * 初始化加载管理器
     */
    private initialize(): void {
        this.loadingElement = document.getElementById('loading-screen');
        this.textElement = this.loadingElement?.querySelector('.loading-text') as HTMLElement;
        this.progressElement = this.loadingElement?.querySelector('.progress-bar') as HTMLElement;
        
        if (!this.loadingElement) {
            console.warn('LoadingManager: 未找到加载屏幕元素');
        } else {
            // 检查加载屏幕是否已经显示
            const computedStyle = window.getComputedStyle(this.loadingElement);
            this.isVisible = computedStyle.display !== 'none';
            console.log('🎬 LoadingManager初始化，当前显示状态:', this.isVisible);
        }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 显示加载屏幕
        const unsubscribeShow = gameEvents.on('loading:show', (data: { message?: string; playSound?: boolean }) => {
            this.show(data.message, data.playSound);
        });
        this.unsubscribeFunctions.push(unsubscribeShow);

        // 隐藏加载屏幕
        const unsubscribeHide = gameEvents.on('loading:hide', (data: { delay?: number }) => {
            console.log('🎬 LoadingManager收到隐藏事件:', data);
            this.hide(data.delay);
        });
        this.unsubscribeFunctions.push(unsubscribeHide);

        // 更新加载文本
        const unsubscribeUpdateText = gameEvents.on('loading:updateText', (data: { message: string }) => {
            this.updateText(data.message);
        });
        this.unsubscribeFunctions.push(unsubscribeUpdateText);

        // 更新进度
        const unsubscribeUpdateProgress = gameEvents.on('loading:updateProgress', (data: { progress: number }) => {
            this.updateProgress(data.progress);
        });
        this.unsubscribeFunctions.push(unsubscribeUpdateProgress);

        // 设置音效
        const unsubscribeSetSound = gameEvents.on('loading:setSound', (data: { enabled: boolean }) => {
            this.setSoundEnabled(data.enabled);
        });
        this.unsubscribeFunctions.push(unsubscribeSetSound);
    }

    /**
     * 显示加载屏幕
     */
    public show(message?: string, playSound: boolean = true): void {
        if (!this.loadingElement || this.isVisible) {
            return;
        }

        console.log('🎬 显示加载动画');
        
        // 更新文本
        if (message && this.textElement) {
            this.textElement.textContent = message;
        }

        // 显示加载屏幕
        this.loadingElement.style.display = 'flex';
        this.loadingElement.classList.remove('fade-out');
        this.loadingElement.style.opacity = '1';
        this.isVisible = true;

        // 播放加载音效
        if (playSound && this.soundEnabled) {
            this.playLoadingSound();
        }

        // 重置进度
        this.updateProgress(0);
        this.startProgressAnimation();
    }

    /**
     * 隐藏加载屏幕
     */
    public hide(delay: number = 0): void {
        if (!this.loadingElement) {
            console.warn('LoadingManager: 加载屏幕元素不存在，无法隐藏');
            return;
        }

        // 检查元素是否真的在显示中
        const computedStyle = window.getComputedStyle(this.loadingElement);
        const isActuallyVisible = computedStyle.display !== 'none';
        
        if (!isActuallyVisible && !this.isVisible) {
            console.log('🎬 加载动画已经隐藏，跳过隐藏操作');
            return;
        }

        console.log('🎬 隐藏加载动画');

        const hideAction = () => {
            if (this.loadingElement) {
                this.loadingElement.classList.add('fade-out');
                setTimeout(() => {
                    if (this.loadingElement) {
                        this.loadingElement.style.display = 'none';
                        this.isVisible = false;
                    }
                }, 500); // 等待淡出动画完成
            }
        };

        if (delay > 0) {
            setTimeout(hideAction, delay);
        } else {
            hideAction();
        }
    }

    /**
     * 更新加载文本
     */
    public updateText(message: string): void {
        if (this.textElement) {
            this.textElement.textContent = message;
            console.log('📝 更新加载文本:', message);
        }
    }

    /**
     * 更新进度条
     */
    public updateProgress(progress: number): void {
        if (this.progressElement) {
            this.currentProgress = Math.max(0, Math.min(100, progress));
            this.progressElement.style.width = `${this.currentProgress}%`;
            this.progressElement.style.animation = 'none'; // 停止自动动画
        }
    }

    /**
     * 启动进度条自动动画
     */
    private startProgressAnimation(): void {
        if (this.progressElement) {
            this.progressElement.style.animation = 'loading-progress 3s ease-in-out infinite';
        }
    }

    /**
     * 设置音效启用状态
     */
    public setSoundEnabled(enabled: boolean): void {
        this.soundEnabled = enabled;
        console.log('🔊 加载音效:', enabled ? '启用' : '禁用');
    }

    /**
     * 播放加载音效
     */
    private playLoadingSound(): void {
        // 这里可以播放一个简短的加载音效
        // 由于我们没有加载音效文件，这里只是模拟
        console.log('🎵 播放加载音效');
    }

    /**
     * 检查是否可见
     */
    public isLoadingVisible(): boolean {
        return this.isVisible;
    }

    /**
     * 销毁管理器（清理事件监听器）
     */
    public destroy(): void {
        // 调用所有取消订阅函数
        this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        this.unsubscribeFunctions = [];
    }
}

/**
 * 便捷函数：显示加载屏幕
 */
export function showLoading(message?: string, playSound: boolean = true): void {
    gameEvents.emit('loading:show', { message, playSound });
}

/**
 * 便捷函数：隐藏加载屏幕
 */
export function hideLoading(delay: number = 0): void {
    console.log('🎬 hideLoading被调用，延迟:', delay);
    gameEvents.emit('loading:hide', { delay });
}

/**
 * 便捷函数：更新加载文本
 */
export function updateLoadingText(message: string): void {
    gameEvents.emit('loading:updateText', { message });
}

/**
 * 便捷函数：更新加载进度
 */
export function updateLoadingProgress(progress: number): void {
    gameEvents.emit('loading:updateProgress', { progress });
}

/**
 * 便捷函数：设置加载音效
 */
export function setLoadingSoundEnabled(enabled: boolean): void {
    gameEvents.emit('loading:setSound', { enabled });
} 