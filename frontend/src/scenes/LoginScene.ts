import { BaseScene } from './BaseScene';
import { gameState } from '@/stores/gameState';
import { getAssetPath } from '@/config/AssetConfig';

interface GradeOption {
    text: string;
    value: string;
}

export class LoginScene extends BaseScene {
    private usernameInput!: Phaser.GameObjects.Container;
    private usernameInputField!: Phaser.GameObjects.Graphics;
    private usernameInputRect!: Phaser.Geom.Rectangle; // 用于碰撞检测
    private usernameText!: Phaser.GameObjects.Text;
    private gradeSelect!: Phaser.GameObjects.Container;
    private gradeSelectField!: Phaser.GameObjects.Graphics;
    private gradeSelectRect!: Phaser.Geom.Rectangle; // 用于碰撞检测
    private gradeText!: Phaser.GameObjects.Text;
    private loginButton!: Phaser.GameObjects.Container;
    private loginButtonBg!: Phaser.GameObjects.Graphics;
    private loginButtonText!: Phaser.GameObjects.Text;
    private formContainer!: Phaser.GameObjects.Container;
    private formBg!: Phaser.GameObjects.Graphics;
    private gradeOptions: GradeOption[] = [];
    private isEditing: boolean = false;
    private cursor: Phaser.GameObjects.Text | null = null;
    private activeGradeMenu: Phaser.GameObjects.Container | null = null;
    private activeGradeMenuRect: Phaser.Geom.Rectangle | null = null; // 用于碰撞检测
    private composingText: string = ''; // 用于存储正在输入的中文

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
        //通过 AssetConfig.ts 获取登录背景图片

        this.load.image('login-canvas',getAssetPath('login-canvas'));

