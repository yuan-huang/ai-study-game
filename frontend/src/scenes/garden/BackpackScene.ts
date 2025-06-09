import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { gardenApi, NectarData } from '@/api/gardenApi';
import { gameState } from '@/stores/gameState';

export class BackpackScene extends BaseScene {
    private currentUserId: string;
    private nectarInventory: { nectars: NectarData[], totalNectars: number, totalTypes: number } | null = null;
    private backpackPanel: any = null;
    private scrollablePanel: any = null;

    constructor() {
        super('BackpackScene');
        this.currentUserId = gameState.userId;
    }

    preload(): void {
        super.preload();
        // 加载背包相关资源
        this.load.image('backpack-bg', getAssetPath('garden'));
        this.load.image('nectar', getAssetPath('nectar'));
    }

    create(): void {
        super.create();
        
        // 设置背景
        const background = this.add.image(0, 0, 'backpack-bg').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setTint(0x888888);
        background.setDepth(0);
        
        // 创建标题
        this.createText(
            this.cameras.main.width / 2, 
            50, 
            '🎒 甘露背包', 
            'TITLE_LARGE',
            {
                color: '#2d5016',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(100);

        // 创建返回按钮
        this.createBackButton();
        
        // 创建rex-ui背包界面
        this.createRexUIBackpack();
        
        // 加载甘露数据
        this.loadNectarData().then(() => {
            this.displayNectars();
        });
    }

    private createBackButton(): void {
        const backButton = this.add.rectangle(
            80, 30, 120, 40, 0x4caf50, 1
        ).setStrokeStyle(2, 0x388e3c);
        
        const backText = this.createText(80, 30, '🏠 返回', 'BUTTON_TEXT', {
            fontSize: 18,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backButton.setInteractive({ useHandCursor: true });
        
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

        backButton.on('pointerdown', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    this.scene.start('GardenScene');
                }
            });
        });
        
        backButton.setDepth(100);
        backText.setDepth(101);
    }

