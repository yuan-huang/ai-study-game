import { BaseScene } from './BaseScene';
import { gameStateStores } from '@/stores/GameStateStores';
import { getAssetPath } from '@/config/AssetConfig';
import '@/styles/login.css';
import { gameEvents } from '@/utils/gameEvents';

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
                this.scene.start('MainScene');
                return;
            }
            
            this.createBackground('login-canvas');
            this.showLoginForm();
            this.setupEventListeners();
        });

        this.sound.stopAll();
        this.audioManager.playMusic(this, 'landing-interface-music', {
            loop: true
        });
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
        
        this.sound.stopAll();
        this.isCleanedUp = true;
    }

    init(): void {
        super.init();
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
} 