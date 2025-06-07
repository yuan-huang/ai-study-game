import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { UserConfig, TowerDefenseGameState, Question } from '@/types/towerDefenseScene';
import { TowerDefenseManager } from '@/towerDefenseManager/TowerDefenseManager';
import { Monster } from '@/entities/TowerDefense/Monster';
import { Tower } from '@/entities/TowerDefense/Tower';
import { createText, TextStyles } from '@/config/PhaserFontConfig';

export class TowerDefenseSceneRefactored extends BaseScene {
    private gameState!: TowerDefenseGameState;
    private userConfig!: UserConfig;
    private towerDefenseManager!: TowerDefenseManager;
    
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
    private questionAnsweredIncorrectly = false; // 标记当前题目是否已经答错过
    
    // 波次管理
    private currentWaveEnemies: string[] = [];
    private enemySpawnTimer?: Phaser.Time.TimerEvent;
    private waveInProgress = false;
    
    // 游戏区域大小
    private gameAreaWidth = 1400;
    private gameAreaHeight = 1000;
    
    // 布局尺寸属性
    private singlePanelHeight: number = 0;
    private rightContainerWidth: number = 500;
    private statusBarHeight: number = 60;
    
    // 塔按钮引用
    private towerButtons: { [key: string]: Phaser.GameObjects.Rectangle } = {};
    
    // 撤回区域相关
    private cancelArea?: Phaser.GameObjects.Container;
    private cancelAreaBounds?: Phaser.Geom.Rectangle;
    
    // 游戏结束对话框
    private gameOverDialog: Phaser.GameObjects.Container | undefined;

    constructor() {
        super('TowerDefenseSceneRefactored');
    }

    init(data: { 
        subject: string, 
        grade: number,
        category: string,
        userLevel: number
    }): void {
        console.log("TowerDefenseSceneRefactored init:", data);
        this.userConfig = {
            grade: data.grade,
            subject: data.subject,
            category: data.category,
            userLevel: data.userLevel || 1,
        }
        super.init();
        this.initGameState();
    }

    private initGameState(): void {
        this.gameState = {
            health: 10,
            score: 100, 
            combo: 0,
            maxCombo: 0,
            currentWave: 1,
            totalWaves: 5,
            isPlaying: false,
            isPaused: false,
            gameSpeed: 1,
            correctAnswers: 0,
            totalQuestions: 0,
            currentLevel: 1,
            levelProgress: 0,
            questionsPerLevel: 10,
            totalLevels: 10
        };
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

    async create(): Promise<void> {
        super.create();
        
        // 游戏背景
        const bg = this.add.image(0, 0, 'towerDefense-bg').setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        bg.setDepth(0);

        // 显示加载提示
        const loadingText = createText(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '正在加载题目...',
            'TITLE_MEDIUM',
            {
                fontSize: 36,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 30, y: 15 }
            }
        ).setOrigin(0.5);

        // 添加加载动画效果
        this.tweens.add({
            targets: loadingText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2.easeInOut'
        });

        // 创建容器结构
        this.createContainers();
        
        // 初始化管理器
        this.initializeManager();
        
        try {
            // 等待题目加载完成
            console.log('🔤 开始加载题目...');
            await this.towerDefenseManager.generateQuestions();
            console.log('✅ 题目加载完成');
            
            // 移除加载提示
            loadingText.destroy();
            
            // 创建UI
            this.createUI();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 初始化UI状态
            this.updateUI();
            
            // 显示第一个问题
            this.showNextQuestion();
            
            // 显示游戏开始提示
            this.showMessage('游戏开始！准备迎接挑战！');
            
            // 开始第一波
            this.time.delayedCall(3000, () => {
                this.startWave();
            });
            
        } catch (error) {
            console.error('❌ 题目加载失败:', error);
            
            // 更新加载提示为错误信息
            loadingText.setText('题目加载失败，请重试')
                      .setStyle({
                          fontSize: 32,
                          color: '#ff5252',
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: { x: 30, y: 15 }
                      });
            
            // 3秒后返回关卡选择
            this.time.delayedCall(3000, () => {
                this.scene.start('LevelSelectScene', {
                    subject: this.userConfig.subject,
                    grade: this.userConfig.grade
                });
            });
        }
    }

