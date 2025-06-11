import { BaseScene } from './BaseScene';
import { gameStateStores } from '@/stores/GameStateStores';
import { getAssetPath } from '@/config/AssetConfig';
import '@/styles/login.css';
import { getSpiritWelcome } from '@/api/spirteApi';

interface GradeOption {
    text: string;
    value: string;
}

export class LoginScene extends BaseScene {
    private formContainer!: HTMLDivElement;
    private usernameInput!: HTMLInputElement;
    private gradeSelect!: HTMLSelectElement;
    private loginButton!: HTMLButtonElement;
    private errorMessage!: HTMLDivElement;
    private gradeOptions: GradeOption[] = [];
    private isLoggingIn: boolean = false;

    constructor() {
        super('LoginScene');
        this.initGradeOptions();
    }

    private initGradeOptions(): void {
        this.gradeOptions = [
            { text: '小学四年级', value: '4' },
        ];
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
            this.createLoginForm();
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

    private createLoginForm(): void {
        // 创建表单容器
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'login-container';
        
        // 创建用户名输入框
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'form-group';
        this.usernameInput = document.createElement('input');
        this.usernameInput.type = 'text';
        this.usernameInput.className = 'form-input';
        this.usernameInput.placeholder = '请输入用户名';
        usernameGroup.appendChild(this.usernameInput);
        this.formContainer.appendChild(usernameGroup);
        
        // 创建年级选择框
        const gradeGroup = document.createElement('div');
        gradeGroup.className = 'form-group';
        this.gradeSelect = document.createElement('select');
        this.gradeSelect.className = 'grade-select';
        
        this.gradeOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.gradeSelect.appendChild(optionElement);
        });
        
        gradeGroup.appendChild(this.gradeSelect);
        this.formContainer.appendChild(gradeGroup);
        
        // 创建登录按钮
        this.loginButton = document.createElement('button');
        this.loginButton.className = 'login-button';
        this.loginButton.textContent = '开始探索';
        this.formContainer.appendChild(this.loginButton);
        
        // 创建错误消息容器
        this.errorMessage = document.createElement('div');
        this.errorMessage.className = 'error-message';
        this.errorMessage.style.display = 'none';
        this.formContainer.appendChild(this.errorMessage);
        
        // 将表单添加到游戏容器
        const gameContainer = this.game.canvas.parentElement;
        if (gameContainer) {
            gameContainer.appendChild(this.formContainer);
        }
    }

    private setupEventListeners(): void {
        this.loginButton.addEventListener('click', () => this.handleLogin());
        
        this.usernameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    private async handleLogin(): Promise<void> {
        if (this.isLoggingIn) return;
        
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            this.showError('请输入你的名字');
            return;
        }

        this.isLoggingIn = true;
        this.loginButton.disabled = true;
        this.loginButton.style.opacity = '0.7';
        this.loginButton.textContent = '进入中...';

        const gradeValue = this.gradeSelect.value;

        try {
            const userData = await gameStateStores.login(username, parseInt(gradeValue), ['语文', '数学', '英语']);
            
            localStorage.setItem('gameUser', JSON.stringify(userData));
            localStorage.setItem('gameUserCacheTime', Date.now().toString());
            
            //先获取欢迎语句
            const welcomeMessage = await getSpiritWelcome();

            // 先启动新场景
            this.scene.start('MainScene', {
                welcomeMessage: welcomeMessage.data?.welcomeMessage,
                fromScene: 'LoginScene'
            });
            
            // 等待一帧后再清理表单
            requestAnimationFrame(() => {
                this.cleanup();
            });
        } catch (error) {
            console.error('登录失败:', error);
            this.showError('登录失败，请重试');
            this.isLoggingIn = false;
            this.loginButton.disabled = false;
            this.loginButton.style.opacity = '1';
            this.loginButton.textContent = '开始探索';
        }
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 2000);
    }

    private cleanup(): void {
        if (this.formContainer) {
            const gameContainer = this.game.canvas.parentElement;
            if (gameContainer) {
                gameContainer.removeChild(this.formContainer);
            }
        }
        
        this.sound.stopAll();
    }

    init(): void {
        super.init();
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
} 