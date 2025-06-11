import { getAssetPath } from '@/config/AssetConfig';
import { EffectManager, SpriteEffect } from '@/effects';
import { BaseScene } from './BaseScene';
import { authApi } from '@/api/authApi';
import { getSpiritWelcome } from '@/api/spirteApi';
import { ApiResponse } from '@/utils/request';

export class MainScene extends BaseScene {
    private effectManager!: EffectManager;
    private welcomeText?: Phaser.GameObjects.Text;
    private welcomeContainer?: Phaser.GameObjects.Container;
    private confirmButton?: Phaser.GameObjects.Text;
    private spriteEffect!: SpriteEffect;
    private maskContainer!: Phaser.GameObjects.Container;
    private welcomeMessage?: string;
    private systemMenuContainer?: Phaser.GameObjects.Container;

    constructor() {
        super('MainScene');
    }
    
    init(data?: { welcomeMessage?: string; fromScene?: string }) {
        console.log('MainScene init', data);
        // 只有在从登录页面进入且有欢迎语时才显示
        if (data?.fromScene === 'LoginScene' && data?.welcomeMessage) {
            this.welcomeMessage = data.welcomeMessage;
            // 获取并显示欢迎语
            this.showWelcomeMessage();
        }
        
        // 确保输入管理器正确设置
        if (this.input) {
            this.input.topOnly = true; // 只处理最顶层的交互
        }
        
        // 监听场景切换事件
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
    
    preload(): void {
        // 加载背景图片
        this.load.image('main-bg', getAssetPath('main-bg'));
        
        // 加载 数学建筑, 语文建筑, 英语建筑
        this.load.image('chinese-building', getAssetPath('chinese-building'));
        this.load.image('math-building', getAssetPath('math-building'));
        this.load.image('english-building', getAssetPath('english-building'));
        this.load.image('curious-tree', getAssetPath('curious-tree'));
        this.load.image('knowledge-flower', getAssetPath('knowledge-flower'));

        this.load.image('sprite', getAssetPath('sprite'));
        this.load.image('sprite-fly', getAssetPath('sprite-fly'));
        
        // 加载主城背景音乐
        this.load.audio('main-city-bgm', getAssetPath('main-city-bgm'));

        //加载头像背景
        this.load.image('avatar-bg', getAssetPath('avatar-bg'));

        // 加载精灵动画帧
        this.load.spritesheet('sprite-animation', getAssetPath('sprite'), {
            frameWidth: 128,  // 每个帧的宽度
            frameHeight: 128  // 每个帧的高度
        });


    }
    
    async create() {
        super.create();
        // 初始化效果管理器
        this.effectManager = new EffectManager(this);
        this.spriteEffect = new SpriteEffect(this);

        // 创建精灵动画
        this.anims.create({
            key: 'sprite-fly',
            frames: this.anims.generateFrameNumbers('sprite-animation', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        // 创建一个遮罩层的容器
        this.maskContainer = this.add.container(0, 0);
        this.maskContainer.setDepth(9999);
        this.maskContainer.setAlpha(0.5);




        // 增加一个背景容器
        const bgContainer = this.add.container(0, 0);
        bgContainer.setDepth(0);
        bgContainer.setAlpha(1);

        // 创建背景
        const bg = this.add.image(0, 0, 'main-bg')
            .setOrigin(0, 0);
        bgContainer.add(bg);


        // 增加一个建筑容器
        const buildingContainer = this.add.container(0, 0);
        buildingContainer.setDepth(1);
        buildingContainer.setAlpha(1);

        // 添加建筑
        // 语文 右中
        const chineseBuilding = this.add.image(
            this.cameras.main.width * 0.82,
            this.cameras.main.height * 0.42,
            'chinese-building'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            chineseBuilding.x,
            chineseBuilding.y + chineseBuilding.height * 0.2,
            '语文塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);



        // 数学 右上
        const mathBuilding = this.add.image(
            this.cameras.main.width * 0.72,
            this.cameras.main.height * 0.24,
            'math-building'
        ).setScale(0.3)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            mathBuilding.x,
            mathBuilding.y + mathBuilding.height * 0.1,
            '数学塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);



        // 英语建筑 左边
        const englishBuilding = this.add.image(
            this.cameras.main.width * 0.42,
            this.cameras.main.height * 0.22,
            'english-building'
        ).setScale(0.35)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            englishBuilding.x,
            englishBuilding.y + englishBuilding.height * 0.1,
            '英语塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);




        // 好奇树 中间
        const curiousTree = this.add.image(
            this.cameras.main.width * 0.57,
            this.cameras.main.height * 0.25,
            'curious-tree'
        ).setScale(0.5)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            curiousTree.x,
            curiousTree.y + curiousTree.height * 0.2,
            '好奇树',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);





        // 知识花
        const knowledgeFlower = this.add.image(
            this.cameras.main.width * 0.45,
            this.cameras.main.height * 0.65,
            'knowledge-flower'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            knowledgeFlower.x,
            knowledgeFlower.y + knowledgeFlower.height * 0.12,
            '知识花园',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);

        // 精灵 左下
        const sprite = this.add.image(
            this.cameras.main.width * 0.18,
            this.cameras.main.height * 0.7,
            'sprite-fly'
        ).setScale(0.5)
        .setOrigin(0.5, 0.5)
        .setInteractive({ cursor: 'pointer' });
        sprite.flipX = true;


        // 保存原始缩放值
        chineseBuilding.setData('originalScale', 0.4);
        mathBuilding.setData('originalScale', 0.3);
        englishBuilding.setData('originalScale', 0.35);
        curiousTree.setData('originalScale', 0.5);
        knowledgeFlower.setData('originalScale', 0.4);
        sprite.setData('originalScale', 0.5);

        buildingContainer.add(chineseBuilding);
        buildingContainer.add(mathBuilding);
        buildingContainer.add(englishBuilding);
        buildingContainer.add(curiousTree);
        buildingContainer.add(knowledgeFlower);
        buildingContainer.add(sprite);

        bgContainer.add(buildingContainer);

        

        // 使用效果管理器添加交互效果
        this.effectManager.addBuildingInteraction(chineseBuilding, 'chinese', '语文塔');
        this.effectManager.addBuildingInteraction(mathBuilding, 'math', '数学塔');
        this.effectManager.addBuildingInteraction(englishBuilding, 'english', '英语塔');


        this.effectManager.addCuriousTreeInteraction(curiousTree,'curious','好奇树');
        this.effectManager.addKnowledgeFlowerInteraction(knowledgeFlower,'knowledge','知识花园');
        
        this.spriteEffect.addSpriteInteraction(sprite);


        //渲染用户信息
        this.renderUserInfo();

        // 播放主城背景音乐
        this.sound.stopAll();
        this.audioManager.playMusic(this, 'main-city-bgm', {
            loop: true
        });
    }

    private showWelcomeMessage() {
        try {
            // 如果没有欢迎语，直接返回
            if (!this.welcomeMessage) {
                return;
            }

            // 检查缓存中是否有欢迎语
            const cachedWelcome = localStorage.getItem('welcomeMessage');
            const cachedTimestamp = localStorage.getItem('welcomeMessageTimestamp');
            
            // 检查缓存是否在24小时内
            const isCacheValid = cachedWelcome && cachedTimestamp && 
                (Date.now() - parseInt(cachedTimestamp)) < 24 * 60 * 60 * 1000;

            // 如果缓存有效，使用缓存的欢迎语
            const messageToShow = isCacheValid ? cachedWelcome : this.welcomeMessage;

            // 如果使用新的欢迎语，更新缓存
            if (!isCacheValid) {
                localStorage.setItem('welcomeMessage', this.welcomeMessage);
                localStorage.setItem('welcomeMessageTimestamp', Date.now().toString());
            }

            this.displayWelcomeMessage(messageToShow);
        } catch (error) {
            console.error('显示欢迎语失败:', error);
        }
    }

    private displayWelcomeMessage(message: string) {
        // 创建欢迎容器
        this.welcomeContainer = this.add.container(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        ).setDepth(1000);

        //增加透明层，避免弹框点击到背景
        const transparentLayer = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.5)
            .setDepth(9999)
            .setInteractive()
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                // 阻止事件冒泡
                pointer.event.stopPropagation();
            });
        this.welcomeContainer.add(transparentLayer);

        // 创建背景
        const bg = this.add.rectangle(
            -300,
            300,
            800,
            420,
            0xffffff, // 白色
            0.8
        ).setOrigin(0.5);
        // 设置圆角
        bg.setRounded(20);

        // 创建欢迎语文本
        this.welcomeText = this.createText(
            -300,
            250,
            message,
            'TITLE_MEDIUM',
            {
                fontSize: 32,
                color: '#000000',
                align: 'left',
                lineSpacing: 10,
                wordWrap: { width: 600, useAdvancedWrap: true }
            }
        ).setOrigin(0.5);

        // 创建确认按钮, 设置圆角
        this.confirmButton = this.createText(
            -300,
            420,
            '确定',
            'BUTTON_TEXT',
            {
                fontSize: 32,
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            },
        ).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' });

        // 添加按钮悬停效果
        this.confirmButton?.on('pointerover', () => {
            this.confirmButton?.setStyle({ backgroundColor: '#45a049' });
        });

        this.confirmButton.on('pointerout', () => {
            this.confirmButton?.setStyle({ backgroundColor: '#4CAF50' });
        });

        // 添加按钮点击事件
        this.confirmButton.on('pointerdown', () => {
            // 添加淡出动画
            this.tweens.add({
                targets: this.welcomeContainer,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.welcomeContainer?.destroy();
                    this.welcomeContainer = undefined;
                    this.welcomeText = undefined;
                    this.confirmButton = undefined;
                }
            });
        });

        // 将所有元素添加到容器
        this.welcomeContainer.add([bg, this.welcomeText, this.confirmButton]);

        // 设置初始透明度为0
        this.welcomeContainer.setAlpha(0);

        // 添加淡入动画
        this.tweens.add({
            targets: this.welcomeContainer,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    async renderUserInfo() {
        //调用api获取用户信息
        const response = await authApi.getUserProfile();

        if (response.success && response.data) {
            const user = response.data.user;
            const flowerCount = response.data.flowerCount;
            const towerDefenseCount = response.data.towerDefenseCount;
            const reviewCount = response.data.reviewCount;
            const curiousTreeGrowthLevel = response.data?.curiousTreeGrowth?.level || 0;

            
            //创建一个容器
            const avatarContainer = this.add.container();
            avatarContainer.setPosition(50, 50);

            const avatarBg = this.add.image(
                0,
                0,
                'avatar-bg'
            ).setScale(1).setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                this.toggleSystemMenu();
            })
            .on('pointerover', () => {
                // 添加悬停效果
                this.tweens.add({
                    targets: avatarBg,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            })
            .on('pointerout', () => {
                // 恢复原状
                this.tweens.add({
                    targets: avatarBg,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            //获取用户头像的宽度
            const avatarWidth = avatarBg.width;

            //渲染用户信息
            const avatarText = this.createText(
                230,
                50,
                `${user.username}`,
                'LABEL_TEXT',
                {
                    fontSize: 28,
                    color: '#ffffff',
                    padding: { x: 10, y: 6 },
                    align: 'left',
                    wordWrap: { width: 90, useAdvancedWrap: true }, //超过宽度就隐藏
                }
            ).setAlpha(0.9).setOrigin(0, 0);


            const flowerText = this.createText(
                380,
                50,
                `花朵: ${flowerCount}\n`,
                'LABEL_TEXT',
                {
                    fontSize: 28,
                    color: '#ffffff',
                    padding: { x: 10, y: 6 },
                    align: 'left',
                }
            ).setAlpha(0.9).setOrigin(0, 0);

            const otherText = this.createText(
                230,
                120,
                `闯关:${towerDefenseCount} 复习: ${reviewCount} 好奇树: ${curiousTreeGrowthLevel}`,
                'LABEL_TEXT',
                {
                    fontSize: 28,
                    color: '#ffffff',
                    padding: { x: 10, y: 6 },
                    align: 'left',
                }
            ).setAlpha(0.9).setOrigin(0, 0);


            avatarContainer.add(avatarBg);
            avatarContainer.add(avatarText);
            avatarContainer.add(flowerText);
            avatarContainer.add(otherText);
        }

    }

    /**
     * 切换系统菜单显示/隐藏
     */
    private toggleSystemMenu(): void {
        if (this.systemMenuContainer) {
            // 如果菜单已存在，则隐藏
            this.hideSystemMenu();
        } else {
            // 显示菜单
            this.showSystemMenu();
        }
    }

    /**
     * 显示系统菜单
     */
    private showSystemMenu(): void {
        // 创建系统菜单容器
        this.systemMenuContainer = this.add.container(0, 0).setDepth(1000);

        // 创建遮罩层
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.3
        ).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.hideSystemMenu();
        });

        // 菜单背景 - 使用圆角矩形
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0xffffff, 0.95);
        menuBg.lineStyle(3, 0x333333, 1);
        menuBg.fillRoundedRect(300 - 140, 200 - 120, 280, 240, 20); // 圆角半径20
        menuBg.strokeRoundedRect(300 - 140, 200 - 120, 280, 240, 20);

        // 菜单标题
        const title = this.createText(
            300, 120,
            '系统菜单',
            'TITLE_MEDIUM',
            {
                fontSize: 28,
                color: '#333333',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 音量设置按钮
        const volumeButton = this.createText(
            300, 180,
            '🔊 音量设置',
            'BUTTON_TEXT',
            {
                fontSize: 28,
                color: '#333333',
                backgroundColor: '#f0f0f0',
                padding: { x: 20, y: 12 }
            }
        ).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
            volumeButton.setStyle({ backgroundColor: '#e0e0e0' });
        })
        .on('pointerout', () => {
            volumeButton.setStyle({ backgroundColor: '#f0f0f0' });
        })
        .on('pointerdown', async () => {
            // 尝试恢复AudioContext
            await this.audioManager.resumeAudioContext(this);
            
            // 播放点击音效
            this.audioManager.playSound(this, 'click-sound');
            
            // 显示音量设置面板
            if (this.volumeSettingsPanel) {
                this.volumeSettingsPanel.toggle();
            }
            
            // 隐藏系统菜单
            this.hideSystemMenu();
        });

        // 退出游戏按钮
        const exitButton = this.createText(
            300, 250,
            '🚪 退出游戏',
            'BUTTON_TEXT',
            {
                fontSize: 28,
                color: '#ffffff',
                backgroundColor: '#ff4444',
                padding: { x: 20, y: 12 }
            }
        ).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
            exitButton.setStyle({ backgroundColor: '#ff6666' });
        })
        .on('pointerout', () => {
            exitButton.setStyle({ backgroundColor: '#ff4444' });
        })
        .on('pointerdown', () => {
            // 隐藏系统菜单并显示退出确认对话框
            this.hideSystemMenu();
            this.showPowerOffConfirmDialog();
        });

        // 添加所有元素到容器
        this.systemMenuContainer.add([overlay, menuBg, title, volumeButton, exitButton]);

        // 设置初始状态并添加动画
        this.systemMenuContainer.setAlpha(0).setScale(0.8);
        this.tweens.add({
            targets: this.systemMenuContainer,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }

    /**
     * 隐藏系统菜单
     */
    private hideSystemMenu(): void {
        if (this.systemMenuContainer) {
            this.tweens.add({
                targets: this.systemMenuContainer,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.systemMenuContainer?.destroy();
                    this.systemMenuContainer = undefined;
                }
            });
        }
    }



    /**
     * 显示关机确认对话框
     */
    private showPowerOffConfirmDialog(): void {
        // 创建确认对话框容器
        const dialogContainer = this.add.container(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        ).setDepth(1001);

        // 添加遮罩层
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.5
        ).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });

