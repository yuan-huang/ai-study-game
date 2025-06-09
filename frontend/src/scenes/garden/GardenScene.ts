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
     * 显示治疗效果
     */
    private showHealingEffect(position: {x: number, y: number}, healedAmount: number): void {
        // 创建治疗特效文字
        const healText = this.createText(
            position.x, position.y - 50,
            `+${healedAmount} HP`,
            'NUMBER_TEXT',
            {
                fontSize: 28,
                color: '#00ff00',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(1500);

        // 飘起动画
        this.tweens.add({
            targets: healText,
            y: healText.y - 60,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                healText.destroy();
            }
        });

        // 创建光芒特效
        const glowEffect = this.add.circle(position.x, position.y, 30, 0x00ff00, 0.6)
            .setDepth(1400);
        
        this.tweens.add({
            targets: glowEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                glowEffect.destroy();
            }
        });
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
     * 打开背包弹框 - 使用简化的 Rex-UI 实现
     */
    private openBackpackDialog(): void {
        console.log('🎒 尝试打开背包弹框');
        console.log('🔧 检查 rexUI 是否可用:', this.rexUI);
        
        if (!this.rexUI) {
            console.error('❌ rexUI 插件未找到！');
            this.showMessage('背包功能暂时不可用');
            return;
        }
        
        console.log('✅ rexUI 插件已找到，开始创建 Dialog');
        
        var dialog = this.rexUI.add.dialog({
            x: 400,
            y: 300,
            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 10, 0x1565c0),
            title: this.add.text(0, 0, 'Title', { fontSize: '24px' }),
            content: this.add.text(0, 0, 'Content', { fontSize: '16px' }),
            actions: [
                this.add.text(0, 0, 'OK', { fontSize: '18px' }),
                this.add.text(0, 0, 'Cancel', { fontSize: '18px' })
            ]
        });
    
        // 显示为模态对话框
        dialog.modal();
    }

    /**
     * 创建简单的关闭按钮
     */
    private createSimpleCloseButton(overlay: Phaser.GameObjects.Rectangle, dialog: any): Phaser.GameObjects.GameObject {
        const closeContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 8 }
        });

        // 关闭按钮背景
        const closeButton = this.rexUI.add.roundRectangle(0, 0, 120, 40, 8, 0xf44336)
            .setStrokeStyle(2, 0xd32f2f)
            .setInteractive({ useHandCursor: true });

        // 关闭文字
        const closeText = this.createText(0, 0, '✖️ 关闭', 'BUTTON_TEXT', {
            fontSize: 16,
            color: '#ffffff',
            fontStyle: 'bold'
        });

        closeContainer.add(closeButton, { expand: true });
        closeContainer.add(closeText, { expand: false, align: 'center' });

        // 悬浮效果
        closeButton.on('pointerover', () => {
            this.tweens.add({
                targets: closeContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150
            });
        });

        closeButton.on('pointerout', () => {
            this.tweens.add({
                targets: closeContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        // 点击关闭事件
        closeButton.on('pointerdown', () => {
            console.log('🔒 关闭背包');
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
        });

        // 点击遮罩关闭
        overlay.on('pointerdown', () => {
            console.log('🔒 点击遮罩关闭背包');
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
        });

        return closeContainer;
    }

    /**
     * 创建弹框标题
     */
    private createDialogTitle(): Phaser.GameObjects.GameObject {
        const titleContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 }
        });

        // 标题背景
        titleContainer.addBackground(
            this.rexUI.add.roundRectangle(0, 0, 860, 80, 10, 0xe8f5e8)
                .setStrokeStyle(2, 0x4caf50)
        );

        // 添加标题文本
        titleContainer.add(
            this.createText(0, 0, '🎒 背包仓库', 'TITLE_LARGE', {
                fontSize: 32,
                color: '#2d5016',
                fontStyle: 'bold'
            }),
            { expand: true, align: 'left' }
        );

        return titleContainer;
    }



    /**
     * 创建背包内容 - 优化的布局
     */
    private createBackpackContent(): Phaser.GameObjects.GameObject {
        console.log('🔧 创建背包内容');
        
        // 主内容容器
        const mainContent = this.rexUI.add.sizer({
            orientation: 'vertical',
            width: 840,
            height: 580,
            space: { item: 15 }
        });

        // 统计信息条
        const statsBar = this.createStatsBar();
        mainContent.add(statsBar, { expand: false });

        // 甘露展示区域
        const nectarArea = this.createNectarDisplayArea();
        mainContent.add(nectarArea, { expand: true });
        
        return mainContent;
    }

    /**
     * 创建甘露展示区域
     */
    private createNectarDisplayArea(): Phaser.GameObjects.GameObject {
        const displayContainer = this.rexUI.add.sizer({
            orientation: 'vertical',
            width: 820,
            height: 450
        });

        // 添加背景
        displayContainer.addBackground(
            this.rexUI.add.roundRectangle(0, 0, 820, 450, 10, 0xfafafa)
                .setStrokeStyle(2, 0xcccccc)
        );

        if (this.nectarInventory?.nectars && this.nectarInventory.nectars.length > 0) {
            // 有甘露时显示网格
            const nectarGrid = this.createSimpleNectarGrid();
            displayContainer.add(nectarGrid, { expand: true, align: 'center' });
        } else {
            // 空背包提示
            const emptyMessage = this.createEmptyBackpackMessage();
            displayContainer.add(emptyMessage, { expand: true, align: 'center' });
        }

        return displayContainer;
    }

    /**
     * 创建简化的甘露网格 - 避免复杂布局问题
     */
    private createSimpleNectarGrid(): Phaser.GameObjects.GameObject {
        // 使用简单的容器来放置甘露卡片
        const gridContainer = this.add.container(0, 0);
        
        const nectars = this.nectarInventory!.nectars.slice(0, 8); // 最多显示8个
        const columns = 4;
        const cardWidth = 140;
        const cardHeight = 100;
        const spacingX = 180;
        const spacingY = 120;
        
        nectars.forEach((nectar, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            
            const xPos = (col - 1.5) * spacingX;
            const yPos = (row - 0.5) * spacingY;
            
            const nectarCard = this.createNectarCard(nectar, xPos, yPos);
            gridContainer.add(nectarCard);
        });
        
        return gridContainer;
    }

    /**
     * 创建甘露卡片
     */
    private createNectarCard(nectar: any, x: number, y: number): Phaser.GameObjects.Container {
        const cardContainer = this.add.container(x, y);
        
        // 获取学科颜色
        const subjectColors: Record<string, number> = {
            'chinese': 0xff6b6b,
            'math': 0x4ecdc4,
            'english': 0x45b7d1,
            'technology': 0x9b59b6,
            'marine': 0x26de81
        };
        const bgColor = subjectColors[nectar.subject] || 0xcccccc;
        
        // 卡片阴影
        const shadow = this.add.rectangle(3, 3, 140, 100, 0x000000, 0.2);
        
        // 卡片背景
        const cardBg = this.add.rectangle(0, 0, 140, 100, 0xffffff, 1)
            .setStrokeStyle(3, bgColor)
            .setInteractive({ useHandCursor: true });
        
        // 甘露图标
        const icon = this.add.circle(0, -25, 15, bgColor, 1);
        
        // 学科名称
        const subjectText = this.createText(0, -5, 
            this.getSubjectName(nectar.subject), 'LABEL_TEXT', {
            fontSize: 16,
            color: '#333333',
            fontStyle: 'bold'
        });
        
        // 数量和治疗力
        const countText = this.createText(-35, 20, 
            `数量: ${nectar.count}`, 'NUMBER_TEXT', {
            fontSize: 12,
            color: '#666666'
        });
        
        const healingText = this.createText(35, 20, 
            `💖${nectar.healingPower}`, 'NUMBER_TEXT', {
            fontSize: 12,
            color: '#e74c3c'
        });
        
        cardContainer.add([shadow, cardBg, icon, subjectText, countText, healingText]);
        
        // 交互效果
        this.addCardInteraction(cardContainer, cardBg, bgColor, nectar);
        
        return cardContainer;
    }

    /**
     * 添加卡片交互效果
     */
    private addCardInteraction(container: Phaser.GameObjects.Container, cardBg: Phaser.GameObjects.Rectangle, bgColor: number, nectar: any): void {
        // 悬浮效果
        cardBg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
            cardBg.setFillStyle(bgColor, 0.1);
        });
        
        cardBg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
            cardBg.setFillStyle(0xffffff, 1);
        });
        
        // 点击使用效果
        cardBg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.showNectarDetailDialog(nectar);
                }
            });
        });
    }

    /**
     * 创建空背包消息
     */
    private createEmptyBackpackMessage(): Phaser.GameObjects.GameObject {
        const messageContainer = this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 20 }
        });

        // 空背包图标
        const emptyIcon = this.createText(0, 0, '📦', 'TITLE_MEDIUM', {
            fontSize: 48,
            color: '#cccccc'
        });

        // 提示文字
        const emptyText = this.createText(0, 0, '背包是空的\n去闯关获得更多甘露吧！', 'BODY_TEXT', {
            fontSize: 18,
            color: '#999999',
            align: 'center'
        });

        messageContainer.add(emptyIcon, { expand: false });
        messageContainer.add(emptyText, { expand: false });

        return messageContainer;
    }

    /**
     * 创建统计信息条
     */
    private createStatsBar(): Phaser.GameObjects.GameObject {
        const statsText = !this.nectarInventory || !this.nectarInventory.nectars ? 
            '📦 背包中没有甘露' :
            `📊 甘露总数: ${this.nectarInventory.totalNectars} | 🎯 种类: ${this.nectarInventory.totalTypes}`;
            
        const statsContainer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            width: 800,
            height: 50
        });

        // 统计面板背景
        statsContainer.addBackground(
            this.rexUI.add.roundRectangle(0, 0, 800, 50, 8, 0xe8f5e8)
                .setStrokeStyle(2, 0x4caf50)
        );

        // 统计文字
        statsContainer.add(
            this.createText(0, 0, statsText, 'LABEL_TEXT', {
                fontSize: 20,
                color: '#2e7d32',
                fontStyle: 'bold'
            }),
            { expand: true, align: 'center' }
        );

        return statsContainer;
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
} 