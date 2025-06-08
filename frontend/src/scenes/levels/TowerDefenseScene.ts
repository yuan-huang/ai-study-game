import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { UserConfig,
    TowerDefenseGameState,
    Question,
    TowerType,
    EnemyType
} from '@/types/towerDefenseScene';
import { Monster } from '@/entities/TowerDefense/Monster';
import { Tower, Projectile } from '@/entities/TowerDefense/Tower';
import { saveGameCompletion, GameCompletionData, Reward } from '@/api/towerDefenseRewardApi';
import { 
    INITIAL_GAME_STATE,
    GAME_AREA_CONFIG,
    LAYOUT_CONFIG,
    TOWER_TYPES,
    ENEMY_TYPES,
    WAVE_CONFIG,
    generateGamePath,
    TIMING_CONFIG,
    TOWER_COLORS,
    getWaveMonsters,
    calculateGameLayout
} from '@/towerDefenseManager/towerConfig';
import { gameState } from '@/stores/gameState';

export class TowerDefenseScene extends BaseScene {
    private gameState!: TowerDefenseGameState;
    private userConfig!: UserConfig;
    private towers: Tower[] = [];
    private enemies: Monster[] = [];
    private projectiles: Projectile[] = [];
    
    // UI容器
    private statusBarContainer!: Phaser.GameObjects.Container;
    private gameContainer!: Phaser.GameObjects.Container;
    private rightContainer!: Phaser.GameObjects.Container;
    
    // UI元素
    private healthText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    
    // 题目相关
    private questionPanel!: Phaser.GameObjects.Container;
    private currentQuestion: Question | null = null;
    private questionActive = false;
    private questions: Question[] = [];
    private questionPool: Question[] = [];
    
    // 题目跟踪
    private answeredQuestionIds: string[] = []; // 记录所有回答过的题目ID
    private wrongQuestionIds: string[] = []; // 记录回答错误的题目ID
    
    // 游戏路径
    private path: Phaser.Math.Vector2[] = [];
    
    // 选中的塔类型
    private selectedTowerType: string | null = null;
    private placementMode = false;
    private placementIndicator?: Phaser.GameObjects.Image;
    private rangeIndicator?: Phaser.GameObjects.Graphics;
    
    // 波次管理
    private currentWaveEnemies: string[] = [];
    private enemySpawnTimer?: Phaser.Time.TimerEvent;
    private waveInProgress = false;
    
    // 游戏区域大小
    private gameAreaWidth = GAME_AREA_CONFIG.width;
    private gameAreaHeight = GAME_AREA_CONFIG.height;
    
    // 布局尺寸属性
    private singlePanelHeight: number = 0;
    
    // 塔按钮引用
    private towerButtons: { [key: string]: Phaser.GameObjects.Rectangle } = {};
    
    // 撤回区域相关
    private cancelArea?: Phaser.GameObjects.Container;
    private cancelAreaBounds?: Phaser.Geom.Rectangle;
    
    // 游戏结束对话框
    private gameOverDialog?: Phaser.GameObjects.Container;
    
    // 奖励对话框
    private rewardDialog?: Phaser.GameObjects.Container;
    
    // 游戏完成数据
    private completionStartTime: number = 0;

    constructor() {
        super('TowerDefenseScene');
    }

    init(data: { 
        subject: string, 
        grade: number,
        category: string,
        userLevel: number
    }): void {
        console.log("TowerDefenseScene init:", data);
        this.userConfig = {
            grade: data.grade,
            subject: data.subject,
            category: data.category,
            userLevel: data.userLevel || 1,
        }
        super.init();
        this.initGameState();
        this.completionStartTime = Date.now();
    }

    private initGameState(): void {
        this.gameState = { ...INITIAL_GAME_STATE };
        
        // 清空题目跟踪记录
        this.answeredQuestionIds = [];
        this.wrongQuestionIds = [];
    }

    preload(): void {
        super.preload();

        //游戏背景
        this.load.image('towerDefense-bg', getAssetPath('towerDefense-bg'));
        
        // 加载怪物资源
        this.load.image('monster-normal', getAssetPath('monster-gluttonous'));
        this.load.image('monster-gluttonous', getAssetPath('monster-gluttonous'));
        this.load.image('monster-grumpy', getAssetPath('monster-grumpy'));
        this.load.image('monster-lazy', getAssetPath('monster-lazy'));
        this.load.image('monster-messy', getAssetPath('monster-messy'));
        
        // 加载塔防资源
        this.load.image('tower-arrow', getAssetPath('tower-arrow'));
        this.load.image('tower-freeze', getAssetPath('tower-freeze'));
        this.load.image('tower-laser', getAssetPath('tower-laser'));
        this.load.image('tower-poison', getAssetPath('tower-poison'));
    }

    create(): void {
        super.create();
        // 游戏背景 - 使用 setDisplaySize 来填满整个屏幕
        const bg = this.add.image(0, 0, 'towerDefense-bg').setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        bg.setDepth(0);


        // 创建容器结构
        this.createContainers();
        
        // 创建UI
        this.createUI();
        
        // 创建防御塔放置系统
        this.createTowerPlacementSystem();
        
        // 生成初始题库
        this.generateQuestions();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化UI状态
        this.updateUI();
        
        // 开始第一波
        this.time.delayedCall(TIMING_CONFIG.gameStartDelay, () => {
            this.startWave();
        });
    }

    private createContainers(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 布局常量定义
        const gameContainerWidth = width - LAYOUT_CONFIG.rightContainerWidth;
        const mainContentHeight = height - LAYOUT_CONFIG.statusBarHeight;

        // 1. 任务状态栏容器 (顶部)
        this.statusBarContainer = this.add.container(0, 0);

        // 2. 左边游戏容器
        this.gameContainer = this.add.container(0, LAYOUT_CONFIG.statusBarHeight);
        // 设置游戏容器的可视区域
        this.gameAreaWidth = gameContainerWidth;
        this.gameAreaHeight = mainContentHeight;

        // 3. 右边答题容器
        this.rightContainer = this.add.container(gameContainerWidth, LAYOUT_CONFIG.statusBarHeight);
    }

    private createPath(): void {
        // 使用配置文件中的路径生成函数
        this.path = generateGamePath(this.gameAreaWidth, this.gameAreaHeight);
    }