       // 加载登录背景音乐
       this.load.audio('landing-interface-music', getAssetPath('landing-interface-music'));
    }

    create(): void {
        super.create();
        
        // 检查是否有登录缓存
        this.checkLoginCache().then(hasCache => {
            if (hasCache) {
                // 如果有缓存，直接进入游戏
                this.scene.start('MainScene');
                // this.scene.start('GardenScene');
                return;
            }
            
            // 如果没有缓存，显示登录界面
            this.createBackground('login-canvas');
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;
            
            this.createTitle(centerX, centerY);
            this.createFormContainer(centerX, centerY);
            this.createAllFormElements();
            this.setupEventListeners();
        });

        // 停止所有正在播放的音乐，然后播放登录背景音乐
        this.sound.stopAll();
        this.audioManager.playMusic(this, 'landing-interface-music', {
            loop: true
        });
    }

    private createTitle(centerX: number, centerY: number): void {
        const title = this.add.text(centerX, centerY - 180, '知识花园', {
            fontSize: '48px',
            color: '#000000',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
    }

    private createFormContainer(centerX: number, centerY: number): void {
        // 创建容器
        this.formContainer = this.add.container(centerX, centerY);
        
        // 创建一个带圆角的背景
        this.formBg = this.add.graphics();
        this.formBg.fillStyle(0x000000, 0.3);
        this.drawRoundedRect(this.formBg, -200, -150, 400, 300, 20); // x, y, width, height, radius
        
        this.formContainer.add(this.formBg);
    }

    private createAllFormElements(): void {
        this.createUsernameInputElement();
        this.createGradeSelectElement();
        this.createLoginButtonElement();
    }

    private createUsernameInputElement(): void {
        // 创建输入框背景（带圆角）
        this.usernameInputField = this.add.graphics();
        this.usernameInputField.fillStyle(0xFFFFFF, 1);
        this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
        
        // 创建用于碰撞检测的矩形
        this.usernameInputRect = new Phaser.Geom.Rectangle(-150, -100, 300, 40);
        
        // 创建文本
        this.usernameText = this.add.text(-140, -80, '请输入用户名', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#999999',
            fontStyle: 'bold'
        });
        this.usernameText.setOrigin(0, 0.5);
        
        // 创建容器
        this.usernameInput = this.add.container(0, 0);
        this.usernameInput.add([this.usernameInputField, this.usernameText]);
        
        // 设置交互
        this.usernameInputField.setInteractive(new Phaser.Geom.Rectangle(-150, -100, 300, 40), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.startTextEditing();
            })
            .on('pointerover', () => {
                this.usernameInputField.clear();
                this.usernameInputField.fillStyle(0xf5f5f5, 1);
                this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
            })
            .on('pointerout', () => {
                this.usernameInputField.clear();
                this.usernameInputField.fillStyle(0xFFFFFF, 1);
                this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
            });
        
        // 添加到表单容器
        this.formContainer.add(this.usernameInput);
    }

    private createGradeSelectElement(): void {
        // 创建选择框背景（带圆角）
        this.gradeSelectField = this.add.graphics();
        this.gradeSelectField.fillStyle(0xFFFFFF, 1);
        this.drawRoundedRect(this.gradeSelectField, -150, -20, 300, 40, 10);
        
        // 创建用于碰撞检测的矩形
        this.gradeSelectRect = new Phaser.Geom.Rectangle(-150, -20, 300, 40);
        
        // 创建文本
        const defaultGrade = this.gradeOptions.find(option => option.value === gameState.grade)?.text || this.gradeOptions[0].text;
        this.gradeText = this.add.text(-140, 0, defaultGrade, {
            fontSize: '16px',
            color: '#000000',
            fontStyle: 'bold'
        });
        this.gradeText.setOrigin(0, 0.5);
        
        // 创建下拉箭头
        const arrowIcon = this.add.text(120, 0, '▼', {
            fontSize: '16px',
            color: '#000000',
            fontStyle: 'bold'
        });
        arrowIcon.setOrigin(0.5);
        
        // 创建容器
        this.gradeSelect = this.add.container(0, 0);
        this.gradeSelect.add([this.gradeSelectField, this.gradeText, arrowIcon]);
        
        // 设置交互
        this.gradeSelectField.setInteractive(new Phaser.Geom.Rectangle(-150, -20, 300, 40), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.showGradeMenu();
            })
            .on('pointerover', () => {
                this.gradeSelectField.clear();
                this.gradeSelectField.fillStyle(0xf5f5f5, 1);
                this.drawRoundedRect(this.gradeSelectField, -150, -20, 300, 40, 10);
            })
            .on('pointerout', () => {
                this.gradeSelectField.clear();
                this.gradeSelectField.fillStyle(0xFFFFFF, 1);
                this.drawRoundedRect(this.gradeSelectField, -150, -20, 300, 40, 10);
            });
        
        // 添加到表单容器
        this.formContainer.add(this.gradeSelect);
    }

    private createLoginButtonElement(): void {
        // 创建按钮背景（带圆角）
        this.loginButtonBg = this.add.graphics();
        this.loginButtonBg.fillStyle(0x4CAF50, 1);
        this.drawRoundedRect(this.loginButtonBg, -100, 60, 200, 40, 20);
        
        // 创建文本
        this.loginButtonText = this.add.text(0, 80, '开始探索', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.loginButtonText.setOrigin(0.5);
        
        // 创建容器
        this.loginButton = this.add.container(0, 0);
        this.loginButton.add([this.loginButtonBg, this.loginButtonText]);
        
        // 设置交互
        this.loginButtonBg.setInteractive(new Phaser.Geom.Rectangle(-100, 60, 200, 40), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.handleLogin();
            })
            .on('pointerover', () => {
                this.loginButtonBg.clear();
                this.loginButtonBg.fillStyle(0x45a049, 1);
                this.drawRoundedRect(this.loginButtonBg, -100, 60, 200, 40, 20);
                this.loginButton.setScale(1.05);
            })
            .on('pointerout', () => {
                this.loginButtonBg.clear();
                this.loginButtonBg.fillStyle(0x4CAF50, 1);
                this.drawRoundedRect(this.loginButtonBg, -100, 60, 200, 40, 20);
                this.loginButton.setScale(1);
            });
        
        // 添加到表单容器
        this.formContainer.add(this.loginButton);
    }

    private showGradeMenu(): void {
        // 如果已有菜单，先清除
        if (this.activeGradeMenu) {
            this.activeGradeMenu.destroy();
            this.activeGradeMenu = null;
            this.activeGradeMenuRect = null;
            return;
        }
        
        // 创建菜单容器
        const menuContainer = this.add.container(0, 40);
        
        // 创建菜单背景（带圆角）
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0xFFFFFF, 1);
        menuBg.lineStyle(1, 0xcccccc, 1);
        
        const menuHeight = this.gradeOptions.length * 40;
        const menuY = -this.gradeOptions.length * 20;
        
        this.drawRoundedRect(menuBg, -150, menuY, 300, menuHeight, 10);
        
        // 创建用于碰撞检测的矩形
        this.activeGradeMenuRect = new Phaser.Geom.Rectangle(-150, menuY, 300, menuHeight);
        
        menuContainer.add(menuBg);
        
        // 创建菜单项
        this.gradeOptions.forEach((option, index) => {
            const itemY = menuY + 20 + index * 40;
            
            // 创建项背景（带圆角，但圆角比较小）
            const itemBg = this.add.graphics();
            itemBg.fillStyle(0xFFFFFF, 1);
            this.drawRoundedRect(itemBg, -145, itemY - 15, 290, 35, 5);
            
            // 创建项文本
            const itemText = this.add.text(-135, itemY, option.text, {
                fontSize: '16px',
                color: '#000000',
                fontStyle: 'bold'
            });
            itemText.setOrigin(0, 0.5);
            
            // 添加到菜单
            menuContainer.add([itemBg, itemText]);
            
            // 设置交互
            itemBg.setInteractive(new Phaser.Geom.Rectangle(-145, itemY - 15, 290, 35), Phaser.Geom.Rectangle.Contains)
                .on('pointerover', () => {
                    itemBg.clear();
                    itemBg.fillStyle(0xf0f0f0, 1);
                    this.drawRoundedRect(itemBg, -145, itemY - 15, 290, 35, 5);
                    itemText.setColor('#000000');
                })
                .on('pointerout', () => {
                    itemBg.clear();
                    itemBg.fillStyle(0xFFFFFF, 1);
                    this.drawRoundedRect(itemBg, -145, itemY - 15, 290, 35, 5);
                    itemText.setColor('#000000');
                })
                .on('pointerdown', () => {
                    this.gradeText.setText(option.text);
                    if (this.activeGradeMenu) {
                        this.activeGradeMenu.destroy();
                        this.activeGradeMenu = null;
                        this.activeGradeMenuRect = null;
                    }
                });
        });
        
        // 添加到场景并记录引用
        this.formContainer.add(menuContainer);
        this.activeGradeMenu = menuContainer;
    }

    // 绘制圆角矩形的辅助方法
    private drawRoundedRect(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, radius: number): void {
        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.fillPath();
    }

    private setupEventListeners(): void {
        // 键盘事件
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (!this.isEditing) return;
            
            switch (event.key) {
                case 'Backspace':
                    this.handleBackspace();
                    break;
                case 'Enter':
                    this.endTextEditing();
                    this.handleLogin();
                    break;
                case 'Escape':
                    this.cancelTextEditing();
                    break;
                default:
                    if (this.isPrintableKey(event.key)) {
                        this.addCharacter(event.key);
                    }
                    break;
            }
        });
        
        // 支持中文输入
        document.addEventListener('compositionstart', this.onCompositionStart.bind(this));
        document.addEventListener('compositionupdate', this.onCompositionUpdate.bind(this));
        document.addEventListener('compositionend', this.onCompositionEnd.bind(this));
        
        // 点击场景其他区域结束编辑和关闭菜单
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // 获取全局坐标并转换为相对于表单容器的本地坐标
            const localX = pointer.x - this.formContainer.x;
            const localY = pointer.y - this.formContainer.y;
            
            // 检查是否点击在输入框外部结束编辑
            if (this.isEditing && !Phaser.Geom.Rectangle.Contains(this.usernameInputRect, localX, localY)) {
                this.endTextEditing();
            }
            
            // 检查是否点击在年级选择菜单外部关闭菜单
            if (this.activeGradeMenu && this.activeGradeMenuRect) {
                const isClickOnGradeSelect = Phaser.Geom.Rectangle.Contains(this.gradeSelectRect, localX, localY);
                const isClickOnMenu = Phaser.Geom.Rectangle.Contains(this.activeGradeMenuRect, localX, localY);
                
                if (!isClickOnGradeSelect && !isClickOnMenu) {
                    this.activeGradeMenu.destroy();
                    this.activeGradeMenu = null;
                    this.activeGradeMenuRect = null;
                }
            }
        });
    }

    private onCompositionStart(event: CompositionEvent): void {
        if (!this.isEditing) return;
        
        // 开始输入中文
        this.composingText = '';
    }

    private onCompositionUpdate(event: CompositionEvent): void {
        if (!this.isEditing) return;
        
        // 更新正在输入的中文
        this.composingText = event.data;
        
        // 临时显示正在输入的文字
        const currentText = this.usernameText.text === '请输入用户名' ? '' : this.usernameText.text;
        this.usernameText.setText(currentText + this.composingText);
        this.updateCursorPosition();
    }

    private onCompositionEnd(event: CompositionEvent): void {
        if (!this.isEditing) return;
        
        // 完成中文输入，将最终结果添加到文本中
        const finalText = event.data;
        const currentText = this.usernameText.text === '请输入用户名' ? '' : 
                          this.usernameText.text.substring(0, this.usernameText.text.length - this.composingText.length);
        
        const maxLength = 20;
        if (currentText.length + finalText.length <= maxLength) {
            this.usernameText.setText(currentText + finalText);
        } else {
            // 如果超出最大长度，截断
            this.usernameText.setText((currentText + finalText).substring(0, maxLength));
        }
        
        this.composingText = '';
        this.updateCursorPosition();
    }

    private startTextEditing(): void {
        if (this.isEditing) return;
        
        this.isEditing = true;
        
        if (this.usernameText.text === '请输入用户名') {
            this.usernameText.setText('');
            this.usernameText.setColor('#000000');
        }
        
        this.createCursorElement();
        
        // 更改输入框背景颜色
        this.usernameInputField.clear();
        this.usernameInputField.fillStyle(0xf0f8ff, 1);
        this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
    }

    private createCursorElement(): void {
        if (this.cursor) {
            this.removeCursor();
        }
        
        const textBounds = this.usernameText.getBounds();
        const x = textBounds.right + 2;
        const y = textBounds.y + textBounds.height / 2;
        
        this.cursor = this.add.text(x, y, '|', {
            fontSize: '18px',
            color: '#000000',
            fontStyle: 'bold'
        });
        this.cursor.setOrigin(0, 0.5);
        
        // 添加闪烁动画
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        this.usernameInput.add(this.cursor);
    }

    private endTextEditing(): void {
        if (!this.isEditing) return;
        
        this.isEditing = false;
        this.removeCursor();
        
        if (this.usernameText.text.trim() === '') {
            this.usernameText.setText('请输入用户名');
            this.usernameText.setColor('#999999');
        }
        
        // 恢复输入框背景颜色
        this.usernameInputField.clear();
        this.usernameInputField.fillStyle(0xFFFFFF, 1);
        this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
    }

    private cancelTextEditing(): void {
        if (!this.isEditing) return;
        
        this.isEditing = false;
        this.removeCursor();
        
        this.usernameText.setText('请输入用户名');
        this.usernameText.setColor('#999999');
        
        // 恢复输入框背景颜色
        this.usernameInputField.clear();
        this.usernameInputField.fillStyle(0xFFFFFF, 1);
        this.drawRoundedRect(this.usernameInputField, -150, -100, 300, 40, 10);
    }

    private handleBackspace(): void {
        const currentText = this.usernameText.text;
        if (currentText.length > 0) {
            const newText = currentText.slice(0, -1);
            this.usernameText.setText(newText);
            this.updateCursorPosition();
        }
    }

    private addCharacter(character: string): void {
        const currentText = this.usernameText.text;
        const maxLength = 20;
        
        if (currentText.length < maxLength) {
            const newText = currentText + character;
            this.usernameText.setText(newText);
            this.updateCursorPosition();
        }
    }

    private updateCursorPosition(): void {
        if (!this.cursor) return;
        
        const textBounds = this.usernameText.getBounds();
        this.cursor.setPosition(
            textBounds.right + 2 - this.usernameInput.x,
            0
        );
    }

    private isPrintableKey(key: string): boolean {
        return key.length === 1 && (
            /^[a-zA-Z0-9\s]$/.test(key) || 
            /^[\u4e00-\u9fa5]$/.test(key) ||
            /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(key)
        );
    }

    private removeCursor(): void {
        if (this.cursor) {
            this.tweens.killTweensOf(this.cursor);
            this.cursor.destroy();
            this.cursor = null;
        }
    }

    // 检查登录缓存
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
            await gameState.restoreFromCache(userData);
            return true;
        } catch (error) {
            console.error('检查登录缓存失败:', error);
            return false;
        }
    }

    private async handleLogin(): Promise<void> {
        let username = this.usernameText.text;
        
        if (this.isEditing) {
            this.endTextEditing();
            username = this.usernameText.text;
        }
        
        if (username === '请输入用户名' || username.trim() === '') {
            this.showError('请输入你的名字');
            return;
        }

        const selectedGrade = this.gradeText.text;
        const gradeValue = this.gradeOptions.find(option => option.text === selectedGrade)?.value || '1';

        try {
            // 调用gameState的login方法，处理登录逻辑
            const userData = await gameState.login(username.trim(), parseInt(gradeValue), ['语文', '数学', '英语']);
            
            // 将登录数据写入缓存
            localStorage.setItem('gameUser', JSON.stringify(userData));
            localStorage.setItem('gameUserCacheTime', Date.now().toString());
            
            this.cleanup();
            this.scene.start('MainScene');
        } catch (error) {
            console.error('登录失败:', error);
            this.showError('登录失败，请重试');
        }
    }

    private showError(message: string): void {
        const errorText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            message,
            { fontSize: '16px', color: '#ff0000', fontStyle: 'bold' }
        );
        errorText.setOrigin(0.5);
        this.time.delayedCall(2000, () => errorText.destroy());
    }

    private cleanup(): void {

        // 清除年级菜单
        if (this.activeGradeMenu) {
            this.activeGradeMenu.destroy();
            this.activeGradeMenu = null;
            this.activeGradeMenuRect = null;
        }
        
        // 停止登录背景音乐
        this.sound.stopAll();
        
        // 移除光标
        this.removeCursor();
        
        // 移除中文输入事件监听
        document.removeEventListener('compositionstart', this.onCompositionStart.bind(this));
        document.removeEventListener('compositionupdate', this.onCompositionUpdate.bind(this));
        document.removeEventListener('compositionend', this.onCompositionEnd.bind(this));
        
        // 清理事件
        this.input.keyboard?.off('keydown');
        this.input.off('pointerdown');
        
        // 清理UI组件
        if (this.formContainer) {
            this.formContainer.destroy();
            this.formContainer = null as any; // 使用类型断言避免错误
        }
    }

    init(): void {
        super.init();
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
}