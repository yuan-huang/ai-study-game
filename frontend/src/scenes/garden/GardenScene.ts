import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { gardenApi, SubjectFlowerStatusResponse } from '@/api/gardenApi';
import { gameState } from '@/stores/gameState';



export class GardenScene extends BaseScene {
    private subjectFlowerStatus: SubjectFlowerStatusResponse | null = null;
    private currentUserId: string;

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

        // 加载花园背景音乐
        this.load.audio('garden-bgm', getAssetPath('garden-bgm'));
        
    }

    create(): void {
        super.create();
        
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

        
        // 创建返回按钮
        this.createBackButton();
        
        // 加载花园数据
        this.loadGardenData().then(() => {
            this.placeSubjectFlowers();
        });



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
            const subjectStatusResponse = await gardenApi.getSubjectFlowerStatus(this.currentUserId);

            if (subjectStatusResponse.success && subjectStatusResponse.data) {
                this.subjectFlowerStatus = subjectStatusResponse.data;
                console.log('学科花朵状态数据', this.subjectFlowerStatus);
            } else {
                console.error('加载学科花朵状态失败:', subjectStatusResponse.message);
                this.showMessage('加载学科花朵状态失败');
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
} 