    private drawPath(): void {
        // 游戏区域背景
        const gameBg = this.add.rectangle(0, 0, this.gameAreaWidth, this.gameAreaHeight, 0x8fbc8f, 0.3);
        gameBg.setOrigin(0, 0);
        gameBg.setStrokeStyle(2, 0x4a7c59, 1); // 添加边框
        this.gameContainer.add(gameBg);

        const graphics = this.add.graphics();
        graphics.lineStyle(80, 0x8B4513, 1);
        
        if (this.path.length > 1) {
            graphics.beginPath();
            graphics.moveTo(this.path[0].x, this.path[0].y);
            
            for (let i = 1; i < this.path.length; i++) {
                graphics.lineTo(this.path[i].x, this.path[i].y);
            }
            
            graphics.strokePath();
        }
        
        // 添加起点和终点标记
        const startCircle = this.add.circle(this.path[0].x, this.path[0].y, 30, 0x00ff00);
        const endCircle = this.add.circle(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, 30, 0xff0000);
        
        // 将路径元素添加到游戏容器
        this.gameContainer.add([graphics, startCircle, endCircle]);
    }

    private createUI(): void {
        // 创建状态栏
        this.createStatusBar();
        
        this.createLightPanels();

        // 创建右侧三个面板
        this.createRightPanels();
    }

    private createLightPanels() {
        // 创建游戏路径
        this.createPath();

        // 绘制路径
        this.drawPath();
    }

