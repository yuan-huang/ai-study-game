/// <reference path="../../types/rex-ui.d.ts" />
import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { gardenApi, SubjectFlowerStatusResponse } from '@/api/gardenApi';
import { gameState } from '@/stores/gameState';
import { Dialog } from 'phaser3-rex-plugins/templates/ui/ui-components.js';



export class GardenScene extends BaseScene {
    private subjectFlowerStatus: SubjectFlowerStatusResponse | null = null;
    private currentUserId: string;
    private nectarInventory: { nectars: any[], totalNectars: number, totalTypes: number } | null = null;
    private floatingNectars: Phaser.GameObjects.Container[] = [];
    private isDragMode: boolean = false;
    

    constructor() {
        super('GardenScene');
        // 从gameState中获取userId
        this.currentUserId = gameState.userId;
    }

    preload(): void {
        super.preload();
        // 加载花园背景
        this.load.image('garden-bg', getAssetPath('garden'));
        
        // 加载花朵资源
        this.load.image('flower-chinese', getAssetPath('flower-chinese'));
        this.load.image('flower-math', getAssetPath('flower-math'));
        this.load.image('flower-english', getAssetPath('flower-english'));

        //添加背包
        this.load.image('backpack', getAssetPath('backpack'));

        // 加载甘露资源
        this.load.image('nectar', getAssetPath('nectar'));

        // 加载花园背景音乐
        this.load.audio('garden-bgm', getAssetPath('garden-bgm'));
        
    }