        // 创建对话框背景 - 使用圆角矩形，增大尺寸
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0xffffff, 0.95);
        dialogBg.lineStyle(3, 0x333333, 1);
        dialogBg.fillRoundedRect(-250, -150, 500, 300, 25); // 增大到500x300，圆角半径25
        dialogBg.strokeRoundedRect(-250, -150, 500, 300, 25);

        // 创建标题
        const title = this.createText(
            0, -80,
            '确认退出',
            'TITLE_MEDIUM',
            {
                fontSize: 28,
                color: '#333333',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 创建提示文本
        const message = this.createText(
            0, -20,
            '确定要退出到登录界面吗？',
            'LABEL_TEXT',
            {
                fontSize: 28,
                color: '#666666',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 创建按钮
        const confirmButton = this.createText(
            -100, 80,
            '确定',
            'BUTTON_TEXT',
            {
                fontSize: 28,
                color: '#ffffff',
                backgroundColor: '#ff4444',
                padding: { x: 30, y: 15 }
            }
        ).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
            confirmButton.setStyle({ backgroundColor: '#ff6666' });
        })
        .on('pointerout', () => {
            confirmButton.setStyle({ backgroundColor: '#ff4444' });
        })
        .on('pointerdown', () => {
            this.handlePowerOff();
        });

        const cancelButton = this.createText(
            100, 80,
            '取消',
            'BUTTON_TEXT',
            {
                fontSize: 28,
                color: '#333333',
                backgroundColor: '#cccccc',
                padding: { x: 30, y: 15 }
            }
        ).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
            cancelButton.setStyle({ backgroundColor: '#dddddd' });
        })
        .on('pointerout', () => {
            cancelButton.setStyle({ backgroundColor: '#cccccc' });
        })
        .on('pointerdown', () => {
            // 关闭对话框
            this.tweens.add({
                targets: dialogContainer,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    dialogContainer.destroy();
                }
            });
        });

        // 添加所有元素到容器
        dialogContainer.add([overlay, dialogBg, title, message, confirmButton, cancelButton]);

        // 设置初始状态并添加动画
        dialogContainer.setAlpha(0).setScale(0.8);
        this.tweens.add({
            targets: dialogContainer,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }

    /**
     * 处理关机逻辑
     */
    private handlePowerOff(): void {
        // 清除用户缓存
        localStorage.removeItem('gameUser');
        localStorage.removeItem('gameUserCacheTime');
        localStorage.removeItem('welcomeMessage');
        localStorage.removeItem('welcomeMessageTimestamp');

        // 停止所有音效
        this.sound.stopAll();

        // 添加淡出效果后切换到登录场景
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoginScene');
        });
    }

    /**
     * 清理场景资源
     */
    private cleanup(): void {
        // 停止主城背景音乐
        this.sound.stopAll();
        
        // 清理效果管理器
        if (this.effectManager) {
            this.effectManager.destroy();
        }

        // 清理系统菜单
        if (this.systemMenuContainer) {
            this.systemMenuContainer.destroy();
            this.systemMenuContainer = undefined;
        }
    }
    

} 