    private createContainers(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 布局常量定义
        this.statusBarHeight = 60;
        this.rightContainerWidth = 700;
        const gameContainerWidth = width - this.rightContainerWidth;
        const mainContentHeight = height - this.statusBarHeight;

        // 1. 任务状态栏容器 (顶部)
        this.statusBarContainer = this.add.container(0, 0);

        // 2. 左边游戏容器
        this.gameContainer = this.add.container(0, this.statusBarHeight);
        this.gameAreaWidth = gameContainerWidth;
        this.gameAreaHeight = mainContentHeight;

        // 3. 右边答题容器
        this.rightContainer = this.add.container(gameContainerWidth, this.statusBarHeight);
    }

    private initializeManager(): void {
        // 初始化塔防管理器
        this.towerDefenseManager = new TowerDefenseManager(
            this,
            this.gameContainer,
            this.gameState,
            this.userConfig,
            this.gameAreaWidth,
            this.gameAreaHeight
        );
        
        // 初始化路径
        this.towerDefenseManager.initializePath();
    }

    private createUI(): void {
        this.createStatusBar();
        this.createRightPanels();
    }

    private createStatusBar(): void {
        const width = this.cameras.main.width;

        // 状态栏背景
        const statusBg = this.add.rectangle(width/2, this.statusBarHeight/2, width, this.statusBarHeight, 0x6c5ce7, 0.9);
        
        // 生命值
        this.healthText = createText(
            this, 
            20, 
            this.statusBarHeight/2, 
            `❤️ 生命值: ${this.gameState.health}`, 
            'UI_TEXT',
            {
                fontSize: 32,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // 积分
        this.scoreText = createText(
            this, 
            width * 0.25, 
            this.statusBarHeight/2, 
            `💰 积分: ${this.gameState.score}`, 
            'NUMBER_TEXT',
            {
                fontSize: 32,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // 连击
        this.comboText = createText(
            this, 
            width * 0.45, 
            this.statusBarHeight/2, 
            `⚡ 连击: ${this.gameState.combo}`, 
            'NUMBER_TEXT',
            {
                fontSize: 32,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // 关卡信息
        this.levelText = createText(
            this, 
            width * 0.65, 
            this.statusBarHeight/2, 
            `第${this.gameState.currentLevel}关: ${this.userConfig.category} | ` +
            `关卡${this.gameState.currentLevel}/${this.gameState.totalLevels} | ` +
            `第${this.gameState.currentWave}波 (${this.gameState.currentWave}/${this.gameState.totalWaves})`, 
            'LABEL_TEXT',
            {
                fontSize: 32,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // 结束按钮
        const endButtonWidth = 120;
        const endButtonHeight = 40;
        const endButtonX = width - endButtonWidth/2 - 20;
        const endButtonY = this.statusBarHeight/2;
        
        const endButton = this.add.rectangle(endButtonX, endButtonY, endButtonWidth, endButtonHeight, 0xff5252, 1);
        endButton.setStrokeStyle(2, 0xd32f2f);
        endButton.setRounded(10);
        endButton.setInteractive({ useHandCursor: true });
        
        const endButtonText = createText(
            this, 
            endButtonX, 
            endButtonY, 
            '🚪 结束', 
            'BUTTON_TEXT',
            {
                fontSize: 28,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // 结束按钮点击事件
        endButton.on('pointerdown', () => {
            this.gameOver();
        });
        
        // 添加到状态栏容器
        this.statusBarContainer.add([statusBg, this.healthText, this.scoreText, this.comboText, this.levelText, endButton, endButtonText]);
    }

    private createRightPanels(): void {
        const mainContentHeight = this.cameras.main.height - this.statusBarHeight;
        const panelSpacing = 20;
        
        this.singlePanelHeight = (mainContentHeight - panelSpacing * 2) / 2;

        // 1. 答题子容器
        this.createQuestionPanel(10, 10, this.rightContainerWidth, this.singlePanelHeight);
        
        // 2. 塔容器  
        this.createTowerPanel(10, this.singlePanelHeight + panelSpacing, this.rightContainerWidth, this.singlePanelHeight);
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
        
        const title = createText(
            this, 
            width/2, 
            25, 
            '回答问题得积分', 
            'TITLE_SMALL',
            {
                fontSize: 32,
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.questionPanel.add(title);
        
        // 添加等待题目的提示
        const waitingText = createText(
            this,
            width/2,
            height/2,
            '题目准备中...',
            'BODY_TEXT',
            {
                fontSize: 24,
                color: '#666666',
                align: 'left'
            }
        ).setOrigin(0.5);
        this.questionPanel.add(waitingText);
        
        // 添加到右侧容器
        this.rightContainer.add(this.questionPanel);
    }

    private createTowerPanel(x: number, y: number, width: number, height: number): void {
        const panelContainer = this.add.container(x, y);
        
        // 面板背景
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        panelBg.setRounded(20);
        panelContainer.add(panelBg);
        
        // 面板标题
        const titleBg = this.add.rectangle(width/2, 35, width - 20, 50, 0x66bb6a, 1);
        titleBg.setRounded(20);
        panelContainer.add(titleBg);
        
        const title = createText(
            this, 
            width/2, 
            35, 
            '建造防御塔', 
            'TITLE_SMALL',
            {
                fontSize: 32,
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        panelContainer.add(title);
        
        // 从管理器获取塔类型配置
        const towerTypes = this.towerDefenseManager.getTowerTypes();
        const towerColors: { [key: string]: number } = {
            'tower-arrow': 0x8d6e63,
            'tower-poison': 0x9c27b0,
            'tower-freeze': 0x42a5f5,
            'tower-laser': 0xffa726
        };
        
        const towerArray = Object.values(towerTypes);
        const buttonWidth = (width - 80) / 2;
        const buttonHeight = 80;
        const buttonSpacing = 20;
        const startY = 80;
        
        towerArray.forEach((towerType, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const btnX = 30 + col * (buttonWidth + buttonSpacing);
            const btnY = startY + row * (buttonHeight + buttonSpacing);
            
            const buttonContainer = this.add.container(btnX + buttonWidth/2, btnY + buttonHeight/2);

            const buttonColor = towerColors[towerType.type] || 0x888888;
            const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, buttonColor, 1);
            button.setStrokeStyle(3, 0x666666);
            button.setInteractive({ useHandCursor: true });
            button.setRounded(15);
            buttonContainer.add(button);
            
            this.towerButtons[towerType.type] = button;
            
            const displayText = `${towerType.icon} ${towerType.name} （${towerType.cost}积分）`;
            const towerText = createText(
                this, 
                0, 
                0, 
                displayText, 
                'BUTTON_TEXT',
                {
                    fontSize: 28,
                    fontStyle: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5);
            buttonContainer.add(towerText);
            
            // 添加点击事件
            button.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number, event: Phaser.Types.Input.EventData) => {
                console.log(`点击塔按钮: ${towerType.type}，成本: ${towerType.cost}，当前积分: ${this.gameState.score}`);
                
                // 阻止事件冒泡，防止触发TowerManager的全局点击监听器
                event.stopPropagation();
                
                if (this.gameState.score >= towerType.cost) {
                    console.log(`积分足够，进入放置模式`);
                    this.towerDefenseManager.enterPlacementMode(towerType.type);
                } else {
                    console.log(`积分不足，无法进入放置模式`);
                    this.showMessage('积分不足！');
                }
            });

            panelContainer.add(buttonContainer);
        });
        
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

        // 监听积分变化事件
        this.events.on('score-changed', (newScore: number) => {
            console.log(`积分变化事件：${this.gameState.score} -> ${newScore}`);
            this.gameState.score = newScore;
            this.updateUI();
        });

        // 监听积分不足事件
        this.events.on('insufficient-score', () => {
            this.showMessage('积分不足！');
        });

        // 监听无效放置事件
        this.events.on('invalid-placement', () => {
            this.showMessage('不能在这里放置防御塔！');
        });
    }

    private showNextQuestion(): void {
        this.currentQuestion = this.towerDefenseManager.getNextQuestion();
        if (this.currentQuestion) {
            this.updateQuestionDisplay();
            this.questionActive = true;
            this.questionAnsweredIncorrectly = false; // 重置错误标记
        }
        console.log('currentQuestion', this.currentQuestion);
    }

    private updateQuestionDisplay(showResult: boolean = false, isCorrect?: boolean): void {
        if (!this.currentQuestion || !this.questionPanel) return;
        
        this.questionPanel.removeAll(true);

        const width = this.rightContainerWidth;
        const height = this.singlePanelHeight;

        // 面板背景
        const panelBg = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0.95);
        panelBg.setStrokeStyle(2, 0xe0e0e0);
        panelBg.setRounded(20);
        this.questionPanel.add(panelBg);

        // 面板标题
        const titleBg = this.add.rectangle(width/2, 35, width - 20, 50, 0x5c6bc0, 1);
        titleBg.setRounded(20);
        this.questionPanel.add(titleBg);
        
        const title = createText(
            this, 
            width/2, 
            35, 
            '问题', 
            'TITLE_SMALL',
            {
                fontSize: 32,
                color: '#ffffff',
                fontStyle: 'bold',
                padding: { x: 20, y: 10 },
                align: 'left'
            }
        ).setOrigin(0.5);
        this.questionPanel.add(title);
        
        // 题目
        const questionText = createText(
            this, 
            width/2, 
            110, 
            this.currentQuestion.question, 
            'BODY_TEXT',
            {
                fontSize: 32,
                color: '#333333',
                fontStyle: 'bold',
                align: 'left',
                wordWrap: { 
                    width: width - 40,
                    useAdvancedWrap: true 
                }
            }
        ).setOrigin(0.5, 0);
        this.questionPanel.add(questionText);

        // 按钮容器
        const questionHeight = questionText.height;
        const buttonStartY = Math.max(180, 110 + questionHeight + 20);
        const buttonContainer = this.add.container(0, buttonStartY);

        // 选项按钮 - 垂直排列，一行一个答案
        const buttonWidth = width - 40; // 占据整个宽度减去左右边距
        const buttonHeight = 50;
        const buttonSpacing = 12;
        
        this.currentQuestion.options.forEach((option: string, i: number) => {
            const btnX = width / 2; // 居中对齐
            const btnY = i * (buttonHeight + buttonSpacing) + buttonHeight / 2;
            
            const button = this.add.rectangle(btnX, btnY, buttonWidth, buttonHeight, 0x4fc3f7, 1);
            button.setStrokeStyle(2, 0x2196f3);
            button.setInteractive({ useHandCursor: true });
            button.setRounded(15);
            buttonContainer.add(button);
            
            const buttonText = createText(
                this, 
                btnX, 
                btnY, 
                option, 
                'BUTTON_TEXT',
                {
                    fontSize: 32,
                    fontStyle: 'bold',
                    align: 'left',
                    wordWrap: { 
                        width: buttonWidth - 30,
                        useAdvancedWrap: true 
                    }
                }
            ).setOrigin(0.5,0.5);
            buttonContainer.add(buttonText);
            
            // 添加点击事件
            if (!showResult) {
                button.on('pointerdown', () => {
                    if (this.questionActive) {
                        this.checkAnswer(option);
                    }
                });
                
                // 添加悬停效果
                button.on('pointerover', () => {
                    button.setFillStyle(0x42a5f5, 1);
                });
                
                button.on('pointerout', () => {
                    button.setFillStyle(0x4fc3f7, 1);
                });
            } else {
                // 显示答题结果时的处理

                // 如果是正确答案，高亮显示
                if (this.currentQuestion && option.startsWith(this.currentQuestion.correct + '.')) {
                    button.setFillStyle(0x4caf50, 1); // 绿色表示正确答案
                    button.setAlpha(1);
                    
                    // 正确答案仍然可以点击，用于重新选择
                    button.on('pointerdown', () => {
                        if (this.questionActive) {
                            this.checkAnswer(option);
                        }
                    });
                    
                    // 添加悬停效果
                    button.on('pointerover', () => {
                        button.setFillStyle(0x66bb6a, 1);
                    });
                    
                    button.on('pointerout', () => {
                        button.setFillStyle(0x4caf50, 1);
                    });
                } else {
                    // 错误答案保持可点击但视觉上降低透明度
                    button.setAlpha(0.7);
                    button.on('pointerdown', () => {
                        if (this.questionActive) {
                            this.checkAnswer(option);
                        }
                    });
                    
                    // 添加悬停效果
                    button.on('pointerover', () => {
                        button.setFillStyle(0x42a5f5, 1);
                        button.setAlpha(1);
                    });
                    
                    button.on('pointerout', () => {
                        button.setFillStyle(0x4fc3f7, 1);
                        button.setAlpha(0.7);
                    });
                }
            }
        });

        this.questionPanel.add(buttonContainer);
        
        // 添加解释区域
        this.createExplanationArea(width, height, buttonStartY + (4 * (buttonHeight + buttonSpacing)) + 20, showResult, isCorrect);
    }

    private createExplanationArea(width: number, height: number, startY: number, showResult: boolean = false, isCorrect?: boolean): void {
        if (!this.currentQuestion) return;
        
        // 解释标签
        const explanationLabelBg = this.add.rectangle(width/2, startY + 20, width - 40, 35, 0xffa726, 1);
        explanationLabelBg.setRounded(10);
        this.questionPanel.add(explanationLabelBg);
        
        const explanationLabel = createText(
            this, 
            30, 
            startY + 20, 
            '💡 题目解释', 
            'BUTTON_TEXT',
            {
                fontSize: 32,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'left'
            }
        ).setOrigin(0, 0.5);
        this.questionPanel.add(explanationLabel);
        
        // 解释内容区域
        const explanationAreaHeight = height - startY - 50;
        const explanationBg = this.add.rectangle(width/2, startY + 40 + explanationAreaHeight/2, width - 40, explanationAreaHeight, 0xf5f5f5, 1);
        explanationBg.setStrokeStyle(2, 0xe0e0e0);
        explanationBg.setRounded(10);
        this.questionPanel.add(explanationBg);
        
        // 解释文本
        const explanation = this.currentQuestion.explanation;
        let explanationText: string;
        
        if (showResult && !isCorrect) {
            // 只有答错时才显示解释
            if (explanation && explanation.trim() !== '') {
                explanationText = explanation;
            } else {
                explanationText = '该题目暂无详细解释';
            }
        } else {
            // 未答题或答对时显示提示
            explanationText = showResult ? '回答正确，无需查看解释' : '答错后将显示详细解释...';
        }
        
        const explanationContent = createText(
            this, 
           30, 
            startY + 40 + explanationAreaHeight/2, 
            explanationText, 
            'BODY_TEXT',
            {
                fontSize: 32,
                color: (showResult && !isCorrect && explanation) ? '#333333' : '#999999',
                fontStyle: (showResult && !isCorrect && explanation) ? 'normal' : 'italic',
                align: 'left',
                wordWrap: { 
                    width: width - 80,
                    useAdvancedWrap: true 
                }
            }
        ).setOrigin(0, 0.5);
                 this.questionPanel.add(explanationContent);
    }

    private updateExplanationDisplay(isCorrect: boolean): void {
        if (!this.currentQuestion || !this.questionPanel) return;
        
        // 找到解释区域的文本对象并更新
        const explanation = this.currentQuestion.explanation;
        
        // 重新绘制整个问题面板来更新解释显示
        this.updateQuestionDisplay(true, isCorrect);
    }

    private checkAnswer(answer: string): void {
        if (!this.currentQuestion || !this.questionActive) return;
        
        this.questionActive = false;
        
        // 从用户选择的完整选项文本中提取答案字母
        // 例如：从 "C. 高傲-谦虚" 中提取 "C"
        const extractedAnswer = this.extractAnswerLetter(answer);
        const correctAnswer = this.currentQuestion.correct;
        
        console.log('用户选择:', answer);
        console.log('提取的答案字母:', extractedAnswer);
        console.log('正确答案:', correctAnswer);
        console.log('currentQuestion对象:', this.currentQuestion);
        
        // 防护性检查，确保两个值都存在
        if (!extractedAnswer || !correctAnswer) {
            console.error('答案提取失败:', { extractedAnswer, correctAnswer, answer, currentQuestion: this.currentQuestion });
            this.showMessage('答案检查出错，请重试');
            this.questionActive = true; // 重新启用答题
            return;
        }
        
        const isCorrect = extractedAnswer.toUpperCase() === correctAnswer.toUpperCase();
        
        if (isCorrect) {
            // 如果这是重新选择后的正确答案
            if (this.questionAnsweredIncorrectly) {
                this.showMessage(`🎉 重新选择正确！`);
                // 重新选择正确不增加连击和积分
            } else {
                // 第一次就答对
                this.gameState.correctAnswers++;
                this.gameState.combo++;
                if (this.gameState.combo > this.gameState.maxCombo) {
                    this.gameState.maxCombo = this.gameState.combo;
                }
                
                const bonus = 20 + (this.gameState.combo * 5);
                this.gameState.score += bonus;
                
                this.showMessage(`🎉 正确! +${bonus}积分`);
            }
            
            // 只有在第一次答题时才增加totalQuestions
            if (!this.questionAnsweredIncorrectly) {
                this.gameState.totalQuestions++;
            }
            
            this.updateUI();
            
            // 答对了直接跳到下一题，延时短一些
            this.time.delayedCall(1500, () => {
                this.showNextQuestion();
            });
        } else {
            // 第一次答错
            if (!this.questionAnsweredIncorrectly) {
                this.gameState.combo = 0;
                this.gameState.totalQuestions++;
                this.questionAnsweredIncorrectly = true;
            }
            
            this.showMessage(`❌ 错误! 请重新选择正确答案`);
            
            // 答错了显示解释，并允许重新选择
            this.updateExplanationDisplay(isCorrect);
            
            // 重新启用答题，让用户重新选择
            this.questionActive = true;
        }
    }

    /**
     * 从完整的选项文本中提取答案字母
     * @param optionText 完整选项文本，如 "C. 高傲-谦虚"
     * @returns 提取的字母，如 "C"
     */
    private extractAnswerLetter(optionText: string): string {
        // 输入验证
        if (!optionText || typeof optionText !== 'string') {
            console.error('extractAnswerLetter: 无效的输入', optionText);
            return '';
        }
        
        // 匹配开头的字母加点号模式
        const match = optionText.match(/^([ABCD])\./);
        if (match && match[1]) {
            return match[1];
        }
        
        // 如果没有匹配到标准格式，尝试其他可能的格式
        const letterMatch = optionText.match(/^([ABCD])/);
        if (letterMatch && letterMatch[1]) {
            return letterMatch[1];
        }
        
        // 如果都没有匹配到，返回原文本的第一个字符（如果存在）
        if (optionText.length > 0) {
            const firstChar = optionText.charAt(0).toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(firstChar)) {
                return firstChar;
            }
        }
        
        console.warn('extractAnswerLetter: 无法从选项中提取有效答案字母', optionText);
        return '';
    }

    private startWave(): void {
        if (this.waveInProgress) return;
        
        this.waveInProgress = true;
        this.currentWaveEnemies = this.towerDefenseManager.monsterManager.generateWaveEnemies(this.gameState.currentWave);
        
        console.log(`第${this.gameState.currentWave}波开始! 怪物数量: ${this.currentWaveEnemies.length}`);
        
        // 开始生成敌人
        let enemyIndex = 0;
        this.enemySpawnTimer = this.time.addEvent({
            delay: 1200,
            callback: () => {
                if (this.gameState.health <= 0 || this.gameState.isPaused) {
                    this.enemySpawnTimer?.remove();
                    this.enemySpawnTimer = undefined;
                    return;
                }
                
                if (enemyIndex < this.currentWaveEnemies.length) {
                    this.towerDefenseManager.spawnEnemy(this.currentWaveEnemies[enemyIndex]);
                    enemyIndex++;
                } else {
                    this.enemySpawnTimer?.remove();
                    this.enemySpawnTimer = undefined;
                }
            },
            repeat: this.currentWaveEnemies.length - 1
        });
    }

    private onMonsterKilled(monster: Monster): void {
        this.gameState.score += monster.enemyType.reward || 10;
        this.updateUI();
        
        if (this.towerDefenseManager.monsterManager.getEnemies().length === 0 && this.waveInProgress) {
            this.onWaveComplete();
        }
    }

    private onMonsterReachedEnd(monster: Monster): void {
        this.gameState.health--;
        this.updateUI();
        
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
        
        if (this.towerDefenseManager.monsterManager.getEnemies().length === 0 && this.waveInProgress) {
            this.onWaveComplete();
        }
    }

    private onTowerClicked(tower: Tower): void {
        // 塔点击逻辑由管理器处理
    }

    private onWaveComplete(): void {
        this.waveInProgress = false;
        
        if (this.gameState.health <= 0 || this.gameState.isPaused) {
            return;
        }
        
        const waveBonus = 30 * this.gameState.currentWave;
        this.gameState.score += waveBonus;
        this.showMessage(`波次完成! +${waveBonus}积分`);
        
        if (this.gameState.currentWave < this.gameState.totalWaves) {
            this.gameState.currentWave++;
            this.updateUI();
            
            this.time.delayedCall(5000, () => {
                if (this.gameState.health > 0 && !this.gameState.isPaused) {
                    this.startWave();
                }
            });
        } else {
            this.onLevelComplete();
        }
    }

    private onLevelComplete(): void {
        this.showMessage('关卡完成!');
        
        this.time.delayedCall(3000, () => {
            this.scene.start('LevelSelectScene', {
                subject: this.userConfig.subject,
                grade: this.userConfig.grade
            });
        });
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
        
        this.updateTowerButtonStates();
    }

    private updateTowerButtonStates(): void {
        const towerTypes = this.towerDefenseManager.getTowerTypes();
        Object.keys(towerTypes).forEach(towerType => {
            const towerData = towerTypes[towerType];
            const button = this.towerButtons[towerType];
            
            if (button) {
                if (this.gameState.score >= towerData.cost) {
                    button.setAlpha(1);
                    button.setInteractive({ useHandCursor: true });
                } else {
                    button.setAlpha(0.4);
                    button.disableInteractive();
                }
            }
        });
    }

    private showMessage(text: string): void {
        // 判断是否为解释信息
        const isExplanation = text.includes('💡 解释:');
        
        const message = createText(
            this, 
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            text, 
            'UI_TEXT',
            {
                fontSize: isExplanation ? 28 : 32,
                backgroundColor: isExplanation ? '#2E7D32' : '#000000',
                color: '#ffffff',
                padding: { x: 20, y: 15 },
                align: 'center',
                wordWrap: isExplanation ? { 
                    width: Math.min(800, this.cameras.main.width - 100),
                    useAdvancedWrap: true 
                } : undefined
            }
        ).setOrigin(0.5);
        
        // 如果是解释信息，设置特殊样式
        if (isExplanation) {
            message.setStroke('#1B5E20', 4);
        }
        
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: isExplanation ? 2500 : 1500, // 解释信息显示更长时间
            onComplete: () => {
                message.destroy();
            }
        });
    }

    update(time: number, delta: number): void {
        // 如果游戏已暂停或结束，停止更新
        if (this.gameState.isPaused || this.gameState.health <= 0) {
            return;
        }
        
        // 委托给管理器更新
        this.towerDefenseManager.update(time, delta);
    }

    private gameOver(): void {
        this.gameState.isPaused = true;
        this.waveInProgress = false;
        
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove();
            this.enemySpawnTimer = undefined;
        }
        
        this.time.removeAllEvents();
        
        console.log('游戏结束');
        this.showGameOverDialog();
    }

    private showGameOverDialog(): void {
        // 创建遮罩层
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000, 
            0.7
        );
        overlay.setDepth(1000);
        
        // 创建对话框容器
        this.gameOverDialog = this.add.container(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2
        );
        this.gameOverDialog.setDepth(1001);
        
        // 对话框背景
        const dialogWidth = 600;
        const dialogHeight = 500;
        const dialogBg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0xffffff, 0.95);
        dialogBg.setStrokeStyle(4, 0x666666);
        dialogBg.setRounded(20);
        this.gameOverDialog.add(dialogBg);
        
        // 标题
        const title = createText(
            this, 
            0, 
            -180, 
            '游戏结束', 
            'TITLE_LARGE',
            {
                fontSize: 48,
                color: '#d32f2f',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.gameOverDialog.add(title);
        
        // 游戏统计信息
        const stats = [
            `最终得分: ${this.gameState.score}`,
            `最高连击: ${this.gameState.maxCombo}`,
            `答题正确率: ${this.gameState.totalQuestions > 0 ? Math.round(this.gameState.correctAnswers / this.gameState.totalQuestions * 100) : 0}%`,
            `到达波次: ${this.gameState.currentWave}/${this.gameState.totalWaves}`
        ];
        
        stats.forEach((stat, index) => {
            const statText = createText(
                this, 
                0, 
                -100 + index * 40, 
                stat, 
                'BODY_TEXT',
                {
                    fontSize: 32,
                    color: '#333333',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);
            this.gameOverDialog!.add(statText);
        });
        
        // 重新开始按钮
        const restartButton = this.add.rectangle(-120, 120, 200, 60, 0x4caf50, 1);
        restartButton.setStrokeStyle(3, 0x388e3c);
        restartButton.setRounded(15);
        restartButton.setInteractive({ useHandCursor: true });
        this.gameOverDialog.add(restartButton);
        
        const restartText = createText(
            this, 
            -120, 
            120, 
            '🔄 重新开始', 
            'BUTTON_TEXT',
            {
                fontSize: 28,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.gameOverDialog.add(restartText);
        
        // 退出游戏按钮
        const exitButton = this.add.rectangle(120, 120, 200, 60, 0xff5722, 1);
        exitButton.setStrokeStyle(3, 0xd84315);
        exitButton.setRounded(15);
        exitButton.setInteractive({ useHandCursor: true });
        this.gameOverDialog.add(exitButton);
        
        const exitText = createText(
            this, 
            120, 
            120, 
            '🚪 返回关卡', 
            'BUTTON_TEXT',
            {
                fontSize: 28,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.gameOverDialog.add(exitText);
        
        // 按钮事件
        restartButton.on('pointerdown', () => {
            this.restartGame();
        });
        
        exitButton.on('pointerdown', () => {
            this.exitGame();
        });
        
        // 添加弹出动画
        this.gameOverDialog.setScale(0);
        this.tweens.add({
            targets: this.gameOverDialog,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    private restartGame(): void {
        this.scene.restart({
            subject: this.userConfig.subject,
            grade: this.userConfig.grade,
            category: this.userConfig.category,
            userLevel: this.userConfig.userLevel
        });
    }

    private exitGame(): void {
        this.scene.start('LevelSelectScene', {
            subject: this.userConfig.subject,
            grade: this.userConfig.grade
        });
    }
} 