import { BaseScene } from './BaseScene';
import { gameState } from '../../stores/gameState';
import { Button, Input, Select } from '../components';

export class LoginScene extends BaseScene {
    private usernameInput!: Input;
    private gradeSelect!: Select;
    private loginButton!: Button;

    constructor() {
        super('LoginScene');
    }

    preload(): void {
        // 加载登录页面背景
        this.load.image('login-canvas', 'ui-placeholders/main-ui/login-canvas.png');
    }

    create(): void {
        super.create();

        // 创建背景
        this.createBackground('login-canvas');

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 创建标题
        const title = this.add.text(centerX, centerY - 150, '知识花园', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // 创建用户名输入框
        this.usernameInput = new Input(this, {
            x: centerX,
            y: centerY - 50,
            width: 300,
            placeholder: '请输入你的名字',
            defaultValue: '游客',
            style: {
                backgroundColor: 0xFFFFFF,
                backgroundAlpha: 0.9,
                borderColor: 0x4CAF50,
                textColor: '#333333'
            }
        });

        // 创建年级选择框
        const gradeOptions = [
            { value: '1', text: '小学一年级' },
            { value: '2', text: '小学二年级' },
            { value: '3', text: '小学三年级' },
            { value: '4', text: '小学四年级' },
            { value: '5', text: '小学五年级' },
            { value: '6', text: '小学六年级' }
        ];

        this.gradeSelect = new Select(this, {
            x: centerX,
            y: centerY + 10,
            width: 300,
            options: gradeOptions,
            defaultValue: '1',
            style: {
                backgroundColor: 0xFFFFFF,
                backgroundAlpha: 0.9,
                borderColor: 0x4CAF50,
                textColor: '#333333'
            }
        });

        // 创建登录按钮
        this.loginButton = new Button(this, {
            x: centerX,
            y: centerY + 100,
            width: 200,
            text: '开始探索',
            onClick: () => this.handleLogin()
        });

        // 添加回车键处理
        this.input.keyboard?.on('keydown-ENTER', () => {
            this.handleLogin();
        });
    }

    private async handleLogin(): Promise<void> {
        const username = this.usernameInput.getValue().trim();
        const gradeIndex = parseInt(this.gradeSelect.getValue());

        if (!username) {
            // 显示错误提示
            const errorText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 100,
                '请输入你的名字',
                { fontSize: '16px', color: '#ff0000' }
            );
            errorText.setOrigin(0.5);
            this.time.delayedCall(2000, () => errorText.destroy());
            return;
        }

        try {
            // 调用登录方法
            await gameState.login(username, gradeIndex, ['语文', '数学', '英语']);
            
            // 清理组件
            this.cleanup();
            
            // 跳转到主菜单场景
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error('登录失败:', error);
            // 显示错误提示
            const errorText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 100,
                '登录失败，请重试',
                { fontSize: '16px', color: '#ff0000' }
            );
            errorText.setOrigin(0.5);
            this.time.delayedCall(2000, () => errorText.destroy());
        }
    }

    private cleanup(): void {
        // 销毁组件
        this.usernameInput.destroy();
        this.gradeSelect.destroy();
        this.loginButton.destroy();
    }

    init(): void {
        super.init();
        // 监听场景关闭事件
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
} 