    private createStatusBar(): void {
        const width = this.cameras.main.width;

        // 状态栏背景
        const statusBg = this.add.rectangle(width/2, LAYOUT_CONFIG.statusBarHeight/2, width, LAYOUT_CONFIG.statusBarHeight, 0x6c5ce7, 0.9);
        
        // 生命值
        this.healthText = this.add.text(20, LAYOUT_CONFIG.statusBarHeight/2, `❤️ 生命值: ${this.gameState.health}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 积分
        this.scoreText = this.add.text(width * 0.25, LAYOUT_CONFIG.statusBarHeight/2, `💰 积分: ${this.gameState.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 连击
        this.comboText = this.add.text(width * 0.45, LAYOUT_CONFIG.statusBarHeight/2, `⚡ 连击: ${this.gameState.combo}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 关卡信息
        this.levelText = this.add.text(width * 0.65, LAYOUT_CONFIG.statusBarHeight/2, 
            `第${this.gameState.currentLevel}关: ${this.userConfig.category} | ` +
            `关卡${this.gameState.currentLevel}/${this.gameState.totalLevels} | ` +
            `第${this.gameState.currentWave}波 (${this.gameState.currentWave}/${this.gameState.totalWaves})`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 结束按钮
        const endButtonWidth = 120;
        const endButtonHeight = 40;
        const endButtonX = width - endButtonWidth/2 - 20;
        const endButtonY = LAYOUT_CONFIG.statusBarHeight/2;
        
        const endButton = this.add.rectangle(endButtonX, endButtonY, endButtonWidth, endButtonHeight, 0xff5252, 1);
        endButton.setStrokeStyle(2, 0xd32f2f);
        endButton.setRounded(10);
        endButton.setInteractive({ useHandCursor: true });
        
        const endButtonText = this.add.text(endButtonX, endButtonY, '🚪 结束', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 结束按钮点击事件
        endButton.on('pointerdown', () => {
            this.gameOver();
        });
        
        // 结束按钮悬停效果
        endButton.on('pointerover', () => {
            this.tweens.add({
                targets: [endButton, endButtonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        endButton.on('pointerout', () => {
            this.tweens.add({
                targets: [endButton, endButtonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 添加到状态栏容器
        this.statusBarContainer.add([statusBg, this.healthText, this.scoreText, this.comboText, this.levelText, endButton, endButtonText]);
    }

    private createRightPanels(): void {
        const mainContentHeight = this.cameras.main.height - LAYOUT_CONFIG.statusBarHeight; // 减去状态栏高度
        const panelSpacing = LAYOUT_CONFIG.singlePanelSpacing;
        
        // 计算三个子容器的高度，平均分配
        this.singlePanelHeight = (mainContentHeight - panelSpacing * 2) / 2;

        // 1. 答题子容器
        this.createQuestionPanel(10, 10, LAYOUT_CONFIG.rightContainerWidth, this.singlePanelHeight);
        
        // 2. 塔容器  
        this.createTowerPanel(10, this.singlePanelHeight + panelSpacing, LAYOUT_CONFIG.rightContainerWidth, this.singlePanelHeight);
        
        // 3. 怪+积分容器
        // this.createWaveInfoPanel(0, (this.singlePanelHeight + panelSpacing) * 2, this.rightContainerWidth, this.singlePanelHeight);
    }

    private createQuestionPanel(x: number, y: number, width: number, height: number): void {
        // 创建问题面板容器
        this.questionPanel = this.add.container(x, y);
        
        // 面板背景
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        this.questionPanel.add(panelBg);
        
        // 面板标题
        const titleBg = this.add.rectangle(width/2, 25, width - 20, 35, 0x4fc3f7, 1);
        this.questionPanel.add(titleBg);
        
        const title = this.add.text(width/2, 25, '回答问题得积分', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.questionPanel.add(title);
        
        // 添加到右侧容器
        this.rightContainer.add(this.questionPanel);
        
        // 显示第一个问题
        this.showNextQuestion();
    }

    private createTowerPanel(x: number, y: number, width: number, height: number): void {
        const panelContainer = this.add.container(x, y);
        
        // 面板背景, 圆角
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        panelBg.setRounded(20);
        panelContainer.add(panelBg);
        
        // 面板标题
        const titleBg = this.add.rectangle(width/2, 35, width - 20, 50, 0x66bb6a, 1);
        titleBg.setRounded(20);
        panelContainer.add(titleBg);
        
        const title = this.add.text(width/2, 35, '建造防御塔', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panelContainer.add(title);
        
        // 将塔类型配置转换为数组以便排序和布局
        const towerArray = Object.values(TOWER_TYPES);
        
        const buttonWidth = (width - 80) / 2;  // 增加边距
        const buttonHeight = 80; // 调整按钮高度适应单行文本
        const buttonSpacing = 20;
        const startY = 80; // 按钮起始Y位置
        
        towerArray.forEach((towerType, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const btnX = 30 + col * (buttonWidth + buttonSpacing);
            const btnY = startY + row * (buttonHeight + buttonSpacing);
            
            // 创建按钮容器，使用相对坐标
            const buttonContainer = this.add.container(btnX + buttonWidth/2, btnY + buttonHeight/2);

            // 背景按钮（相对于容器的坐标）
            const buttonColor = TOWER_COLORS[towerType.type] || 0x888888;
            const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, buttonColor, 1);
            button.setStrokeStyle(3, 0x666666);
            button.setInteractive({ useHandCursor: true });
            button.setRounded(15);
            buttonContainer.add(button);
            
            // 保存按钮引用
            this.towerButtons[towerType.type] = button;
            
            // 单行文本显示：图标 + 名称 + 成本
            const displayText = `${towerType.icon} ${towerType.name} （${towerType.cost}积分）`;
            const towerText = this.add.text(0, 0, displayText, {
                fontSize: '28px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            buttonContainer.add(towerText);
            
            // 添加点击事件
            button.on('pointerdown', () => {
                if (this.gameState.score >= towerType.cost) {
                    this.selectedTowerType = towerType.type;
                    this.enterPlacementMode();
                    // 按钮点击效果
                    this.tweens.add({
                        targets: buttonContainer,
                        scaleX: 0.5,
                        scaleY: 0.5,
                        duration: 100,
                        yoyo: true,
                        ease: 'Power2'
                    });
                } else {
                    this.showMessage('积分不足！');
                }
            });

            // 悬停效果
            button.on('pointerover', () => {
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            button.on('pointerout', () => {
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            panelContainer.add(buttonContainer);
        });
        
        // 创建撤回区域 - 位于建塔按钮下方
        this.createCancelArea(panelContainer, width, height);
        
        // 添加到右侧容器
        this.rightContainer.add(panelContainer);
    }

    private createCancelArea(panelContainer: Phaser.GameObjects.Container, panelWidth: number, panelHeight: number): void {
        // 撤回区域的位置和尺寸
        const cancelAreaWidth = panelWidth - 40;
        const cancelAreaHeight = 60;
        const cancelAreaX = panelWidth / 2;
        const cancelAreaY = panelHeight - 80; // 距离面板底部80px
        
        // 创建撤回区域容器
        this.cancelArea = this.add.container(cancelAreaX, cancelAreaY);
        
        // 撤回区域背景
        const cancelBg = this.add.rectangle(0, 0, cancelAreaWidth, cancelAreaHeight, 0xff5252, 0.8);
        cancelBg.setStrokeStyle(3, 0xd32f2f);
        cancelBg.setRounded(15);
        this.cancelArea.add(cancelBg);
        
        // 撤回区域文本
        const cancelText = this.add.text(0, 0, '🗑️ 拖拽到这里取消建塔', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.cancelArea.add(cancelText);
        
        // 设置撤回区域的边界（用于碰撞检测）
        // 需要转换为全局坐标
        const globalX = this.rightContainer.x + panelContainer.x + cancelAreaX;
        const globalY = this.rightContainer.y + panelContainer.y + cancelAreaY;
        this.cancelAreaBounds = new Phaser.Geom.Rectangle(
            globalX - cancelAreaWidth / 2,
            globalY - cancelAreaHeight / 2,
            cancelAreaWidth,
            cancelAreaHeight
        );
        
        // 默认隐藏撤回区域
        this.cancelArea.setVisible(false);
        this.cancelArea.setAlpha(0.9);
        
        // 添加到面板容器
        panelContainer.add(this.cancelArea);
    }

    private createWaveInfoPanel(x: number, y: number, width: number, height: number): void {
        const panelContainer = this.add.container(x, y);
        
        // 面板背景
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        panelContainer.add(panelBg);
        
        // 面板标题
        const titleBg = this.add.rectangle(width/2, 25, width - 20, 35, 0x5c6bc0, 1);
        panelContainer.add(titleBg);
        
        const title = this.add.text(width/2, 25, '波次信息', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panelContainer.add(title);
        
        // 怪物信息
        const monsters = this.getWaveMonsters();
        let yOffset = 70;
        
        monsters.forEach(monster => {
            const monsterText = this.add.text(20, yOffset, `${monster.icon} ${monster.name}`, {
                fontSize: '32px',
                color: '#333333'
            });
            panelContainer.add(monsterText);
            
            const countText = this.add.text(width - 20, yOffset, `x${monster.count}`, {
                fontSize: '32px',
                color: '#333333',
                fontStyle: 'bold'
            }).setOrigin(1, 0);
            panelContainer.add(countText);
            
            yOffset += 40;
        });
        
        // 通关奖励
        const rewardBg = this.add.rectangle(width/2, height - 40, width - 40, 50, 0x4caf50, 1);
        panelContainer.add(rewardBg);
        
        const rewardText = this.add.text(width/2, height - 40, `通关奖励: ${30 * this.gameState.currentWave}积分`, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panelContainer.add(rewardText);
        
        // 添加到右侧容器
        this.rightContainer.add(panelContainer);
    }

    private setupEventListeners(): void {
        // 监听怪物死亡事件
        this.events.on('enemy-killed', (monster: Monster) => {
            this.onMonsterKilled(monster);
        });

        // 监听怪物到达终点事件
        this.events.on('enemy-reached-end', (monster: Monster) => {
            this.onMonsterReachedEnd(monster);
        });

        // 监听塔被点击事件
        this.events.on('tower-clicked', (tower: Tower) => {
            this.onTowerClicked(tower);
        });
    }

    private createTowerPlacementSystem(): void {
        // 创建放置指示器
        this.placementIndicator = this.add.image(0, 0, 'tower-arrow');
        this.placementIndicator.setAlpha(0.5);
        this.placementIndicator.setVisible(false);
        this.placementIndicator.setScale(0.2);
        
        // 创建范围指示器
        this.rangeIndicator = this.add.graphics();
        this.rangeIndicator.setVisible(false);
        
        // 监听鼠标移动
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.placementMode && this.placementIndicator) {
                // 检查是否在撤回区域
                if (this.cancelAreaBounds && this.cancelAreaBounds.contains(pointer.x, pointer.y)) {
                    // 在撤回区域内 - 高亮撤回区域
                    if (this.cancelArea) {
                        this.cancelArea.setScale(1.1);
                        this.cancelArea.setAlpha(1);
                    }
                    // 隐藏建塔指示器
                    this.placementIndicator.setVisible(false);
                    if (this.rangeIndicator) {
                        this.rangeIndicator.setVisible(false);
                    }
                } else {
                    // 不在撤回区域内 - 恢复正常状态
                    if (this.cancelArea) {
                        this.cancelArea.setScale(1);
                        this.cancelArea.setAlpha(0.9);
                    }
                    // 显示建塔指示器
                    this.placementIndicator.setVisible(true);
                    if (this.rangeIndicator) {
                        this.rangeIndicator.setVisible(true);
                    }
                    
                    // 计算游戏容器内的坐标
                    const gameContainerX = pointer.x;
                    const gameContainerY = pointer.y - LAYOUT_CONFIG.statusBarHeight;
                    
                    this.placementIndicator.setPosition(pointer.x, pointer.y);
                    
                    // 更新范围指示器
                    if (this.selectedTowerType && this.rangeIndicator) {
                        const towerType = TOWER_TYPES[this.selectedTowerType];
                        this.rangeIndicator.clear();
                        this.rangeIndicator.lineStyle(3, 0xff6666, 0.6);
                        this.rangeIndicator.fillStyle(0xff6666, 0.1);
                        // 使用全局坐标显示范围圆圈
                        this.rangeIndicator.strokeCircle(pointer.x, pointer.y, towerType.range);
                        this.rangeIndicator.fillCircle(pointer.x, pointer.y, towerType.range);
                    }
                }
            }
        });
        
        // 监听点击事件
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.placementMode && this.selectedTowerType) {
                // 检查是否在撤回区域内
                if (this.cancelAreaBounds && this.cancelAreaBounds.contains(pointer.x, pointer.y)) {
                    // 在撤回区域内点击 - 退出建塔模式
                    this.showMessage('已取消建塔');
                    this.exitPlacementMode();
                    return;
                }
                
                // 检查是否在游戏区域内（需要考虑游戏容器的偏移）
                const gameContainerX = pointer.x;
                const gameContainerY = pointer.y - LAYOUT_CONFIG.statusBarHeight; // 减去状态栏高度
                
                if (gameContainerX >= 0 && gameContainerX < this.gameAreaWidth && 
                    gameContainerY >= 0 && gameContainerY < this.gameAreaHeight) {
                    // 检查是否可以放置
                    if (this.canPlaceTower(gameContainerX, gameContainerY)) {
                        this.placeTower(gameContainerX, gameContainerY, this.selectedTowerType);
                        this.exitPlacementMode();
                    } else {
                        this.showMessage('不能在这里放置防御塔！');
                    }
                }
            }
        });
        
        // ESC键取消放置
        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.placementMode) {
                this.exitPlacementMode();
            }
        });
    }

    private enterPlacementMode(): void {
        this.placementMode = true;
        
        // 保持所有塔的范围显示，不隐藏已有塔的范围
        
        if (this.placementIndicator) {
            this.placementIndicator.setVisible(true);
        }
        if (this.rangeIndicator) {
            this.rangeIndicator.setVisible(true);
        }
        
        // 显示撤回区域
        if (this.cancelArea) {
            this.cancelArea.setVisible(true);
            // 添加显示动画
            this.tweens.add({
                targets: this.cancelArea,
                scaleX: { from: 0.8, to: 1 },
                scaleY: { from: 0.8, to: 1 },
                alpha: { from: 0.5, to: 0.9 },
                duration: 300,
                ease: 'Back.Out'
            });
        }
        
        console.log('进入塔放置模式');
    }

    private exitPlacementMode(): void {
        this.placementMode = false;
        this.selectedTowerType = null;
        
        if (this.placementIndicator) {
            this.placementIndicator.setVisible(false);
        }
        if (this.rangeIndicator) {
            this.rangeIndicator.setVisible(false);
            this.rangeIndicator.clear();
        }
        
        // 隐藏撤回区域
        if (this.cancelArea) {
            this.tweens.add({
                targets: this.cancelArea,
                scaleX: 0.8,
                scaleY: 0.8,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    if (this.cancelArea) {
                        this.cancelArea.setVisible(false);
                    }
                }
            });
        }
        
        // 恢复所有塔的范围显示
        this.restoreAllTowerRangeDisplays();
        
        console.log('退出塔放置模式');
    }

    private canPlaceTower(x: number, y: number): boolean {
        // 检查是否离路径太近
        for (let i = 0; i < this.path.length - 1; i++) {
            const dist = Phaser.Geom.Line.GetNearestPoint(
                new Phaser.Geom.Line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y),
                new Phaser.Geom.Point(x, y),
                new Phaser.Geom.Point()
            );
            if (Phaser.Math.Distance.Between(x, y, dist.x, dist.y) < 40) {
                return false;
            }
        }
        
        // 检查是否与其他塔重叠
        for (const tower of this.towers) {
            if (Phaser.Math.Distance.Between(x, y, tower.x, tower.y) < 60) {
                return false;
            }
        }
        
        return true;
    }

    private placeTower(x: number, y: number, type: string): void {
        const towerType = TOWER_TYPES[type];
        
        // 扣除积分
        this.gameState.score -= towerType.cost;
        this.updateUI();
        
        // 创建塔
        const tower = new Tower(this, x, y, towerType);
        tower.setScale(0.2); // 设置塔的缩放比例
        tower.setOrigin(0.5, 0.5);
        this.gameContainer.add(tower);
        this.towers.push(tower);
        
        // 默认显示攻击范围
        tower.showRangePermanently();
        
        console.log(`放置了${towerType.name}，攻击范围: ${towerType.range}像素`);
    }



    private clearAllTowerRangeDisplays(): void {
        // 清理所有塔的范围显示（仅在放置模式时使用）
        console.log('清理所有塔的范围显示');
        this.towers.forEach(tower => {
            tower.forceHideRange();
        });
    }

    private restoreAllTowerRangeDisplays(): void {
        // 恢复所有塔的范围显示
        console.log('恢复所有塔的范围显示');
        this.towers.forEach(tower => {
            tower.showRangePermanently();
        });
    }

    private generateQuestions(): void {
        // 根据年级和科目生成题目
        this.questionPool = [];
        const baseTime = Date.now();
        
        if (this.userConfig.subject === '数学') {
            // 生成数学题
            for (let i = 0; i < 20; i++) {
                const a = Phaser.Math.Between(1, 10);
                const b = Phaser.Math.Between(1, 10);
                const answer = a + b;
                
                const options = [answer];
                while (options.length < 4) {
                    const wrong = Phaser.Math.Between(2, 20);
                    if (!options.includes(wrong)) {
                        options.push(wrong);
                    }
                }
                
                // 打乱选项
                Phaser.Utils.Array.Shuffle(options);
                
                this.questionPool.push({
                    id: baseTime + i, // 生成唯一题目ID (基础时间戳+索引)
                    question: `${a} + ${b} = ?`,
                    options: options.map(o => o.toString()),
                    correct: answer.toString()
                });
            }
        }
        
        console.log(`生成了 ${this.questionPool.length} 道${this.userConfig.subject}题目`);
    }

    private showNextQuestion(): void {
        if (this.questionPool.length === 0) {
            this.generateQuestions();
        }
        
        // 随机选择一个问题
        const questionIndex = Phaser.Math.Between(0, this.questionPool.length - 1);
        this.currentQuestion = this.questionPool[questionIndex];
        this.questionPool.splice(questionIndex, 1);
        
        // 更新问题显示
        this.updateQuestionDisplay();
        
        this.questionActive = true;
        
        // 调试信息：显示当前题目ID
        if (this.currentQuestion?.id) {
            console.log(`显示题目 ID: ${this.currentQuestion.id}, 内容: ${this.currentQuestion.question}`);
        }
    }

    private updateQuestionDisplay(): void {
        if (!this.currentQuestion || !this.questionPanel) return;
        
        //只要更新问题 以及 选择按钮
        this.questionPanel.removeAll(true);

        const width = LAYOUT_CONFIG.rightContainerWidth;
        const height = this.singlePanelHeight;

        // 面板背景
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        // 设置面板背景为圆角
        panelBg.setRounded(20);
        this.questionPanel.add(panelBg);


        // 面板标题
        const titleBg = this.add.rectangle(width/2, 35, width - 20, 50, 0x5c6bc0, 1);
        titleBg.setRounded(20);
        this.questionPanel.add(titleBg);
        
        const title = this.add.text(width/2, 35, '问题', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.questionPanel.add(title);
        
                          // 题目，如果题目超长，则换行
          const questionText = this.add.text(width/2, 110, this.currentQuestion.question, {
              fontSize: '32px',
              color: '#333333',
              fontStyle: 'bold',
              align: 'center',
              wordWrap: { 
                  width: width - 40,  // 留出左右边距
                  useAdvancedWrap: true 
              }
          }).setOrigin(0.5, 0);  // 顶部居中对齐，便于多行显示
         this.questionPanel.add(questionText);
        

                 // 将下面按钮封装到一个容器中
         // 根据题目高度动态调整按钮位置
         const questionHeight = questionText.height;
         const buttonStartY = Math.max(180, 110 + questionHeight + 20); // 给题目留出足够空间
         const buttonContainer = this.add.container(0, buttonStartY);

                 // 选项按钮
         const buttonWidth = (width - 60) / 2;
         const buttonHeight = 60;
         const buttonSpacing = 15;
        
        this.currentQuestion.options.forEach((option: string, i: number) => {
             const row = Math.floor(i / 2);
             const col = i % 2;
             const btnX = 20 + col * (buttonWidth + 20) + buttonWidth/2;
             const btnY = row * (buttonHeight + buttonSpacing) + buttonHeight/2;
            
            const button = this.add.rectangle(btnX, btnY, buttonWidth, buttonHeight, 0x4fc3f7, 1);
            button.setStrokeStyle(2, 0x2196f3);
            button.setInteractive({ useHandCursor: true });
            button.setRounded(20);
            buttonContainer.add(button);
            
                                      const buttonText = this.add.text(btnX, btnY, option, {
                  fontSize: '32px',
                  color: '#ffffff',
                  fontStyle: 'bold',
                  align: 'center',
                  wordWrap: { 
                      width: buttonWidth - 20,
                      useAdvancedWrap: true 
                  }
              }).setOrigin(0.5);
            buttonContainer.add(buttonText);
            
            // 添加点击事件
            button.on('pointerdown', () => {
                if (this.questionActive) {
                    this.checkAnswer(option);
                    button.setFillStyle(0x2196f3);
                    this.time.delayedCall(100, () => {
                        button.setFillStyle(0x4fc3f7);
                    });
                }
            });
        });

        this.questionPanel.add(buttonContainer);

    }

    private checkAnswer(answer: string): void {
        if (!this.currentQuestion || !this.questionActive) return;
        
        this.questionActive = false;
        
        // 记录题目ID
        if (this.currentQuestion.id !== undefined) {
            const questionId = this.currentQuestion.id.toString();
            this.answeredQuestionIds.push(questionId);
            
            if (answer !== this.currentQuestion.correct) {
                // 记录错误题目ID
                this.wrongQuestionIds.push(questionId);
            }
        }
        
        if (answer === this.currentQuestion.correct) {
            // 正确答案
            this.gameState.correctAnswers++;
            this.gameState.combo++;
            if (this.gameState.combo > this.gameState.maxCombo) {
                this.gameState.maxCombo = this.gameState.combo;
            }
            
            // 奖励积分
            const bonus = 20 + (this.gameState.combo * 5);
            this.gameState.score += bonus;
            
            this.showMessage(`正确! +${bonus}积分`);
        } else {
            // 错误答案
            this.gameState.combo = 0;
            this.showMessage('错误!');
        }
        
        this.gameState.totalQuestions++;
        this.updateUI();
        
        // 2秒后显示下一题
        this.time.delayedCall(TIMING_CONFIG.nextQuestionDelay, () => {
            this.showNextQuestion();
        });
    }

    private showMessage(text: string): void {
        const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // 淡出动画
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: 1500,
            onComplete: () => {
                message.destroy();
            }
        });
    }

    private showTowerInfo(tower: Tower): void {
        // 计算塔在屏幕上的实际位置 (考虑游戏容器的偏移)
        const towerWorldX = tower.x;
        const towerWorldY = tower.y + LAYOUT_CONFIG.statusBarHeight; // 加上状态栏高度
        
        // 创建信息面板
        const infoPanel = this.add.container(towerWorldX, towerWorldY - 80);
        
        // 背景
        const background = this.add.rectangle(0, 0, 200, 120, 0x000000, 0.8);
        background.setStrokeStyle(2, 0xffffff, 0.5);
        background.setRounded(10);
        
        // 塔信息文本
        const infoText = this.add.text(0, 0, tower.getInfo(), {
            fontSize: '24px',
            color: '#ffffff',
            align: "left",
            wordWrap: { width: 180, useAdvancedWrap: true }
        }).setOrigin(0.5);
        
        infoPanel.add([background, infoText]);
        
        // 确保信息面板在最上层
        infoPanel.setDepth(1000);
        
        // 3秒后自动消失
        this.tweens.add({
            targets: infoPanel,
            alpha: 0,
            y: infoPanel.y - 20,
            duration: 2000,
            delay: 1000,
            onComplete: () => {
                infoPanel.destroy();
            }
        });
    }

    private getWaveMonsters(): Array<{icon: string, name: string, count: number, type: string}> {
        // 使用配置文件中的波次配置
        return getWaveMonsters(this.gameState.currentWave);
    }

    private startWave(): void {
        if (this.waveInProgress) return;
        
        this.waveInProgress = true;
        this.currentWaveEnemies = [];
        
        // 生成本波敌人列表
        const monsters = this.getWaveMonsters();
        monsters.forEach(monster => {
            for (let i = 0; i < monster.count; i++) {
                this.currentWaveEnemies.push(monster.type);
            }
        });
        
        // 打乱敌人出现顺序，增加游戏的随机性
        Phaser.Utils.Array.Shuffle(this.currentWaveEnemies);
        
        console.log(`第${this.gameState.currentWave}波开始! 怪物数量: ${this.currentWaveEnemies.length}`);
        console.log('怪物类型:', this.currentWaveEnemies);
        
        // 开始生成敌人
        let enemyIndex = 0;
        this.enemySpawnTimer = this.time.addEvent({
            delay: TIMING_CONFIG.enemySpawnInterval, // 使用配置文件中的生成间隔
            callback: () => {
                // 检查游戏是否结束或暂停
                if (this.gameState.health <= 0 || this.gameState.isPaused) {
                    this.enemySpawnTimer?.remove();
                    this.enemySpawnTimer = undefined;
                    console.log('游戏结束，停止生成怪物');
                    return;
                }
                
                if (enemyIndex < this.currentWaveEnemies.length) {
                    this.spawnEnemy(this.currentWaveEnemies[enemyIndex]);
                    enemyIndex++;
                } else {
                    this.enemySpawnTimer?.remove();
                    this.enemySpawnTimer = undefined;
                    console.log(`第${this.gameState.currentWave}波所有怪物已生成完毕`);
                }
            },
            repeat: this.currentWaveEnemies.length - 1
        });
    }

    private spawnEnemy(type: string): void {
        const enemyType = ENEMY_TYPES[type];
        
        // 创建怪物
        const monster = new Monster(this, this.path[0].x, this.path[0].y, enemyType, this.path);
        monster.setScale(0.2); // 设置怪物的缩放比例
        this.gameContainer.add(monster);
        this.enemies.push(monster);
    }

    private onMonsterKilled(monster: Monster): void {
        // 奖励积分
        this.gameState.score += monster.enemyType.reward || 10;
        this.updateUI();
        
        // 创建爆炸效果
        this.createExplosion(monster.x, monster.y);
        
        // 移除怪物
        const index = this.enemies.indexOf(monster);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        monster.destroy();
        
        // 检查是否波次结束
        if (this.enemies.length === 0 && this.waveInProgress) {
            this.onWaveComplete();
        }
    }

    private onMonsterReachedEnd(monster: Monster): void {
        // 扣除生命值
        this.gameState.health--;
        this.updateUI();
        
        // 移除怪物
        const index = this.enemies.indexOf(monster);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        monster.destroy();
        
        // 检查游戏是否结束
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
        
        // 检查波次是否结束
        if (this.enemies.length === 0 && this.waveInProgress) {
            this.onWaveComplete();
        }
    }

    private onTowerClicked(tower: Tower): void {
        // 显示塔的信息或升级选项
        this.showTowerInfo(tower);
    }

    private createExplosion(x: number, y: number): void {
        // 创建简单的爆炸效果
        for (let i = 0; i < 10; i++) {
            const particle = this.add.circle(x, y, 5, 0xffff00);
            
            const angle = (Math.PI * 2 / 10) * i;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    private onWaveComplete(): void {
        this.waveInProgress = false;
        
        // 检查游戏是否已结束
        if (this.gameState.health <= 0 || this.gameState.isPaused) {
            console.log('游戏已结束，不开始新波次');
            return;
        }
        
        // 波次奖励
        const waveBonus = 30 * this.gameState.currentWave;
        this.gameState.score += waveBonus;
        this.showMessage(`波次完成! +${waveBonus}积分`);
        
        // 准备下一波
        if (this.gameState.currentWave < this.gameState.totalWaves) {
            this.gameState.currentWave++;
            this.updateUI();
            
            // 5秒后开始下一波
            this.time.delayedCall(TIMING_CONFIG.waveCooldown, () => {
                // 再次检查游戏状态
                if (this.gameState.health > 0 && !this.gameState.isPaused) {
                    this.startWave();
                } else {
                    console.log('延迟开始新波次时，发现游戏已结束');
                }
            });
        } else {
            // 关卡完成
            this.onLevelComplete();
        }
    }

    private async onLevelComplete(): Promise<void> {
        this.showMessage('关卡完成!');
        
        // 暂停游戏，防止继续操作
        this.gameState.isPaused = true;
        
        // 清除所有延迟调用和定时器，确保没有自动跳转
        this.time.removeAllEvents();
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove();
            this.enemySpawnTimer = undefined;
        }
        
        try {
            // 准备游戏完成数据
            const completionData: GameCompletionData = {
                userId: gameState.userId, // 从游戏状态获取真实userId
                subject: this.userConfig.subject,
                grade: this.userConfig.grade,
                category: this.userConfig.category,
                questionIds: this.answeredQuestionIds, // 从游戏中收集的所有题目ID
                wrongQuestionIds: this.wrongQuestionIds, // 从游戏中收集的错误题目ID
                completionTime: Date.now() - this.completionStartTime,
                score: this.gameState.score,
                comboCount: this.gameState.maxCombo
            };
            
            // 输出题目收集数据用于调试
            console.log('游戏完成数据:', {
                总题目数: this.answeredQuestionIds.length,
                回答的题目IDs: this.answeredQuestionIds,
                错误题目数: this.wrongQuestionIds.length,
                错误题目IDs: this.wrongQuestionIds,
                正确率: this.gameState.totalQuestions > 0 ? 
                    Math.round((this.gameState.correctAnswers / this.gameState.totalQuestions) * 100) + '%' : '0%'
            });
            
            // 调用API保存通关记录并获取奖励
            const response = await saveGameCompletion(completionData);
            
            // 显示奖励对话框
            this.showRewardDialog(response.reward, response.stats);
            
        } catch (error) {
            console.error('保存通关记录失败:', error);
            this.showMessage('保存记录失败，但游戏已完成！');
            
            // 即使保存失败，也显示完成对话框让用户确认
            this.showRewardDialog(null, {
                totalCompletions: 0,
                experienceGained: 0,
                coinsGained: 0
            });
        }
    }

    private updateUI(): void {
        this.healthText.setText(`❤️ 生命值: ${this.gameState.health}`);
        this.scoreText.setText(`💰 积分: ${this.gameState.score}`);
        this.comboText.setText(`⚡ 连击: ${this.gameState.combo}`);
        this.levelText.setText(
            `第${this.gameState.currentLevel}关: ${this.userConfig.category} | ` +
            `关卡${this.gameState.currentLevel}/${this.gameState.totalLevels} | ` +
            `第${this.gameState.currentWave}波 (${this.gameState.currentWave}/${this.gameState.totalWaves})`
        );
        
        // 更新塔按钮状态
        this.updateTowerButtonStates();
    }

    private updateTowerButtonStates(): void {
        // 遍历所有塔类型，根据积分更新按钮状态
        Object.keys(TOWER_TYPES).forEach(towerType => {
            const towerData = TOWER_TYPES[towerType];
            const button = this.towerButtons[towerType];
            
            if (button) {
                if (this.gameState.score >= towerData.cost) {
                    // 积分够，按钮正常显示
                    button.setAlpha(1);
                    button.setInteractive({ useHandCursor: true });
                } else {
                    // 积分不够，按钮变淡且不可点击
                    button.setAlpha(0.4);
                    button.disableInteractive();
                }
            }
        });
    }

    update(time: number, delta: number): void {
        // 如果游戏已暂停或结束，停止更新
        if (this.gameState.isPaused || this.gameState.health <= 0) {
            return;
        }
        
        // 更新怪物
        this.enemies.forEach(monster => {
            monster.update(delta, this.gameState.gameSpeed);
        });
        
        // 更新塔的攻击
        this.towers.forEach(tower => {
            const target = tower.findTarget(this.enemies);
            if (target) {
                const projectile = tower.attack(target, time);
                if (projectile) {
                    this.gameContainer.add(projectile);
                    this.projectiles.push(projectile);
                }
            }
        });
        
        // 更新投射物
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.update(delta)) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    private gameOver(): void {
        // 暂停游戏
        this.gameState.isPaused = true;
        
        // 停止波次进程
        this.waveInProgress = false;
        
        // 停止所有定时器
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove();
            this.enemySpawnTimer = undefined;
        }
        
        // 清除所有延迟调用（防止开始新波次）
        this.time.removeAllEvents();
        
        console.log('游戏结束：已停止所有怪物生成和波次进程');
        
        // 显示游戏结束对话框
        this.showGameOverDialog();
    }

    private showGameOverDialog(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建对话框容器
        this.gameOverDialog = this.add.container(width / 2, height / 2);
        
        // 半透明背景遮罩 - 阻止点击穿透
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0.5);
        overlay.setInteractive(); // 阻止点击穿透
        this.gameOverDialog.add(overlay);
        
        // 对话框背景
        const dialogWidth = 500;
        const dialogHeight = 350;
        const dialogBg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0xffffff, 1);
        dialogBg.setStrokeStyle(4, 0xe0e0e0);
        dialogBg.setRounded(20);
        this.gameOverDialog.add(dialogBg);
        
        // 标题
        const titleBg = this.add.rectangle(0, -120, dialogWidth - 20, 60, 0xff5252, 1);
        titleBg.setRounded(15);
        this.gameOverDialog.add(titleBg);
        
        const title = this.add.text(0, -120, '💀 游戏结束', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.gameOverDialog.add(title);
        
        // 游戏数据统计
        const stats = [
            `🏆 最终得分: ${this.gameState.score}`,
            `⚡ 最大连击: ${this.gameState.maxCombo}`,
            `📊 正确率: ${this.gameState.totalQuestions > 0 ? 
                Math.round((this.gameState.correctAnswers / this.gameState.totalQuestions) * 100) : 0}%`,
            `🌊 到达波次: ${this.gameState.currentWave}`
        ];
        
        stats.forEach((stat, i) => {
            const statText = this.add.text(0, -50 + i * 35, stat, {
                fontSize: '24px',
                color: '#333333',
                align: 'center'
            }).setOrigin(0.5);
            this.gameOverDialog!.add(statText);
        });
        
        // 按钮容器
        const buttonContainer = this.add.container(0, 100);
        
        // 重新闯关按钮
        const retryButton = this.add.rectangle(-120, 0, 200, 60, 0x4caf50, 1);
        retryButton.setStrokeStyle(3, 0x388e3c);
        retryButton.setRounded(15);
        retryButton.setInteractive({ useHandCursor: true });
        buttonContainer.add(retryButton);
        
        const retryText = this.add.text(-120, 0, '🔄 重新闯关', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(retryText);
        
        // 退出按钮
        const exitButton = this.add.rectangle(120, 0, 200, 60, 0xff5722, 1);
        exitButton.setStrokeStyle(3, 0xd84315);
        exitButton.setRounded(15);
        exitButton.setInteractive({ useHandCursor: true });
        buttonContainer.add(exitButton);
        
        const exitText = this.add.text(120, 0, '🚪 退出游戏', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(exitText);
        
        this.gameOverDialog.add(buttonContainer);
        
        // 按钮事件
        retryButton.on('pointerdown', () => {
            this.restartGame();
        });
        
        retryButton.on('pointerover', () => {
            this.tweens.add({
                targets: retryButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        retryButton.on('pointerout', () => {
            this.tweens.add({
                targets: retryButton,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        exitButton.on('pointerdown', () => {
            this.exitGame();
        });
        
        exitButton.on('pointerover', () => {
            this.tweens.add({
                targets: exitButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        exitButton.on('pointerout', () => {
            this.tweens.add({
                targets: exitButton,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        // 设置对话框的深度，确保在最上层
        this.gameOverDialog.setDepth(10000);
        
        // 显示动画
        this.gameOverDialog.setAlpha(0);
        this.gameOverDialog.setScale(0.8);
        this.tweens.add({
            targets: this.gameOverDialog,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.Out'
        });
    }

    private restartGame(): void {
        // 重新开始当前关卡
        this.scene.restart({
            subject: this.userConfig.subject,
            grade: this.userConfig.grade,
            category: this.userConfig.category,
            userLevel: this.userConfig.userLevel
        });
    }

    private exitGame(): void {
        // 返回关卡选择界面
        this.scene.start('LevelSelectScene', {
            subject: this.userConfig.subject,
            grade: this.userConfig.grade
        });
    }

    private showRewardDialog(reward: Reward | null, stats: any): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建奖励对话框容器
        this.rewardDialog = this.add.container(width / 2, height / 2);
        
        // 半透明背景遮罩 - 不可点击穿透，确保用户必须点击按钮
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0.5);
        overlay.setInteractive(); // 阻止点击穿透
        this.rewardDialog.add(overlay);
        
        // 对话框背景
        const dialogWidth = 600;
        const dialogHeight = 480; // 增加高度以容纳更多内容
        const dialogBg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0xffffff, 1);
        dialogBg.setStrokeStyle(4, 0xffd700);
        dialogBg.setRounded(20);
        this.rewardDialog.add(dialogBg);
        
        // 标题
        const titleBg = this.add.rectangle(0, -170, dialogWidth - 20, 60, 0x4caf50, 1);
        titleBg.setRounded(15);
        this.rewardDialog.add(titleBg);
        
        const title = this.add.text(0, -170, '🎉 通关成功！', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.rewardDialog.add(title);
        
        // 游戏统计
        const gameStats = [
            `🏆 最终得分: ${this.gameState.score}`,
            `⚡ 最大连击: ${this.gameState.maxCombo}`,
            `📊 正确率: ${this.gameState.totalQuestions > 0 ? 
                Math.round((this.gameState.correctAnswers / this.gameState.totalQuestions) * 100) : 100}%`,
            `⏱️ 完成时间: ${this.formatTime(Date.now() - this.completionStartTime)}`
        ];
        
        gameStats.forEach((stat, i) => {
            const statText = this.add.text(0, -100 + i * 30, stat, {
                fontSize: '24px',
                color: '#333333',
                align: 'center'
            }).setOrigin(0.5);
            this.rewardDialog!.add(statText);
        });
        
        // 奖励内容
        if (reward) {
            const rewardY = 20;
            
            // 奖励图标和文本
            let rewardIcon = '';
            let rewardText = '';
            let rewardColor = '#4caf50';
            
            if (reward.type === 'flower') {
                rewardIcon = '🌸';
                rewardText = `获得新花朵！\n${reward.item.subject}年级${reward.item.grade} ${reward.item.category}`;
                rewardColor = '#e91e63';
            } else if (reward.type === 'nectar') {
                rewardIcon = '🍯';
                rewardText = `获得甘露！\n${reward.item.subject}年级${reward.item.grade} ${reward.item.category}\n恢复${reward.item.healingPower}HP`;
                rewardColor = '#ff9800';
            }
            
            const rewardIconText = this.add.text(0, rewardY - 30, rewardIcon, {
                fontSize: '48px'
            }).setOrigin(0.5);
            this.rewardDialog.add(rewardIconText);
            
            const rewardDesc = this.add.text(0, rewardY + 20, rewardText, {
                fontSize: '24px',
                color: rewardColor,
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            this.rewardDialog.add(rewardDesc);
            
            const rewardMessage = this.add.text(0, rewardY + 70, reward.item.message, {
                fontSize: '20px',
                color: '#666666',
                align: 'center',
                wordWrap: { width: dialogWidth - 40, useAdvancedWrap: true }
            }).setOrigin(0.5);
            this.rewardDialog.add(rewardMessage);
        } else {
            const noRewardText = this.add.text(0, 20, '继续努力，更多奖励等着你！', {
                fontSize: '24px',
                color: '#666666',
                align: 'center'
            }).setOrigin(0.5);
            this.rewardDialog.add(noRewardText);
        }
        
        // 操作提示
        const actionTip = this.add.text(0, 120, '请选择下一步操作：', {
            fontSize: '22px',
            color: '#666666',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.rewardDialog.add(actionTip);
        
        // 按钮容器
        const buttonContainer = this.add.container(0, 160);
        
        // 继续游戏按钮
        const continueButton = this.add.rectangle(-120, 0, 200, 60, 0x2196f3, 1);
        continueButton.setStrokeStyle(3, 0x1976d2);
        continueButton.setRounded(15);
        continueButton.setInteractive({ useHandCursor: true });
        buttonContainer.add(continueButton);
        
        const continueText = this.add.text(-120, 0, '🏠 返回主页', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(continueText);
        
        // 查看花园按钮
        const gardenButton = this.add.rectangle(120, 0, 200, 60, 0x4caf50, 1);
        gardenButton.setStrokeStyle(3, 0x388e3c);
        gardenButton.setRounded(15);
        gardenButton.setInteractive({ useHandCursor: true });
        buttonContainer.add(gardenButton);
        
        const gardenText = this.add.text(120, 0, '🌸 查看花园', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(gardenText);
        
        this.rewardDialog.add(buttonContainer);
        
        // 按钮事件
        continueButton.on('pointerdown', () => {
            this.returnToLevelSelect();
        });
        
        gardenButton.on('pointerdown', () => {
            this.goToGarden();
        });
        
        // 悬停效果
        [continueButton, gardenButton].forEach(button => {
            button.on('pointerover', () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });
            
            button.on('pointerout', () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
        });
        
        // 设置对话框的深度，确保在最上层
        this.rewardDialog.setDepth(10001);
        
        // 显示动画
        this.rewardDialog.setAlpha(0);
        this.rewardDialog.setScale(0.8);
        this.tweens.add({
            targets: this.rewardDialog,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.Out'
        });
    }

    private formatTime(timeMs: number): string {
        const seconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}分${remainingSeconds}秒`;
        }
        return `${remainingSeconds}秒`;
    }

    private returnToLevelSelect(): void {
        this.scene.start('LevelSelectScene', {
            subject: this.userConfig.subject,
            grade: this.userConfig.grade
        });
    }

    private goToGarden(): void {
        // TODO: 跳转到花园场景
        this.scene.start('GardenScene', {
            subject: this.userConfig.subject,
            grade: this.userConfig.grade
        });
    }
}