    create(): void {
        super.create();
        
        console.log('🌺 GardenScene 创建开始');
        console.log('🖼️ 相机尺寸:', this.cameras.main.width, 'x', this.cameras.main.height);
        
        // 播放花园背景音乐
        this.sound.play('garden-bgm', {
            loop: true,
            volume: 0.5
        });


        // 设置背景图片
        const background = this.add.image(0, 0, 'garden-bg').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setDepth(0);
        
        // 添加标题 - 使用统一字体配置
        this.createText(
            this.cameras.main.width / 2, 
            50, 
            '🌺 知识花园', 
            'TITLE_LARGE',
            {
                color: '#2d5016',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(100);

        console.log('🔧 开始创建花园UI元素');
        
        // 创建背包按钮
        console.log('📦 准备创建背包按钮');
        this.createPackButton();

        // 创建返回按钮
        console.log('🔙 准备创建返回按钮');
        this.createBackButton();
        
        // 加载花园数据
        this.loadGardenData().then(() => {
            this.placeSubjectFlowers();
        });

    }


    private createPackButton() {
        console.log('🎒 开始创建背包按钮');
        
        // 检查背包图片是否加载成功
        if (!this.textures.exists('backpack')) {
            console.error('❌ 背包图片资源未找到！');
            return;
        }
        
        // 背包仓库按钮
        const backpackButton = this.add.image(this.cameras.main.width - 200, 200, 'backpack');
        backpackButton.setOrigin(0.5, 0.5);
        backpackButton.setDepth(100);
        backpackButton.setScale(0.3);
        backpackButton.setInteractive({ useHandCursor: true });
        
        console.log('✅ 背包按钮创建成功，位置:', backpackButton.x, backpackButton.y);
        console.log('🔧 背包按钮可见性:', backpackButton.visible);
        console.log('🔧 背包按钮交互性:', backpackButton.input?.enabled);
        
        // 点击打开背包弹框
        backpackButton.on('pointerdown', () => {
            console.log('🖱️ 背包按钮被点击了！');
            this.tweens.add({
                targets: backpackButton,
                scaleX: 0.25,
                scaleY: 0.25,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    this.openBackpackDialog();
                }
            });
        });

        // 鼠标悬浮效果
        backpackButton.on('pointerover', () => {
            console.log('🖱️ 鼠标悬浮在背包按钮上');
            this.tweens.add({
                targets: backpackButton,
                scaleX: 0.35,
                scaleY: 0.35,
                duration: 150,
                ease: 'Power2'
            });
        });
        
        backpackButton.on('pointerout', () => {
            console.log('🖱️ 鼠标离开背包按钮');
            this.tweens.add({
                targets: backpackButton,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 150,
                ease: 'Power2'
            });
        });

        // 添加背包标签
        const backpackLabel = this.createText(
            this.cameras.main.width - 200, 
            240, 
            '🎒 背包', 
            'LABEL_TEXT',
            {
                fontSize: 16,
                color: '#2d5016',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0.5).setDepth(100);
    }

    

    private placeSubjectFlowers() {
        if (!this.subjectFlowerStatus) {
            console.warn('学科花朵状态数据未加载');
            return;
        }

        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        
        // 定义学科花朵的位置
        const flowerPositionMap : Record<string, {x: number, y: number}> = {
            "chinese": {
                x: width * 0.25,
                y: height * 0.65
            },
            "english": {
                x: width * 0.5,
                y: height * 0.65
            },
            "math": {
                x:  width * 0.75,
                y: height * 0.55
            }
        };

        // 遍历各学科数据，创建代表花朵
        this.subjectFlowerStatus.subjectFlowers.forEach((subjectData) => {
            const subject = subjectData.subject;
            const position = flowerPositionMap[subject];
            
            if (!position) {
                console.warn(`未定义学科 ${subject} 的显示位置`);
                return;
            }

            // 获取花朵图像的原始大小
            const flowerKey = `flower-${subject}`;
            const flowerTexture = this.textures.get(flowerKey);
            const originalWidth = flowerTexture.source[0].width;
            const originalHeight = flowerTexture.source[0].height;
            
            // 计算花朵显示大小（基于原始大小和体积比例）
            const minScale = 0.3; // 最小30%大小
            const maxScale = 1.2; // 最大120%大小
            const scale = Math.min(minScale + subjectData.花的体积比例 * (maxScale - minScale), maxScale);
            
            const flowerWidth = originalWidth * scale;
            const flowerHeight = originalHeight * scale;

            // 创建花容器 - 以花朵为中心的容器
            const flowerMainContainer = this.add.container(position.x, position.y);

            // 1. 创建血条容器（相对于花朵位置，与花朵宽度一致）
            const hpContainer = this.createHPContainer(subjectData.花的血量HP.HP百分比, flowerWidth, flowerHeight);

            // 3. 创建学科名称容器（相对于花朵位置）
            const nameContainer = this.createSubjectNameContainer(subject, flowerHeight);

            // 2. 创建花朵精灵（中心位置，传入血条和名称容器用于控制显示）
            const flowerSprite = this.createFlowerSprite(subject, flowerWidth, flowerHeight, subjectData, hpContainer, nameContainer);

            // 将所有元素添加到花容器，以花朵为中心
            flowerMainContainer.add([hpContainer, flowerSprite, nameContainer]);

            console.log(`已创建学科花朵: ${subject}, 闯关进度: ${subjectData.已闯关分类数}/${subjectData.总分类数} (${subjectData.闯关完成度}%), HP: ${subjectData.花的血量HP.HP百分比}%`);
        });

    }

    /**
     * 创建血条容器
     */
    private createHPContainer(hpPercentage: number, flowerWidth: number, flowerHeight: number): Phaser.GameObjects.Container {
        // 基于花朵高度计算血条位置，确保在花朵上方
        const hpYPosition = -(flowerHeight / 2) - 30; // 花朵顶部上方30像素
        const hpContainer = this.add.container(0, hpYPosition);

        // 血条宽度与花朵宽度一致，但稍微小一点
        const hpBarWidth = flowerWidth * 0.8;

        // HP文字显示 - 使用统一字体配置
        const hpText = this.createText(
            0, -10,
            `HP: ${hpPercentage}%`,
            'NUMBER_TEXT',
            {
                fontSize: 32,
                color: this.getHPTextColor(hpPercentage),
                backgroundColor: 'rgba(196, 194, 194, 0.9)',
                padding: { x: 6, y: 2 },
                stroke: '#ffffff',
                strokeThickness: 1
            }
        ).setOrigin(0.5).setAlpha(0.8);

        // HP条背景
        const hpBarBg = this.add.rectangle(
            0, 10,
            hpBarWidth, 8, 0x2c2c2c, 0.8
        );
        
        // HP条填充
        const hpBarFill = this.add.rectangle(
            -(hpBarWidth / 2) + (hpBarWidth * hpPercentage / 100) / 2, 10,
            hpBarWidth * hpPercentage / 100, 8, 
            this.getHPBarColor(hpPercentage), 1
        );

        // 添加HP容器交互效果
        const hpInteractArea = this.add.circle(0, 0, 40, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        hpInteractArea.on('pointerover', () => {
            this.tweens.add({
                targets: [hpText, hpBarBg, hpBarFill],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        hpInteractArea.on('pointerout', () => {
            this.tweens.add({
                targets: [hpText, hpBarBg, hpBarFill],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        hpContainer.add([hpInteractArea, hpText, hpBarBg, hpBarFill]);
        
        // 默认隐藏血条容器
        hpContainer.setAlpha(0);
        
        return hpContainer;
    }

    /**
     * 创建花朵精灵（包含交互效果）
     */
    private createFlowerSprite(subject: string, flowerWidth: number, flowerHeight: number, subjectData: any, hpContainer: Phaser.GameObjects.Container, nameContainer: Phaser.GameObjects.Container): Phaser.GameObjects.Container {
        const flowerContainer = this.add.container(0, 0);

        // 创建花朵精灵
        const flowerKey = `flower-${subject}`;
        const flowerSprite = this.add.image(0, 0, flowerKey)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(flowerWidth, flowerHeight);

        // 创建交互区域（基于花朵大小）
        const interactRadius = Math.max(flowerWidth, flowerHeight) / 2 + 10;
        const interactArea = this.add.circle(0, 0, interactRadius, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        // 添加hover效果
        interactArea.on('pointerover', () => {
            // 花朵放大效果
            this.tweens.add({
                targets: flowerSprite,
                displayWidth: flowerWidth * 1.1,
                displayHeight: flowerHeight * 1.1,
                duration: 200,
                ease: 'Power2'
            });

            // 显示血条和名称
            this.tweens.add({
                targets: [hpContainer, nameContainer],
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });

            // 添加光晕效果
            const glow = this.add.circle(0, 0, 60, 0xffff00, 0.3)
                .setAlpha(0);
            flowerContainer.add(glow);
            
            this.tweens.add({
                targets: glow,
                alpha: 0.3,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 300,
                ease: 'Power2'
            });

            flowerContainer.setData('glow', glow);
        });

        interactArea.on('pointerout', () => {
            // 恢复原始大小
            this.tweens.add({
                targets: flowerSprite,
                displayWidth: flowerWidth,
                displayHeight: flowerHeight,
                duration: 200,
                ease: 'Power2'
            });

            // 隐藏血条和名称
            this.tweens.add({
                targets: [hpContainer, nameContainer],
                alpha: 0,
                duration: 200,
                ease: 'Power2'
            });

            // 移除光晕效果
            const glow = flowerContainer.getData('glow');
            if (glow) {
                this.tweens.add({
                    targets: glow,
                    alpha: 0,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        glow.destroy();
                    }
                });
            }
        });

        // 添加点击效果和详情显示
        interactArea.on('pointerdown', () => {
            // 点击缩放效果
            this.tweens.add({
                targets: flowerSprite,
                displayWidth: flowerWidth * 0.95,
                displayHeight: flowerHeight * 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    this.showSubjectDetails(subjectData);
                }
            });
        });

        flowerContainer.add([flowerSprite, interactArea]);
        
        // 添加花朵摆动动画
        this.addFlowerSwayAnimation(flowerSprite);
        
        return flowerContainer;
    }

    /**
     * 添加花朵摆动动画
     */
    private addFlowerSwayAnimation(flowerSprite: Phaser.GameObjects.Image): void {
        // 左右摆动动画
        this.tweens.add({
            targets: flowerSprite,
            x: flowerSprite.x + 8, // 向右摆动8像素
            duration: 2000 + Math.random() * 1000, // 2-3秒随机时长
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // 无限循环
            delay: Math.random() * 2000 // 随机延迟0-2秒开始
        });

        // 上下摆动动画（稍微小一点的幅度）
        this.tweens.add({
            targets: flowerSprite,
            y: flowerSprite.y - 5, // 向上摆动5像素
            duration: 1500 + Math.random() * 800, // 1.5-2.3秒随机时长
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // 无限循环
            delay: Math.random() * 1500 // 随机延迟0-1.5秒开始
        });

        // 轻微的旋转摆动（让花朵看起来更自然）
        this.tweens.add({
            targets: flowerSprite,
            rotation: 0.05, // 轻微旋转约3度
            duration: 2500 + Math.random() * 1500, // 2.5-4秒随机时长
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // 无限循环
            delay: Math.random() * 3000 // 随机延迟0-3秒开始
        });
    }

    /**
     * 创建学科名称容器
     */
    private createSubjectNameContainer(subject: string, flowerHeight: number): Phaser.GameObjects.Container {
        // 基于花朵高度计算名称位置，确保在花朵下方
        const nameYPosition = (flowerHeight / 2) + 40; // 花朵底部下方40像素
        const nameContainer = this.add.container(0, nameYPosition);

        // 学科名称映射
        const subjectNameMap: Record<string, string> = {
            'chinese': '语文',
            'math': '数学',
            'english': '英语'
        };
        
        const subjectText = this.createText(
            0, 0,
            subjectNameMap[subject] || subject,
            'TITLE_MEDIUM',
            {
                fontSize: 32,
                color: '#2d5016',
                padding: { x: 10, y: 5 },
                stroke: '#ffffff',
                strokeThickness: 2
            }
        ).setOrigin(0.5,0.5).setAlpha(0.8);
        
        // 设置背景浅绿色
        subjectText.setBackgroundColor('#e6ffe6');

        // 添加名称容器交互效果
        const nameInteractArea = this.add.circle(0, 0, 60, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        nameInteractArea.on('pointerover', () => {
            this.tweens.add({
                targets: subjectText,
                scaleX: 1.05,
                scaleY: 1.05,
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        nameInteractArea.on('pointerout', () => {
            this.tweens.add({
                targets: subjectText,
                scaleX: 1,
                scaleY: 1,
                alpha: 0.8,
                duration: 200,
                ease: 'Power2'
            });
        });

        nameContainer.add([nameInteractArea, subjectText]);
        
        // 默认隐藏名称容器
        nameContainer.setAlpha(0);
        
        return nameContainer;
    }

    /**
     * 获取HP条颜色
     */
    private getHPBarColor(hpPercentage: number): number {
        if (hpPercentage >= 70) return 0xff6b6b; // 浅红色
        if (hpPercentage >= 40) return 0xff4757; // 中红色
        return 0xff3838; // 深红色
    }

    /**
     * 显示学科详细信息 - 优化弹窗交互
     */
    private showSubjectDetails(subjectData: any): void {
        // 创建背景遮罩 - 独立创建，覆盖整个屏幕
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setInteractive();
        
        // 创建弹窗容器
        const modalContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        
        // 创建弹窗背景 - 增加高度以适应更大的字体
        const modalBg = this.add.rectangle(0, 0, 500, 700, 0xffffff, 1)
            .setStrokeStyle(3, 0x4caf50);
        
        // 添加阴影效果
        const shadow = this.add.rectangle(5, 5, 500, 700, 0x000000, 0.3);
        
        modalContainer.add([shadow, modalBg]);

        // 创建标题
        const subjectNameMap: Record<string, string> = {
            'chinese': '语文',
            'math': '数学',
            'english': '英语'
        };
        
        const title = this.createText(0, -320, `📊 ${subjectNameMap[subjectData.subject] || subjectData.subject} 详情`, 'TITLE_MEDIUM', {
            color: '#2d5016'
        }).setOrigin(0.5);
        
        modalContainer.add(title);

        // 创建详情内容区域
        const contentY = -240;
        let currentY = contentY;

        // 进度信息
        const progressText = this.createText(0, currentY, 
            `🎯 闯关进度: ${subjectData.已闯关分类数}/${subjectData.总分类数} (${subjectData.闯关完成度}%)`, 'BODY_TEXT', {
            fontSize: 28,
            color: '#333333'
        }).setOrigin(0.5);
        modalContainer.add(progressText);
        currentY += 50;

        // 等级信息
        const levelText = this.createText(0, currentY,
            `⭐ 花朵等级: ${subjectData.当前等级}/${subjectData.总等级}`, 'BODY_TEXT', {
            fontSize: 28,
            color: '#333333'
        }).setOrigin(0.5);
        modalContainer.add(levelText);
        currentY += 50;

        // HP信息
        const hpText = this.createText(0, currentY,
            `❤️ 总HP: ${subjectData.花的血量HP.当前花总的HP}/${subjectData.花的血量HP.最大花总的HP} (${subjectData.花的血量HP.HP百分比}%)`, 'NUMBER_TEXT', {
            fontSize: 28,
            color: this.getHPTextColor(subjectData.花的血量HP.HP百分比)
        }).setOrigin(0.5);
        modalContainer.add(hpText);
        currentY += 60;

        // 已闯关分类
        if (subjectData.已闯关.length > 0) {
            const completedTitle = this.createText(0, currentY, '✅ 已闯关分类:', 'TITLE_SMALL', {
                fontSize: 28,
                color: '#4caf50'
            }).setOrigin(0.5);
            modalContainer.add(completedTitle);
            currentY += 45;

            subjectData.已闯关.forEach((category: any) => {
                const categoryText = this.createText(0, currentY,
                    `• ${category.分类}: ${category.闯关次数}次`, 'BODY_TEXT', {
                    fontSize: 24,
                    color: '#666666'
                }).setOrigin(0.5);
                modalContainer.add(categoryText);
                currentY += 40;
            });
            currentY += 30;
        }

        // 待闯关分类
        if (subjectData.待闯关.length > 0) {
            const pendingTitle = this.createText(0, currentY, '⏳ 待闯关分类:', 'TITLE_SMALL', {
                fontSize: 28,
                color: '#ff9800'
            }).setOrigin(0.5);
            modalContainer.add(pendingTitle);
            currentY += 45;

            // 限制显示的待闯关分类数量，最多显示3个
            const maxDisplayCount = 3;
            const pendingCategories = subjectData.待闯关.slice(0, maxDisplayCount);
            
            pendingCategories.forEach((category: any) => {
                const categoryText = this.createText(0, currentY,
                    `• ${category.分类}: ${category.问题数}题`, 'BODY_TEXT', {
                    fontSize: 24,
                    color: '#666666'
                }).setOrigin(0.5);
                modalContainer.add(categoryText);
                currentY += 40;
            });

            // 如果有更多的分类被隐藏，显示省略提示
            if (subjectData.待闯关.length > maxDisplayCount) {
                const moreText = this.createText(0, currentY,
                    `... 还有 ${subjectData.待闯关.length - maxDisplayCount} 个分类`, 'LABEL_TEXT', {
                    fontSize: 24,
                    color: '#999999'
                }).setOrigin(0.5);
                modalContainer.add(moreText);
                currentY += 40;
            }
        }

        // 创建关闭按钮 - 调整位置和大小
        const closeButton = this.add.rectangle(0, 320, 150, 50, 0xf44336, 1)
            .setStrokeStyle(2, 0xd32f2f)
            .setInteractive({ useHandCursor: true });
        
        const closeText = this.createText(0, 320, '✖️ 关闭', 'BUTTON_TEXT', {
            fontSize: 28,
            color: '#ffffff'
        }).setOrigin(0.5);

        modalContainer.add([closeButton, closeText]);

        // 添加按钮hover效果
        closeButton.on('pointerover', () => {
            this.tweens.add({
                targets: closeButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        closeButton.on('pointerout', () => {
            this.tweens.add({
                targets: closeButton,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power2'
            });
        });

        // 关闭按钮点击事件
        const closeModal = () => {
            this.tweens.add({
                targets: modalContainer,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    overlay.destroy();
                    modalContainer.destroy();
                }
            });
        };

        closeButton.on('pointerdown', closeModal);
        overlay.on('pointerdown', closeModal);

        // 设置深度并添加到场景
        overlay.setDepth(1000);
        modalContainer.setDepth(1001);

        // 弹窗出现动画
        modalContainer.setScale(0);
        modalContainer.setAlpha(0);
        
        this.tweens.add({
            targets: modalContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 根据HP百分比获取文本颜色
     */
    private getHPTextColor(hpPercentage: number): string {
        if (hpPercentage >= 70) return '#ff6b6b'; // 浅红色
        if (hpPercentage >= 40) return '#ff4757'; // 中红色
        return '#ff3838'; // 深红色
    }


    
    /**
     * 创建返回按钮 - 优化交互效果
     */
    private createBackButton(): void {
        const backButton = this.add.rectangle(
            80, 30, 120, 40, 0x4caf50, 1
        ).setStrokeStyle(2, 0x388e3c);
        
        const backText = this.createText(80, 30, '🏠 返回', 'BUTTON_TEXT', {
            fontSize: 18,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backButton.setInteractive({ useHandCursor: true });
        
        // 添加hover效果
        backButton.on('pointerover', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        backButton.on('pointerout', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power2'
            });
        });

        // 点击效果
        backButton.on('pointerdown', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    this.scene.start('MainScene');
                }
            });
        });
        
        backButton.setDepth(100);
        backText.setDepth(101);
    }

    
    /**
     * 加载学科花朵状态数据
     */
    private async loadGardenData(): Promise<void> {
        try {
            // 并行加载花朵状态和甘露库存
            const [subjectStatusResponse, nectarResponse] = await Promise.all([
                gardenApi.getSubjectFlowerStatus(this.currentUserId),
                gardenApi.getNectarInventory(this.currentUserId)
            ]);

            if (subjectStatusResponse.success && subjectStatusResponse.data) {
                this.subjectFlowerStatus = subjectStatusResponse.data;
                console.log('学科花朵状态数据', this.subjectFlowerStatus);
            } else {
                console.error('加载学科花朵状态失败:', subjectStatusResponse.message);
                this.showMessage('加载学科花朵状态失败');
            }

            if (nectarResponse.success && nectarResponse.data) {
                this.nectarInventory = nectarResponse.data;
                console.log('甘露库存数据', this.nectarInventory);
            } else {
                console.error('加载甘露库存失败:', nectarResponse.message);
                this.showMessage('加载甘露库存失败');
            }

        } catch (error) {
            console.error('加载花园数据失败:', error);
            this.showMessage('连接服务器失败');
        }
    }
    

    
    /**
     * 显示消息
     */
    private showMessage(text: string): void {
        const message = this.createText(
            this.cameras.main.width / 2,
            100,
            text,
            'UI_TEXT',
            {
                fontSize: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(1000);
        
        // 淡出动画
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                message.destroy();
            }
        });
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }
    

    /**
     * 刷新甘露库存
     */
    private async refreshNectarInventory(): Promise<void> {
        try {
            const response = await gardenApi.getNectarInventory(this.currentUserId);
            if (response.success && response.data) {
                this.nectarInventory = response.data;
                // 更新甘露显示
                console.log('甘露库存已刷新:', this.nectarInventory);
            }
        } catch (error) {
            console.error('刷新甘露库存失败:', error);
        }
    }

    /**
     * 获取学科中文名称
     */
    private getSubjectName(subject: string): string {
        const nameMap: Record<string, string> = {
            'chinese': '语文',
            'math': '数学',
            'english': '英语',
            'technology': '科技',
            'marine': '海洋'
        };
        return nameMap[subject] || subject;
    }


    /**
     * 显示甘露详情弹框 - 使用简化实现
     */
    private showNectarDetailDialog(nectar: any): void {
        // 创建遮罩
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.5
        ).setInteractive().setDepth(2002);

        // 使用 rex-ui Sizer 创建详情弹框
        const detailSizer = this.rexUI.add.sizer({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            orientation: 'vertical',
            width: 450,
            height: 350,
            space: { 
                left: 25, right: 25, top: 20, bottom: 20,
                item: 15 
            }
        });

        // 添加背景
        const background = this.rexUI.add.roundRectangle(0, 0, 450, 350, 15, 0xffffff)
            .setStrokeStyle(3, 0x4caf50);
        detailSizer.addBackground(background);

        // 添加标题
        const title = this.createNectarDetailTitle(nectar);
        detailSizer.add(title, { expand: false });

        // 添加内容
        const content = this.createNectarDetailContent(nectar);
        detailSizer.add(content, { expand: true });

        // 添加按钮区域
        const buttonArea = this.createNectarDetailButtons(nectar, overlay, detailSizer);
        detailSizer.add(buttonArea, { expand: false });

        // 设置深度
        detailSizer.setDepth(2003);

        // 弹框进入动画
        detailSizer.setScale(0.5).setAlpha(0);
        overlay.setAlpha(0);
        
        this.tweens.add({
            targets: overlay,
            alpha: 0.5,
            duration: 200
        });
        
        this.tweens.add({
            targets: detailSizer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });

        // 点击遮罩关闭
        overlay.on('pointerdown', () => {
            this.closeNectarDetailDialog(overlay, detailSizer);
        });

        detailSizer.layout();
    }

    /**
     * 创建甘露详情按钮区域
     */
    private createNectarDetailButtons(nectar: any, overlay: any, dialog: any): Phaser.GameObjects.GameObject {
        const buttonContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 20 }
        });

        // 使用按钮
        const useButton = this.createDetailUseButton(nectar, overlay, dialog);
        buttonContainer.add(useButton, { expand: false });

        // 取消按钮
        const cancelButton = this.createDetailCancelButton(overlay, dialog);
        buttonContainer.add(cancelButton, { expand: false });

        return buttonContainer;
    }

    /**
     * 创建使用按钮
     */
    private createDetailUseButton(nectar: any, overlay: any, dialog: any): Phaser.GameObjects.GameObject {
        const useContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 8 }
        });

        const useButton = this.rexUI.add.roundRectangle(0, 0, 100, 40, 8, 0x4caf50)
            .setStrokeStyle(2, 0x388e3c)
            .setInteractive({ useHandCursor: true });

        const useText = this.createText(0, 0, '✨ 使用', 'BUTTON_TEXT', {
            fontSize: 16,
            color: '#ffffff',
            fontStyle: 'bold'
        });

        useContainer.add(useButton, { expand: true });
        useContainer.add(useText, { expand: false, align: 'center' });

        // 悬浮效果
        useButton.on('pointerover', () => {
            this.tweens.add({
                targets: useContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150
            });
        });

        useButton.on('pointerout', () => {
            this.tweens.add({
                targets: useContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        // 点击使用
        useButton.on('pointerdown', () => {
            this.useNectar(nectar);
            this.closeNectarDetailDialog(overlay, dialog);
        });

        return useContainer;
    }

    /**
     * 创建取消按钮
     */
    private createDetailCancelButton(overlay: any, dialog: any): Phaser.GameObjects.GameObject {
        const cancelContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 8 }
        });

        const cancelButton = this.rexUI.add.roundRectangle(0, 0, 100, 40, 8, 0xf44336)
            .setStrokeStyle(2, 0xd32f2f)
            .setInteractive({ useHandCursor: true });

        const cancelText = this.createText(0, 0, '❌ 取消', 'BUTTON_TEXT', {
            fontSize: 16,
            color: '#ffffff',
            fontStyle: 'bold'
        });

        cancelContainer.add(cancelButton, { expand: true });
        cancelContainer.add(cancelText, { expand: false, align: 'center' });

        // 悬浮效果
        cancelButton.on('pointerover', () => {
            this.tweens.add({
                targets: cancelContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150
            });
        });

        cancelButton.on('pointerout', () => {
            this.tweens.add({
                targets: cancelContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        // 点击取消
        cancelButton.on('pointerdown', () => {
            this.closeNectarDetailDialog(overlay, dialog);
        });

        return cancelContainer;
    }

    /**
     * 关闭甘露详情弹框
     */
    private closeNectarDetailDialog(overlay: any, dialog: any): void {
        this.tweens.add({
            targets: dialog,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                overlay.destroy();
                dialog.destroy();
            }
        });
    }

    /**
     * 创建甘露详情标题
     */
    private createNectarDetailTitle(nectar: any): Phaser.GameObjects.GameObject {
        const titleContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 }
        });

        // 学科图标
        const subjectColors: Record<string, number> = {
            'chinese': 0xff6b6b,
            'math': 0x4ecdc4,
            'english': 0x45b7d1,
            'technology': 0x9b59b6,
            'marine': 0x26de81
        };
        const iconColor = subjectColors[nectar.subject] || 0xcccccc;
        
        const icon = this.add.circle(0, 0, 18, iconColor, 1);
        
        // 标题文字
        const titleText = this.createText(0, 0, `${this.getSubjectName(nectar.subject)}甘露详情`, 'TITLE_MEDIUM', {
            fontSize: 22,
            color: '#2d5016',
            fontStyle: 'bold'
        });

        titleContainer.add(icon, { expand: false });
        titleContainer.add(titleText, { expand: false });

        return titleContainer;
    }



    /**
     * 创建甘露详情内容
     */
    private createNectarDetailContent(nectar: any): Phaser.GameObjects.GameObject {
        return this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10 }
        })
        .add(this.createText(0, 0, `学科: ${this.getSubjectName(nectar.subject)}`, 'BODY_TEXT', {
            fontSize: 18,
            color: '#333333'
        }))
        .add(this.createText(0, 0, `年级: ${nectar.grade}年级`, 'BODY_TEXT', {
            fontSize: 18,
            color: '#333333'
        }))
        .add(this.createText(0, 0, `分类: ${nectar.category}`, 'BODY_TEXT', {
            fontSize: 18,
            color: '#333333'
        }))
        .add(this.createText(0, 0, `治疗力: ${nectar.healingPower}`, 'NUMBER_TEXT', {
            fontSize: 18,
            color: '#ff6b6b'
        }))
        .add(this.createText(0, 0, `数量: ${nectar.count}`, 'NUMBER_TEXT', {
            fontSize: 18,
            color: '#4caf50'
        }));
    }



    /**
     * 使用甘露
     */
    private async useNectar(nectar: any): Promise<void> {
        try {
            // 这里可以添加使用甘露的API调用
            console.log('使用甘露:', nectar);
            
            // 显示使用效果
            this.showMessage(`使用了${this.getSubjectName(nectar.subject)}甘露，恢复${nectar.healingPower}点HP！`);
            
            // 刷新甘露库存
            await this.refreshNectarInventory();
            
        } catch (error) {
            console.error('使用甘露失败:', error);
            this.showMessage('使用甘露失败');
        }
    }


/**
 * 打开背包弹框 - 完整实现
 */
private openBackpackDialog(): void {
    console.log('🎒 打开背包弹框');
    
    // 创建背景遮罩
    const overlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
    ).setInteractive().setDepth(1000);

    // 创建背包主容器
    const backpackContainer = this.add.container(
        this.cameras.main.width / 2, 
        this.cameras.main.height / 2
    ).setDepth(1001);

    const bpWidth = 1200;
    const bpHeight = 650;
    // 背包背景
    const backpackBg = this.add.rectangle(0, 0, bpWidth, bpHeight, 0xffffff, 1)
        .setStrokeStyle(4, 0x8B4513); // 棕色边框，像真实背包
    //设置圆角
    backpackBg.setRounded(20);

    // 背包阴影
    const shadow = this.add.rectangle(8, 8, bpWidth, bpHeight, 0x000000, 0.3);

    backpackContainer.add([shadow, backpackBg]);

    // 创建背包标题
    this.createBackpackHeader(backpackContainer,bpWidth,bpHeight);

    // 创建统计信息
    // this.createBackpackStats(backpackContainer,bpWidth,bpHeight);

    // 创建仓库格子区域
    this.createInventoryGrid(backpackContainer,bpWidth,bpHeight);

    // 创建操作按钮
    this.createBackpackButtons(backpackContainer, overlay,bpWidth,bpHeight);

    // 添加进入动画
    this.animateBackpackOpen(backpackContainer, overlay);
}

/**
 * 创建背包标题,做成一个容器,里面包含背包图标,标题文字,关闭按钮
 */
private createBackpackHeader(container: Phaser.GameObjects.Container, bpWidth: number, bpHeight: number): void {
    const headerContainer = this.rexUI.add.sizer({
        orientation: 'horizontal',
        space: { item: 10 }
    });
    const headerHeight = Math.max(60, bpHeight * 0.1); // 标题高度为弹框高度的10%，最小60px
    const headerY = -(bpHeight / 2) + (headerHeight / 2); // 顶部对齐
    const iconSize = Math.min(40, headerHeight * 0.6); // 图标大小自适应
    const fontSize = 32; // 字体大小根据宽度自适应
    const closeBtnSize = Math.min(25, headerHeight * 0.4); // 关闭按钮大小自适应

    // 标题背景
    // 设置圆角
    const headerBg = this.add.rectangle(0, headerY, bpWidth , headerHeight, 0xF5DEB3, 1)
        .setStrokeStyle(2, 0x8B4513)
        .setRounded(20);

    // 背包图标
    const iconX = -(bpWidth / 2) + (bpWidth * 0.08); // 左侧8%位置
    const backpackIcon = this.add.text(iconX, headerY, '🎒', {
        fontSize: `${iconSize}px`
    }).setOrigin(0, 0.5);

    // 标题文字
    const titleX = iconX + (bpWidth * 0.05); // 图标右侧5%位置
    const titleText = this.createText(titleX, headerY, '甘露仓库', 'TITLE_LARGE', {
        fontSize: fontSize,
        color: '#8B4513',
        fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 关闭按钮
    const closeBtnX = bpWidth/2 - 100; // 靠右边
    const closeBtn = this.add.circle(closeBtnX, headerY, closeBtnSize, 0xff4757, 1)
        .setStrokeStyle(2, 0xd32f2f)
        .setInteractive({ useHandCursor: true });

    const closeText = this.add.text(closeBtnX, headerY, '✖', {
        fontSize: `${closeBtnSize * 0.8}px`,
        color: '#ffffff'
    }).setOrigin(0.5);

    // 关闭按钮事件
    closeBtn.on('pointerdown', () => {
        this.animateBackpackClose(container);
    });

    closeBtn.on('pointerover', () => {
        this.tweens.add({
            targets: [closeBtn, closeText],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150
        });
    });

    closeBtn.on('pointerout', () => {
        this.tweens.add({
            targets: [closeBtn, closeText],
            scaleX: 1,
            scaleY: 1,
            duration: 150
        });
    });
    headerContainer.add([headerBg, backpackIcon, titleText, closeBtn, closeText]);
    container.add([headerContainer]);
}

/**
 * 创建背包统计信息
 */
private createBackpackStats(container: Phaser.GameObjects.Container, bpWidth: number, bpHeight: number): void {
    const headerHeight = Math.max(60, bpHeight * 0.1);
    const statsHeight = Math.max(40, bpHeight * 0.08); // 统计区域高度为弹框高度的8%，最小40px
    const statsY = -(bpHeight / 2) + headerHeight + (statsHeight / 2) + 10; // 紧贴标题下方
    const fontSize = Math.min(18, bpWidth * 0.015); // 字体大小根据宽度自适应
    
    // 统计背景
    const statsBg = this.add.rectangle(0, statsY, bpWidth * 0.9, statsHeight, 0xE6F3FF, 1)
        .setStrokeStyle(1, 0x4A90E2);

    // 统计文字
    let statsText = '📦 背包空空如也';
    if (this.nectarInventory && this.nectarInventory.nectars.length > 0) {
        // 根据弹框宽度调整文字内容
        if (bpWidth >= 1000) {
            statsText = `📊 甘露总数: ${this.nectarInventory.totalNectars} | 🎯 种类: ${this.nectarInventory.totalTypes} | 📦 格子: ${this.nectarInventory.nectars.length}/20`;
        } else {
            statsText = `📊 总数: ${this.nectarInventory.totalNectars} | 🎯 种类: ${this.nectarInventory.totalTypes} | 📦 ${this.nectarInventory.nectars.length}/20`;
        }
    }

    const statsTextObj = this.createText(0, statsY, statsText, 'BODY_TEXT', {
        fontSize: fontSize,
        color: '#2E5984',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([statsBg, statsTextObj]);
}

/**
 * 创建仓库格子网格
 */
private createInventoryGrid(container: Phaser.GameObjects.Container, bpWidth: number, bpHeight: number): void {
    const headerHeight = Math.max(60, bpHeight * 0.1);
    const statsHeight = Math.max(40, bpHeight * 0.08);
    const buttonHeight = Math.max(50, bpHeight * 0.1);
    
    // 计算网格可用区域
    const gridAreaHeight = bpHeight - headerHeight - statsHeight - buttonHeight - 60; // 减去间距
    const gridAreaWidth = bpWidth * 0.9; // 网格宽度为弹框宽度的90%
    
    // 根据可用区域计算最佳网格布局
    const cols = Math.max(4, Math.min(6, Math.floor(bpWidth / 150))); // 根据宽度调整列数，4-6列
    const rows = Math.max(3, Math.min(5, Math.floor(gridAreaHeight / 120))); // 根据高度调整行数，3-5行
    const totalSlots = cols * rows;
    
    // 计算最佳格子大小和间距
    const maxSlotSize = Math.min(100, (gridAreaWidth - (cols + 1) * 10) / cols); // 最大格子尺寸
    const slotSize = Math.max(60, maxSlotSize); // 最小60px
    const spacing = Math.max(5, (gridAreaWidth - cols * slotSize) / (cols + 1)); // 自适应间距
    
    // 网格位置计算
    const gridY = -(bpHeight / 2) + headerHeight + statsHeight + 30; // 统计区域下方30px
    const gridCenterY = gridY + (gridAreaHeight / 2);
    
    // 计算网格实际大小
    const actualGridWidth = cols * slotSize + (cols - 1) * spacing;
    const actualGridHeight = rows * slotSize + (rows - 1) * spacing;
    
    // 网格背景
    const gridBg = this.add.rectangle(0, gridCenterY, actualGridWidth + 40, actualGridHeight + 40, 0xFAFAFA, 1)
        .setStrokeStyle(2, 0xDDDDDD);
    container.add(gridBg);

    // 计算起始位置（居中对齐）
    const gridStartX = -(actualGridWidth / 2) + (slotSize / 2);
    const gridStartY = gridCenterY - (actualGridHeight / 2) + (slotSize / 2);

    // 创建格子
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const slotIndex = row * cols + col;
            const x = gridStartX + col * (slotSize + spacing);
            const y = gridStartY + row * (slotSize + spacing);

            // 创建格子
            const slot = this.createInventorySlot(x, y, slotSize, slotIndex);
            container.add(slot);

            // 如果有甘露数据，放置甘露
            if (this.nectarInventory && 
                this.nectarInventory.nectars && 
                slotIndex < this.nectarInventory.nectars.length) {
                const nectar = this.nectarInventory.nectars[slotIndex];
                const nectarItem = this.createNectarItem(x, y, nectar, slotSize);
                container.add(nectarItem);
            }
        }
    }

    // 添加网格信息到容器数据中，供其他方法使用
    container.setData('gridInfo', {
        cols, rows, totalSlots, slotSize, spacing,
        gridStartX, gridStartY, gridCenterY
    });
}

/**
 * 创建单个仓库格子
 */
private createInventorySlot(x: number, y: number, size: number, index: number): Phaser.GameObjects.Container {
    const slotContainer = this.add.container(x, y);

    // 格子背景
    const slotBg = this.add.rectangle(0, 0, size, size, 0xF8F8F8, 1)
        .setStrokeStyle(2, 0xBBBBBB);

    // 格子编号（小字）
    const slotNumber = this.add.text(-35, -35, (index + 1).toString(), {
        fontSize: '12px',
        color: '#999999'
    });

    // 格子装饰线条（模拟缝线效果）
    const decorLine1 = this.add.line(0, 0, -30, -30, 30, 30, 0xDDDDDD, 1).setLineWidth(1);
    const decorLine2 = this.add.line(0, 0, 30, -30, -30, 30, 0xDDDDDD, 1).setLineWidth(1);

    slotContainer.add([slotBg, slotNumber, decorLine1, decorLine2]);

    return slotContainer;
}

/**
 * 创建甘露物品
 */
private createNectarItem(x: number, y: number, nectar: any, slotSize: number): Phaser.GameObjects.Container {
    const itemContainer = this.add.container(x, y);

    // 学科颜色映射
    const subjectColors: Record<string, number> = {
        'chinese': 0xFF6B6B,
        'math': 0x4ECDC4,
        'english': 0x45B7D1,
        'technology': 0x9B59B6,
        'marine': 0x26DE81
    };
    const itemColor = subjectColors[nectar.subject] || 0xCCCCCC;

    // 根据格子大小自适应元素尺寸
    const itemSize = slotSize - 10;
    const iconRadius = Math.max(8, slotSize * 0.15); // 图标半径自适应
    const countRadius = Math.max(8, slotSize * 0.12); // 数量标签半径自适应
    const subjectFontSize = Math.max(10, slotSize * 0.12); // 学科名称字体大小自适应
    const countFontSize = Math.max(8, slotSize * 0.1); // 数量字体大小自适应
    const healingFontSize = Math.max(8, slotSize * 0.1); // 治疗力字体大小自适应

    // 甘露容器背景
    const itemBg = this.add.rectangle(0, 0, itemSize, itemSize, itemColor, 0.8)
        .setStrokeStyle(2, itemColor);

    // 甘露图标
    const iconY = -(itemSize * 0.15); // 图标位置自适应
    const nectarIcon = this.add.circle(0, iconY, iconRadius, itemColor, 1);

    // 学科名称
    const subjectY = itemSize * 0.1; // 学科名称位置自适应
    const subjectText = this.createText(0, subjectY, 
        this.getSubjectNameShort(nectar.subject), 'LABEL_TEXT', {
        fontSize: subjectFontSize,
        color: '#FFFFFF',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // 数量标签 - 位置自适应
    const countX = itemSize * 0.35;
    const countY = -(itemSize * 0.35);
    const countBg = this.add.circle(countX, countY, countRadius, 0xFF4757, 1);
    const countText = this.add.text(countX, countY, nectar.count.toString(), {
        fontSize: `${countFontSize}px`,
        color: '#FFFFFF',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // 治疗力显示 - 位置自适应
    const healingY = itemSize * 0.35;
    const healingText = this.add.text(0, healingY, `💖${nectar.healingPower}`, {
        fontSize: `${healingFontSize}px`,
        color: '#FF4757'
    }).setOrigin(0.5);

    itemContainer.add([itemBg, nectarIcon, subjectText, countBg, countText, healingText]);

    // 添加交互效果
    itemBg.setInteractive({ useHandCursor: true });

    // 悬浮效果
    itemBg.on('pointerover', () => {
        this.tweens.add({
            targets: itemContainer,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            ease: 'Power2'
        });
        
        // 显示详细信息提示
        this.showNectarTooltip(nectar, x, y);
    });

    itemBg.on('pointerout', () => {
        this.tweens.add({
            targets: itemContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
        });
        
        // 隐藏提示
        this.hideNectarTooltip();
    });

    // 点击效果
    itemBg.on('pointerdown', () => {
        this.tweens.add({
            targets: itemContainer,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.showNectarDetailDialog(nectar);
            }
        });
    });

    return itemContainer;
}

/**
 * 获取学科简称
 */
private getSubjectNameShort(subject: string): string {
    const nameMap: Record<string, string> = {
        'chinese': '语文',
        'math': '数学',
        'english': '英语',
        'technology': '科技',
        'marine': '海洋'
    };
    return nameMap[subject] || subject;
}

/**
 * 显示甘露提示信息
 */
private showNectarTooltip(nectar: any, x: number, y: number): void {
    // 如果已有提示框，先移除
    this.hideNectarTooltip();

    const tooltipContainer = this.add.container(
        this.cameras.main.width / 2 + x + 100, 
        this.cameras.main.height / 2 + y
    ).setDepth(1500);

    // 提示框背景
    const tooltipBg = this.add.rectangle(0, 0, 200, 120, 0x2C3E50, 0.95)
        .setStrokeStyle(2, 0x34495E);

    // 提示文字
    const tooltipText = this.createText(0, 0, 
        `${this.getSubjectName(nectar.subject)}甘露\n` +
        `年级: ${nectar.grade}\n` +
        `分类: ${nectar.category}\n` +
        `治疗力: ${nectar.healingPower}\n` +
        `数量: ${nectar.count}`, 'LABEL_TEXT', {
        fontSize: 14,
        color: '#FFFFFF',
        align: 'center'
    }).setOrigin(0.5);

    tooltipContainer.add([tooltipBg, tooltipText]);

    // 保存引用以便清理
    tooltipContainer.setData('isTooltip', true);
    this.currentTooltip = tooltipContainer;

    // 淡入动画
    tooltipContainer.setAlpha(0);
    this.tweens.add({
        targets: tooltipContainer,
        alpha: 1,
        duration: 200
    });
}

/**
 * 隐藏甘露提示信息
 */
private hideNectarTooltip(): void {
    if (this.currentTooltip) {
        this.currentTooltip.destroy();
        this.currentTooltip = null;
    }
}

/**
 * 创建背包操作按钮
 */
private createBackpackButtons(container: Phaser.GameObjects.Container, overlay: Phaser.GameObjects.Rectangle, bpWidth: number, bpHeight: number): void {
    const buttonHeight = Math.max(40, bpHeight * 0.06); // 按钮高度自适应
    const buttonWidth = Math.max(100, bpWidth * 0.08); // 按钮宽度自适应
    const buttonY = (bpHeight / 2) - (buttonHeight / 2) - 20; // 底部对齐，留20px边距
    const buttonSpacing = bpWidth * 0.02; // 按钮间距为弹框宽度的2%
    const fontSize = Math.min(16, bpWidth * 0.012); // 字体大小自适应

    // 计算按钮位置（三个按钮居中排列）
    const totalButtonWidth = buttonWidth * 3 + buttonSpacing * 2;
    const startX = -(totalButtonWidth / 2) + (buttonWidth / 2);

    // 整理按钮
    const organizeBtnX = startX;
    const organizeBtn = this.add.rectangle(organizeBtnX, buttonY, buttonWidth, buttonHeight, 0x4CAF50, 1)
        .setStrokeStyle(2, 0x388E3C)
        .setInteractive({ useHandCursor: true });

    const organizeText = this.createText(organizeBtnX, buttonY, '📦 整理', 'BUTTON_TEXT', {
        fontSize: fontSize,
        color: '#FFFFFF'
    }).setOrigin(0.5);

    // 整理按钮事件
    organizeBtn.on('pointerdown', () => {
        this.organizeBackpack();
    });

    // 全部使用按钮
    const useAllBtnX = startX + buttonWidth + buttonSpacing;
    const useAllBtn = this.add.rectangle(useAllBtnX, buttonY, buttonWidth, buttonHeight, 0xFF9800, 1)
        .setStrokeStyle(2, 0xF57C00)
        .setInteractive({ useHandCursor: true });

    // 根据弹框宽度调整按钮文字
    const useAllBtnText = bpWidth >= 800 ? '✨ 全部使用' : '✨ 全用';
    const useAllText = this.createText(useAllBtnX, buttonY, useAllBtnText, 'BUTTON_TEXT', {
        fontSize: fontSize,
        color: '#FFFFFF'
    }).setOrigin(0.5);

    // 全部使用按钮事件
    useAllBtn.on('pointerdown', () => {
        this.useAllNectars();
    });

    // 关闭按钮
    const closeBtnX = startX + (buttonWidth + buttonSpacing) * 2;
    const closeBtn = this.add.rectangle(closeBtnX, buttonY, buttonWidth, buttonHeight, 0xF44336, 1)
        .setStrokeStyle(2, 0xD32F2F)
        .setInteractive({ useHandCursor: true });

    const closeText = this.createText(closeBtnX, buttonY, '❌ 关闭', 'BUTTON_TEXT', {
        fontSize: fontSize,
        color: '#FFFFFF'
    }).setOrigin(0.5);

    // 关闭按钮事件
    closeBtn.on('pointerdown', () => {
        this.animateBackpackClose(container, overlay);
    });

    // 添加按钮悬浮效果
    [organizeBtn, useAllBtn, closeBtn].forEach(btn => {
        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });
    });

    container.add([organizeBtn, organizeText, useAllBtn, useAllText, closeBtn, closeText]);

    // 点击遮罩关闭
    overlay.on('pointerdown', () => {
        this.animateBackpackClose(container, overlay);
    });
}

/**
 * 背包打开动画
 */
private animateBackpackOpen(container: Phaser.GameObjects.Container, overlay: Phaser.GameObjects.Rectangle): void {
    // 初始状态
    container.setScale(0.3);
    container.setAlpha(0);
    overlay.setAlpha(0);

    // 遮罩渐入
    this.tweens.add({
        targets: overlay,
        alpha: 0.7,
        duration: 300
    });

    // 背包弹出动画
    this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 500,
        ease: 'Back.easeOut'
    });
}

/**
 * 背包关闭动画
 */
private animateBackpackClose(container: Phaser.GameObjects.Container, overlay?: Phaser.GameObjects.Rectangle): void {
    this.hideNectarTooltip(); // 清理提示框

    this.tweens.add({
        targets: container,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
            container.destroy();
            if (overlay) overlay.destroy();
        }
    });
}

/**
 * 整理背包
 */
private organizeBackpack(): void {
    this.showMessage('🔄 背包整理完成！');
    // 这里可以添加整理逻辑，比如按学科分类排序
}

/**
 * 使用全部甘露
 */
private useAllNectars(): void {
    if (!this.nectarInventory || !this.nectarInventory.nectars.length) {
        this.showMessage('📦 背包中没有甘露可以使用');
        return;
    }

    // 显示确认对话框
    this.showConfirmDialog(
        '确定要使用全部甘露吗？',
        '这将消耗背包中的所有甘露来恢复花朵HP',
        () => {
            // 确认使用
            let totalHealing = 0;
            this.nectarInventory!.nectars.forEach(nectar => {
                totalHealing += nectar.healingPower * nectar.count;
            });
            
            this.showMessage(`✨ 使用了全部甘露，总共恢复 ${totalHealing} 点HP！`);
            
            // 清空甘露库存（这里应该调用API）
            this.nectarInventory!.nectars = [];
            this.nectarInventory!.totalNectars = 0;
            this.nectarInventory!.totalTypes = 0;
            
            // 重新刷新背包显示
            this.animateBackpackClose(this.children.getByName('backpackContainer') as Phaser.GameObjects.Container);
            setTimeout(() => {
                this.openBackpackDialog();
            }, 500);
        }
    );
}

/**
 * 显示确认对话框
 */
private showConfirmDialog(title: string, message: string, onConfirm: () => void): void {
    // 创建确认对话框的实现
    const confirmOverlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.8
    ).setInteractive().setDepth(2000);

    const confirmContainer = this.add.container(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2
    ).setDepth(2001);

    // 对话框背景
    const dialogBg = this.add.rectangle(0, 0, 400, 200, 0xFFFFFF, 1)
        .setStrokeStyle(3, 0x4CAF50);

    // 标题
    const titleText = this.createText(0, -60, title, 'TITLE_MEDIUM', {
        fontSize: 20,
        color: '#2D5016'
    }).setOrigin(0.5);

    // 消息
    const messageText = this.createText(0, -20, message, 'BODY_TEXT', {
        fontSize: 16,
        color: '#333333',
        align: 'center',
        wordWrap: { width: 350 }
    }).setOrigin(0.5);

    // 确认按钮
    const confirmBtn = this.add.rectangle(-80, 60, 100, 40, 0x4CAF50, 1)
        .setStrokeStyle(2, 0x388E3C)
        .setInteractive({ useHandCursor: true });

    const confirmText = this.createText(-80, 60, '✓ 确认', 'BUTTON_TEXT', {
        fontSize: 16,
        color: '#FFFFFF'
    }).setOrigin(0.5);

    // 取消按钮
    const cancelBtn = this.add.rectangle(80, 60, 100, 40, 0xF44336, 1)
        .setStrokeStyle(2, 0xD32F2F)
        .setInteractive({ useHandCursor: true });

    const cancelText = this.createText(80, 60, '✗ 取消', 'BUTTON_TEXT', {
        fontSize: 16,
        color: '#FFFFFF'
    }).setOrigin(0.5);

    confirmContainer.add([dialogBg, titleText, messageText, confirmBtn, confirmText, cancelBtn, cancelText]);

    // 按钮事件
    confirmBtn.on('pointerdown', () => {
        onConfirm();
        confirmOverlay.destroy();
        confirmContainer.destroy();
    });

    cancelBtn.on('pointerdown', () => {
        confirmOverlay.destroy();
        confirmContainer.destroy();
    });

    confirmOverlay.on('pointerdown', () => {
        confirmOverlay.destroy();
        confirmContainer.destroy();
    });

    // 弹出动画
    confirmContainer.setScale(0.5);
    this.tweens.add({
        targets: confirmContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
    });
}

// 在类的属性声明部分添加
private currentTooltip: Phaser.GameObjects.Container | null = null;


} 