    private createRexUIBackpack(): void {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 + 20;

        // 创建背包主面板
        this.backpackPanel = this.rexUI.add.sizer({
            x: centerX,
            y: centerY,
            width: 600,
            height: 600,
            orientation: 'vertical',
            space: { item: 10 }
        });

        // 创建背景
        const background = this.rexUI.add.roundRectangle(0, 0, 600, 600, 20, 0xffffff, 0.95)
            .setStrokeStyle(3, 0x4caf50);
        this.backpackPanel.addBackground(background);

        // 创建统计信息面板
        const statsPanel = this.createStatsPanel();
        this.backpackPanel.add(statsPanel, { proportion: 0, expand: true });

        // 创建可滚动的甘露列表
        this.scrollablePanel = this.rexUI.add.scrollablePanel({
            width: 580,
            height: 450,
            scrollMode: 'vertical',
            background: this.rexUI.add.roundRectangle(0, 0, 580, 450, 10, 0xf8f8f8, 1),
            panel: {
                child: this.rexUI.add.sizer({
                    orientation: 'vertical',
                    space: { item: 5 }
                }),
                mask: {
                    padding: 1
                }
            },
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xcccccc),
                thumb: this.rexUI.add.roundRectangle(0, 0, 20, 50, 10, 0x4caf50)
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10
            }
        });

        this.backpackPanel.add(this.scrollablePanel, { proportion: 1, expand: true });

        // 布局并添加到场景
        this.backpackPanel.layout().setDepth(50);
    }

    private createStatsPanel(): any {
        const statsPanel = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 20 }
        });

        // 统计信息将在数据加载后更新
        const statsText = this.add.text(0, 0, '📊 加载中...', {
            fontSize: '24px',
            color: '#2d5016'
        });

        statsPanel.add(statsText, { expand: true });
        
        // 保存引用以便后续更新
        (this.backpackPanel as any).statsText = statsText;

        return statsPanel;
    }

    private async loadNectarData(): Promise<void> {
        try {
            const response = await gardenApi.getNectarInventory(this.currentUserId);
            
            if (response.success && response.data) {
                this.nectarInventory = response.data;
                console.log('甘露库存数据加载成功:', this.nectarInventory);
            } else {
                console.error('加载甘露库存失败:', response.message);
                this.showMessage('加载甘露库存失败');
            }
        } catch (error) {
            console.error('加载甘露库存失败:', error);
            this.showMessage('连接服务器失败');
        }
    }

    private displayNectars(): void {
        if (!this.nectarInventory) {
            this.showEmptyState();
            return;
        }

        // 更新统计信息
        this.updateStatistics();

        const nectars = this.nectarInventory.nectars;
        
        if (nectars.length === 0) {
            this.showEmptyState();
            return;
        }

        // 清空现有内容
        const panel = this.scrollablePanel.getElement('panel');
        panel.clear(true);

        // 添加甘露项目
        nectars.forEach((nectar) => {
            const nectarItem = this.createRexNectarItem(nectar);
            panel.add(nectarItem, { expand: true });
        });

        // 重新布局
        this.scrollablePanel.layout();
    }

    private updateStatistics(): void {
        if (!this.nectarInventory || !this.backpackPanel) return;

        const statsText = (this.backpackPanel as any).statsText;
        if (statsText) {
            statsText.setText(`📊 总甘露: ${this.nectarInventory.totalNectars} | 种类: ${this.nectarInventory.totalTypes}`);
        }
    }

    private createRexNectarItem(nectar: NectarData): any {
        // 创建甘露项目的sizer容器
        const itemSizer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 15 }
        });

        // 背景
        const itemBg = this.rexUI.add.roundRectangle(0, 0, 560, 100, 10, 0xf5f5f5, 1)
            .setStrokeStyle(2, this.getNectarColor(nectar.subject));
        itemSizer.addBackground(itemBg);

        // 甘露图标
        const nectarIcon = this.add.image(0, 0, 'nectar')
            .setDisplaySize(60, 60)
            .setTint(this.getNectarColor(nectar.subject));
        itemSizer.add(nectarIcon, { padding: { left: 20 } });

        // 文本信息容器
        const textSizer = this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 5 }
        });

        // 学科名称
        const subjectText = this.add.text(0, 0, this.getSubjectName(nectar.subject), {
            fontSize: '26px',
            color: '#2d5016',
            fontStyle: 'bold'
        });
        textSizer.add(subjectText);

        // 年级和分类
        const gradeText = this.add.text(0, 0, `${nectar.grade}年级 | ${nectar.category}`, {
            fontSize: '20px',
            color: '#666666'
        });
        textSizer.add(gradeText);

        // 治疗力
        const healingText = this.add.text(0, 0, `💊 治疗力: ${nectar.totalHealingPower}`, {
            fontSize: '22px',
            color: '#4caf50'
        });
        textSizer.add(healingText);

        itemSizer.add(textSizer, { expand: true });

        // 数量信息
        const countBg = this.rexUI.add.roundRectangle(0, 0, 80, 40, 10, 0xff6b00, 0.2)
            .setStrokeStyle(2, 0xff6b00);
        const countText = this.add.text(0, 0, `×${nectar.count}`, {
            fontSize: '24px',
            color: '#ff6b00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const countContainer = this.rexUI.add.overlapSizer()
            .addBackground(countBg)
            .add(countText);

        itemSizer.add(countContainer, { padding: { right: 20 } });

        // 添加交互效果
        itemSizer.setInteractive()
            .on('pointerover', () => {
                this.tweens.add({
                    targets: itemBg,
                    alpha: 0.8,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 200,
                    ease: 'Power2'
                });
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: itemBg,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            })
            .on('pointerdown', () => {
                this.showNectarDetails(nectar);
            });

        return itemSizer.layout();
    }

    private showNectarDetails(nectar: NectarData): void {
        // 使用rex-ui创建对话框
        const dialog = this.rexUI.add.dialog({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            width: 400,
            height: 350,

            background: this.rexUI.add.roundRectangle(0, 0, 400, 350, 20, 0xffffff, 1)
                .setStrokeStyle(3, this.getNectarColor(nectar.subject)),

            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 300, 50, 10, this.getNectarColor(nectar.subject)),
                text: this.add.text(0, 0, `💧 ${this.getSubjectName(nectar.subject)} 甘露`, {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }),
                space: { left: 15, right: 15, top: 10, bottom: 10 }
            }),

            content: this.createNectarDetailsContent(nectar),

            actions: [
                this.rexUI.add.label({
                    background: this.rexUI.add.roundRectangle(0, 0, 120, 40, 10, 0xf44336),
                    text: this.add.text(0, 0, '✖️ 关闭', {
                        fontSize: '20px',
                        color: '#ffffff'
                    }),
                    space: { left: 15, right: 15, top: 8, bottom: 8 }
                })
            ],

            space: {
                title: 25,
                content: 25,
                action: 15,
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: {
                actions: 'center',
            },

            expand: {
                content: true,
            }
        })
        .layout()
        .popUp(300)
        .setDepth(1000);

        // 添加关闭事件
        dialog
            .on('button.click', () => {
                dialog.scaleDownDestroy(100);
            })
            .on('button.over', function (this: any, button: any) {
                button.getElement('background').setStrokeStyle(2, 0xffffff);
            })
            .on('button.out', function (this: any, button: any) {
                button.getElement('background').setStrokeStyle();
            });
    }

    private createNectarDetailsContent(nectar: NectarData): any {
        const contentSizer = this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 15 }
        });

        // 甘露图标
        const nectarIcon = this.add.image(0, 0, 'nectar')
            .setDisplaySize(80, 80)
            .setTint(this.getNectarColor(nectar.subject));
        contentSizer.add(nectarIcon);

        // 详细信息
        const details = [
            `📚 年级: ${nectar.grade}年级`,
            `📖 分类: ${nectar.category}`,
            `💊 总治疗力: ${nectar.totalHealingPower}`,
            `📦 数量: ${nectar.count}`
        ];

        details.forEach(detail => {
            const detailText = this.add.text(0, 0, detail, {
                fontSize: '22px',
                color: '#333333'
            });
            contentSizer.add(detailText);
        });

        return contentSizer;
    }

    private showEmptyState(): void {
        if (!this.scrollablePanel) return;

        const panel = this.scrollablePanel.getElement('panel');
        panel.clear(true);

        const emptyMessage = this.rexUI.add.label({
            background: this.rexUI.add.roundRectangle(0, 0, 300, 100, 10, 0xffffff, 0.9),
            text: this.add.text(0, 0, '🌿 背包空空如也\n去完成任务获取甘露吧！', {
                fontSize: '24px',
                color: '#666666',
                align: 'center'
            }),
            space: { left: 20, right: 20, top: 15, bottom: 15 }
        });

        panel.add(emptyMessage);
        this.scrollablePanel.layout();
    }

    private getNectarColor(subject: string): number {
        const colorMap: Record<string, number> = {
            'chinese': 0xff6b6b,
            'math': 0x4dabf7,
            'english': 0x69db7c,
            'technology': 0x9775fa,
            'marine': 0x20c997
        };
        return colorMap[subject] || 0x6c757d;
    }

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
