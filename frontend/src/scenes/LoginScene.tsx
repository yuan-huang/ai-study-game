import { BaseScene } from './BaseScene';
import { gameStateStores } from '@/stores/GameStateStores';
import { getAssetPath } from '@/config/AssetConfig';
import '@/styles/login.css';
import { gameEvents } from '@/utils/gameEvents';
import { hideLoading } from '@/components/LoadingManager';
import { createAuthFailedListener, clearAuthData } from '@/utils/authUtils';

export class LoginScene extends BaseScene {
    private isCleanedUp: boolean = false;

    constructor() {
        super('LoginScene');
    }

    preload(): void {
        this.load.image('login-canvas', getAssetPath('login-canvas'));
        this.load.audio('landing-interface-music', getAssetPath('landing-interface-music'));
    }

    create(): void {
        super.create();
        
        this.checkLoginCache().then((hasCache: boolean) => {
            if (hasCache) {
                console.log('🎬 LoginScene: 有缓存，直接跳转到MainScene');
                // 有缓存时也要隐藏加载动画，让MainScene来处理
                this.hideLoadingAnimation();
                this.scene.start('MainScene');
                return;
            }
            
            this.createBackground('login-canvas');
            this.showLoginForm();
            this.setupEventListeners();
            
            // 登录场景完全加载后隐藏加载动画
            this.hideLoadingAnimation();
        });

        this.sound.stopAll();
        this.audioManager.playMusic(this, 'landing-interface-music', {
            loop: true
        });
    }

    /**
     * 隐藏加载动画
     */
    private hideLoadingAnimation(): void {
        console.log('🎬 LoginScene: 准备隐藏加载动画');
        // 使用事件系统隐藏加载动画
        hideLoading(500); // 延迟500ms隐藏
    }

    private async checkLoginCache(): Promise<boolean> {
        try {
            const cachedUser = localStorage.getItem('gameUser');
            if (!cachedUser) {
                return false;
            }

            const userData = JSON.parse(cachedUser);
            // 检查缓存是否过期（这里设置为7天）
            const cacheTime = localStorage.getItem('gameUserCacheTime');
            if (cacheTime) {
                const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7天的毫秒数
                if (Date.now() - parseInt(cacheTime) > expirationTime) {
                    // 缓存过期，清除缓存
                    localStorage.removeItem('gameUser');
                    localStorage.removeItem('gameUserCacheTime');
                    return false;
                }
            }

            // 使用缓存数据恢复游戏状态
            await gameStateStores.restoreFromCache(userData);
            return true;
        } catch (error) {
            console.error('检查登录缓存失败:', error);
            return false;
        }
    }

    private showLoginForm(): void {
        // 发射显示登录表单事件
        gameEvents.emit('showLoginForm', {});
    }

    private setupEventListeners(): void {
        // 监听登录成功事件
        const unsubscribeLoginSuccess = gameEvents.on('loginSuccess', (data) => {
            console.log('LoginScene收到登录成功事件', data);
            
            // 启动主场景
            this.scene.start('MainScene', {
                welcomeMessage: data.welcomeMessage,
                fromScene: 'LoginScene'
            });
            
            // 延迟清理
            requestAnimationFrame(() => {
                this.cleanup();
            });
        });

        // 将取消订阅函数保存到场景数据中，以便清理时使用
        this.data.set('unsubscribeLoginSuccess', unsubscribeLoginSuccess);
    }

    private cleanup(): void {
        if (this.isCleanedUp) {
            return;
        }
        
        // 隐藏登录表单
        gameEvents.emit('hideLoginForm', {});
        
        // 取消事件订阅
        const unsubscribeLoginSuccess = this.data.get('unsubscribeLoginSuccess');
        if (unsubscribeLoginSuccess) {
            unsubscribeLoginSuccess();
        }
        
        // 清理认证失败事件监听器
        const authFailedCleanup = this.data.get('authFailedCleanup');
        if (authFailedCleanup) {
            authFailedCleanup();
            this.data.remove('authFailedCleanup');
        }
        
        this.sound.stopAll();
        this.isCleanedUp = true;
    }

    init(): void {
        super.init();
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
        
        // 监听全局认证失败事件
        this.setupAuthFailedListener();
    }

    /**
     * 设置认证失败监听器
     */
    private setupAuthFailedListener(): void {
        // 在登录页面收到认证失败事件时，只需要清除数据，不需要跳转
        const cleanup = createAuthFailedListener(this, (detail: any) => {
            console.warn('LoginScene收到认证失败事件:', detail);
            clearAuthData();
        });
        
        // 保存清理函数，用于场景销毁时调用
        this.data.set('authFailedCleanup', cleanup);
    }
} 