// 游戏主类
class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
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
            currentLevel: 1,  // 当前关卡
            levelProgress: 0, // 当前关卡进度 (0-10)
            questionsPerLevel: 10, // 每关卡题目数量
            totalLevels: 10  // 总共10个关卡
        };
        
        // 游戏对象数组
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // 当前选中的塔类型和鼠标位置
        this.selectedTowerType = null;
        this.mouseX = 400; // 画布中心X (800/2)
        this.mouseY = 250; // 画布中心Y (500/2)
        this.selectedTower = null; // 当前选中的塔（用于升级）
        
        // 塔拖拽相关
        this.isDraggingTower = false;
        this.draggedTower = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // 地图路径点
        this.path = [
            {x: 0, y: 250},
            {x: 150, y: 250},
            {x: 150, y: 100},
            {x: 400, y: 100},
            {x: 400, y: 350},
            {x: 650, y: 350},
            {x: 650, y: 200},
            {x: 800, y: 200}
        ];
        
        // 题目数据库 (写死的题目)
        this.questions = [
            {
                id: 1,
                question: "5 + 3 = ?",
                options: ["6", "7", "8", "9"],
                correct: "8"
            },
            {
                id: 2,
                question: "10 - 4 = ?",
                options: ["5", "6", "7", "8"],
                correct: "6"
            },
            {
                id: 3,
                question: "2 × 3 = ?",
                options: ["5", "6", "7", "8"],
                correct: "6"
            },
            {
                id: 4,
                question: "12 ÷ 3 = ?",
                options: ["3", "4", "5", "6"],
                correct: "4"
            },
            {
                id: 5,
                question: "7 + 9 = ?",
                options: ["15", "16", "17", "18"],
                correct: "16"
            },
            {
                id: 6,
                question: "15 - 8 = ?",
                options: ["6", "7", "8", "9"],
                correct: "7"
            },
            {
                id: 7,
                question: "3 × 4 = ?",
                options: ["10", "11", "12", "13"],
                correct: "12"
            },
            {
                id: 8,
                question: "20 ÷ 4 = ?",
                options: ["4", "5", "6", "7"],
                correct: "5"
            }
        ];
        
        this.originalQuestions = [...this.questions]; // 保存原始题目
        
        this.currentQuestion = null;
        this.questionTimer = 30;
        this.questionActive = false;
        
        // 图片加载状态
        this.imagesLoaded = false;
        this.imageLoader = window.imageLoader;
        
        // 用户配置
        this.userConfig = {
            grade: 1,
            subject: 'math',
            customContent: '',
            isConfigured: false
        };
        
        // 题目池管理
        this.questionPool = []; // 所有可用题目
        this.usedQuestions = []; // 已使用的题目
        this.isLoadingNewQuestion = false; // 是否正在加载新题目
        
        // 自动进怪系统
        this.autoWaveTimer = null;
        this.autoWaveDelay = 10000; // 10秒自动开始
        this.waveStartTime = null;
        
        this.init();
    }
    
    init() {
        // 首先显示配置界面
        this.showConfigScreen();
    }
    
    // 显示配置界面
    showConfigScreen() {
        const configScreen = document.getElementById('configScreen');
        if (configScreen) {
            configScreen.classList.add('show');
        }
        
        // 绑定配置表单事件
        this.bindConfigEvents();
    }
    
    // 隐藏配置界面
    hideConfigScreen() {
        const configScreen = document.getElementById('configScreen');
        if (configScreen) {
            configScreen.classList.remove('show');
            setTimeout(() => {
                configScreen.style.display = 'none';
            }, 300);
        }
    }
    
    // 绑定配置相关事件
    bindConfigEvents() {
        const configForm = document.getElementById('configForm');
        if (configForm) {
            configForm.addEventListener('submit', (e) => this.handleConfigSubmit(e));
        }
    }
    
    // 处理配置表单提交
    handleConfigSubmit(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(e.target);
        this.userConfig = {
            grade: parseInt(formData.get('grade')),
            subject: formData.get('subject'),
            customContent: formData.get('customContent').trim(),
            isConfigured: true
        };
        
        console.log('用户配置:', this.userConfig);
        
        // 隐藏配置界面
        this.hideConfigScreen();
        
        // 显示AI准备界面
        this.showAIPreparing();
    }
    
    // 显示AI准备界面
    showAIPreparing() {
        const aiModal = document.getElementById('aiPreparingModal');
        if (aiModal) {
            aiModal.classList.add('show');
        }
        
        // 开始AI准备流程
        this.startAIPreparing();
    }
    
    // 隐藏AI准备界面
    hideAIPreparing() {
        const aiModal = document.getElementById('aiPreparingModal');
        if (aiModal) {
            aiModal.classList.remove('show');
            setTimeout(() => {
                aiModal.style.display = 'none';
            }, 400);
        }
    }
    
    // 开始AI准备流程
    async startAIPreparing() {
        const steps = [
            { text: '正在分析您的学习需求...', progress: 20 },
            { text: '连接Gemini AI服务...', progress: 40 },
            { text: '生成个性化题目中...', progress: 60 },
            { text: '调整游戏难度设置...', progress: 80 },
            { text: '准备游戏资源...', progress: 90 },
            { text: '准备完成！', progress: 100 }
        ];
        
        let currentStep = 0;
        
        const updateStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                
                // 更新进度条
                const progressBar = document.getElementById('aiProgressBar');
                if (progressBar) {
                    progressBar.style.width = step.progress + '%';
                }
                
                // 更新状态文本
                const statusElement = document.getElementById('aiStatus');
                if (statusElement) {
                    statusElement.innerHTML = `<span>✨ ${step.text}</span>`;
                }
                
                currentStep++;
                
                if (currentStep < steps.length) {
                    setTimeout(updateStep, 800 + Math.random() * 800); // 0.8-1.6秒随机延迟
                } else {
                    // 准备完成，开始生成题目并启动游戏
                    this.finishAIPreparing();
                }
            }
        };
        
        // 开始第一步
        setTimeout(updateStep, 500);
    }
    
    // 完成AI准备流程
    async finishAIPreparing() {
        try {
            // 在生成题目阶段显示特殊状态
            const statusElement = document.getElementById('aiStatus');
            if (statusElement) {
                statusElement.innerHTML = '<span>🤖 AI正在为您生成专属题目池...</span>';
            }
            
            // 调用异步题目池加载
            await this.loadQuestionPool();
            
            // 稍等片刻让用户看到成功消息
            setTimeout(() => {
                this.hideAIPreparing();
                this.startGameLoading();
            }, 1500);
            
        } catch (error) {
            console.error('AI准备流程出错:', error);
            
            // 即使出错也要继续游戏
            setTimeout(() => {
                this.hideAIPreparing();
                this.startGameLoading();
            }, 1000);
        }
    }
    
    // 开始游戏加载
    startGameLoading() {
        // 题目已经在AI准备阶段生成完成，直接开始游戏
        this.loadGameImages();
    }
    
    // 根据用户配置生成个性化题目
    async generateConfigBasedQuestions() {
        const { grade, subject, customContent } = this.userConfig;
        
        try {
            console.log('正在调用Gemini API生成题目...', { grade, subject, customContent });
            
            // 调用后端API生成题目
            const response = await fetch('http://localhost:5000/generate_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade: grade,
                    subject: subject,
                    customContent: customContent
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.questions) {
                console.log('成功获取AI生成的题目:', result.questions);
                this.questions = result.questions;
                
                // 显示成功消息
                this.showAISuccessMessage(result.questions.length);
            } else {
                throw new Error(result.error || 'API返回格式错误');
            }
            
        } catch (error) {
            console.error('Gemini API调用失败:', error);
            
            // 如果API调用失败，使用本地备用题目
            console.log('使用本地备用题目...');
            this.generateLocalFallbackQuestions(grade, subject, customContent);
            
            // 显示警告消息
            this.showAIErrorMessage(error.message);
        }
    }
    
    // 显示AI成功消息
    showAISuccessMessage(questionCount) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.innerHTML = `<span style="color: #27ae60;">✅ AI已为您生成 ${questionCount} 道个性化题目</span>`;
        }
    }
    
    // 显示AI错误消息
    showAIErrorMessage(errorMessage) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.innerHTML = `<span style="color: #e74c3c;">⚠️ AI服务暂时不可用，使用本地题目</span>`;
        }
        console.warn('AI题目生成失败，错误信息:', errorMessage);
    }
    
    // 本地备用题目生成（保持原有逻辑）
    generateLocalFallbackQuestions(grade, subject, customContent) {
        console.log('生成本地备用题目...');
        
        // 根据科目和年级生成题目
        let newQuestions = [];
        
        if (subject === 'math') {
            newQuestions = this.generateMathQuestions(grade, customContent);
        } else if (subject === 'chinese') {
            newQuestions = this.generateChineseQuestions(grade, customContent);
        } else if (subject === 'english') {
            newQuestions = this.generateEnglishQuestions(grade, customContent);
        }
        
        // 如果没有生成足够的题目，用原始题目补充
        if (newQuestions.length < 8) {
            newQuestions = [...newQuestions, ...this.originalQuestions.slice(0, 8 - newQuestions.length)];
        }
        
        this.questions = newQuestions;
        console.log('本地备用题目生成完成:', this.questions);
    }
    
    // 生成数学题目
    generateMathQuestions(grade, customContent) {
        const questions = [];
        
        if (grade <= 2) {
            // 1-2年级：简单加减法
            questions.push(
                {
                    id: 1,
                    question: "3 + 2 = ?",
                    options: ["4", "5", "6", "7"],
                    correct: "5",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 2,
                    question: "8 - 3 = ?",
                    options: ["4", "5", "6", "7"],
                    correct: "5",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 3,
                    question: "6 + 4 = ?",
                    options: ["9", "10", "11", "12"],
                    correct: "10",
                    grade: grade,
                    subject: "数学"
                }
            );
        } else if (grade <= 4) {
            // 3-4年级：乘除法
            questions.push(
                {
                    id: 1,
                    question: "6 × 7 = ?",
                    options: ["40", "41", "42", "43"],
                    correct: "42",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 2,
                    question: "36 ÷ 6 = ?",
                    options: ["5", "6", "7", "8"],
                    correct: "6",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 3,
                    question: "8 × 9 = ?",
                    options: ["70", "71", "72", "73"],
                    correct: "72",
                    grade: grade,
                    subject: "数学"
                }
            );
        } else {
            // 5-6年级：分数和小数
            questions.push(
                {
                    id: 1,
                    question: "0.5 + 0.3 = ?",
                    options: ["0.7", "0.8", "0.9", "1.0"],
                    correct: "0.8",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 2,
                    question: "1/2 + 1/4 = ?",
                    options: ["2/6", "3/4", "2/4", "1/3"],
                    correct: "3/4",
                    grade: grade,
                    subject: "数学"
                },
                {
                    id: 3,
                    question: "15% 等于多少小数？",
                    options: ["0.15", "0.015", "1.5", "15"],
                    correct: "0.15",
                    grade: grade,
                    subject: "数学"
                }
            );
        }
        
        // 根据自定义内容添加题目
        if (customContent && customContent.includes('加法')) {
            questions.push({
                id: questions.length + 1,
                question: "专项练习：25 + 17 = ?",
                options: ["40", "41", "42", "43"],
                correct: "42",
                grade: grade,
                subject: "数学"
            });
        }
        
        return questions;
    }
    
    // 生成语文题目
    generateChineseQuestions(grade, customContent) {
        const questions = [];
        
        if (grade <= 2) {
            // 1-2年级：汉字识别
            questions.push(
                {
                    id: 1,
                    question: "下面哪个字读作 'mā'？",
                    options: ["妈", "马", "吗", "骂"],
                    correct: "妈",
                    grade: grade,
                    subject: "语文"
                },
                {
                    id: 2,
                    question: "'人'字有几画？",
                    options: ["1画", "2画", "3画", "4画"],
                    correct: "2画",
                    grade: grade,
                    subject: "语文"
                },
                {
                    id: 3,
                    question: "下面哪个是动物？",
                    options: ["花", "树", "鸟", "石"],
                    correct: "鸟",
                    grade: grade,
                    subject: "语文"
                }
            );
        } else if (grade <= 4) {
            // 3-4年级：词语理解
            questions.push(
                {
                    id: 1,
                    question: "'欣欣向荣'的意思是？",
                    options: ["很高兴", "蓬勃发展", "向前走", "很漂亮"],
                    correct: "蓬勃发展",
                    grade: grade,
                    subject: "语文"
                },
                {
                    id: 2,
                    question: "下面哪个词语是反义词？",
                    options: ["大小", "红绿", "冷热", "以上都是"],
                    correct: "以上都是",
                    grade: grade,
                    subject: "语文"
                }
            );
        } else {
            // 5-6年级：古诗词
            questions.push(
                {
                    id: 1,
                    question: "'床前明月光'的下一句是？",
                    options: ["疑是地上霜", "低头思故乡", "举头望明月", "不知何处起"],
                    correct: "疑是地上霜",
                    grade: grade,
                    subject: "语文"
                },
                {
                    id: 2,
                    question: "《静夜思》的作者是？",
                    options: ["杜甫", "李白", "白居易", "王维"],
                    correct: "李白",
                    grade: grade,
                    subject: "语文"
                }
            );
        }
        
        return questions;
    }
    
    // 生成英语题目
    generateEnglishQuestions(grade, customContent) {
        const questions = [];
        
        if (grade <= 2) {
            // 1-2年级：基础单词
            questions.push(
                {
                    id: 1,
                    question: "'苹果'用英语怎么说？",
                    options: ["apple", "banana", "orange", "grape"],
                    correct: "apple",
                    grade: grade,
                    subject: "英语"
                },
                {
                    id: 2,
                    question: "'cat'是什么意思？",
                    options: ["狗", "猫", "鸟", "鱼"],
                    correct: "猫",
                    grade: grade,
                    subject: "英语"
                },
                {
                    id: 3,
                    question: "数字'3'用英语怎么说？",
                    options: ["two", "three", "four", "five"],
                    correct: "three",
                    grade: grade,
                    subject: "英语"
                }
            );
        } else if (grade <= 4) {
            // 3-4年级：简单句型
            questions.push(
                {
                    id: 1,
                    question: "'我喜欢苹果'用英语怎么说？",
                    options: ["I like apple", "I like apples", "I love apple", "I want apple"],
                    correct: "I like apples",
                    grade: grade,
                    subject: "英语"
                },
                {
                    id: 2,
                    question: "'How are you?'的正确回答是？",
                    options: ["I'm fine", "Thank you", "Good morning", "Nice to meet you"],
                    correct: "I'm fine",
                    grade: grade,
                    subject: "英语"
                }
            );
        } else {
            // 5-6年级：语法和阅读
            questions.push(
                {
                    id: 1,
                    question: "选择正确的句子：",
                    options: ["He go to school", "He goes to school", "He going to school", "He went to school"],
                    correct: "He goes to school",
                    grade: grade,
                    subject: "英语"
                },
                {
                    id: 2,
                    question: "'beautiful'的比较级是？",
                    options: ["beautifuler", "more beautiful", "most beautiful", "beautifully"],
                    correct: "more beautiful",
                    grade: grade,
                    subject: "英语"
                }
            );
        }
        
        return questions;
    }
    
    // 显示加载屏幕
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    // 隐藏加载屏幕
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    // 加载游戏图片
    loadGameImages() {
        // 直接标记图片已加载，跳过加载过程
        // this.imagesLoaded = true;
        // this.hideLoadingScreen();
        this.startGame();
    }
    
    // 开始游戏
    startGame() {
        this.bindEvents();
        this.loadNewQuestion();
        this.gameLoop();
        this.updateUI();
        this.updateConfigDisplay();
        
        // 启动自动进怪定时器
        this.startAutoWaveTimer();
    }
    
    // 更新配置信息显示
    updateConfigDisplay() {
        const configElement = document.getElementById('currentConfig');
        if (configElement && this.userConfig.isConfigured) {
            const subjectNames = {
                math: '数学',
                chinese: '语文',
                english: '英语'
            };
            
            const configText = `${this.userConfig.grade}年级 | ${subjectNames[this.userConfig.subject]}`;
            configElement.textContent = configText;
            
            // 如果有自定义内容，显示提示
            if (this.userConfig.customContent) {
                configElement.title = `自定义内容: ${this.userConfig.customContent}`;
            }
        }
    }
    
    bindEvents() {
        // 画布鼠标事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // 建塔菜单事件
        document.querySelectorAll('.tower-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectTower(e));
        });
        
        // 答题选项事件
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.answerQuestion(e));
        });
        
        // 控制按钮事件（移除开始波次按钮）
        document.getElementById('pauseGame').addEventListener('click', () => this.togglePause());
        document.getElementById('speedUp').addEventListener('click', () => this.toggleSpeed());
        
        // 游戏结束弹窗事件
        document.getElementById('restartGame').addEventListener('click', () => this.restartGame());
        document.getElementById('nextLevel').addEventListener('click', () => this.nextLevel());
        
        // 鼠标右键点击事件
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
    }
    
    // 选择建造的塔类型
    selectTower(e) {
        const towerType = e.currentTarget.dataset.tower;
        const towerCosts = {
            arrow: 50,
            cannon: 60,
            ice: 70,
            magic: 120
        };
        
        if (this.gameState.score >= towerCosts[towerType]) {
            // 清除之前的选择
            document.querySelectorAll('.tower-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            e.currentTarget.classList.add('selected');
            this.selectedTowerType = towerType;
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.showMessage('积分不足！', 'error');
        }
    }
    
    // 处理画布点击事件
    handleCanvasClick(e) {
        // 如果正在拖拽塔，不处理建塔逻辑
        if (this.isDraggingTower) return;
        
        if (!this.selectedTowerType) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否可以在此位置建塔
        if (this.canBuildTower(x, y)) {
            this.buildTower(x, y, this.selectedTowerType);
            this.selectedTowerType = null;
            this.canvas.style.cursor = 'default';
            
            // 清除选择状态
            document.querySelectorAll('.tower-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    }
    
    // 检查是否可以在指定位置建塔
    canBuildTower(x, y) {
        const minDistance = 60; // 最小建塔距离
        
        // 检查是否在路径上
        for (let i = 0; i < this.path.length - 1; i++) {
            const dist = this.distanceToLine(x, y, this.path[i], this.path[i + 1]);
            if (dist < 40) return false; // 不能在路径上建塔
        }
        
        // 检查与其他塔的距离
        for (let tower of this.towers) {
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            if (dist < minDistance) return false;
        }
        
        return true;
    }
    
    // 计算点到线段的距离
    distanceToLine(px, py, line1, line2) {
        const A = px - line1.x;
        const B = py - line1.y;
        const C = line2.x - line1.x;
        const D = line2.y - line1.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = line1.x;
            yy = line1.y;
        } else if (param > 1) {
            xx = line2.x;
            yy = line2.y;
        } else {
            xx = line1.x + param * C;
            yy = line1.y + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 建造塔
    buildTower(x, y, type) {
        const towerConfigs = {
            arrow: { cost: 50, damage: 15, range: 80, speed: 1200, color: '#8B4513' },
            cannon: { cost: 60, damage: 12, range: 120, speed: 1500, color: '#556B2F' },
            ice: { cost: 70, damage: 8, range: 100, speed: 800, color: '#4169E1' },
            magic: { cost: 120, damage: 25, range: 110, speed: 1000, color: '#9932CC' }
        };
        
        const config = towerConfigs[type];
        if (this.gameState.score >= config.cost) {
            this.towers.push(new Tower(x, y, type, config));
            this.gameState.score -= config.cost;
            this.updateUI();
        }
    }
    
    // 开始新的波次
    startWave() {
        if (this.gameState.isPlaying) return;
        
        this.gameState.isPlaying = true;
        this.waveStartTime = Date.now();
        
        // 清除自动进怪定时器和倒计时显示
        this.clearAutoWaveTimer();
        
        // 生成敌人
        this.spawnEnemies();
        
        console.log(`第${this.gameState.currentWave}波开始！`);
    }
    
    // 启动自动进怪定时器
    startAutoWaveTimer() {
        // 清除之前的定时器
        this.clearAutoWaveTimer();
        
        console.log('自动进怪定时器启动，10秒后自动开始下一波');
        
        // 显示倒计时（倒计时结束会自动触发startWave）
        this.showAutoWaveCountdown();
    }
    
    // 清除自动进怪定时器
    clearAutoWaveTimer() {
        if (this.autoWaveTimer) {
            clearTimeout(this.autoWaveTimer);
            this.autoWaveTimer = null;
        }
        this.hideAutoWaveCountdown();
    }
    
    // 显示自动进怪倒计时
    showAutoWaveCountdown() {
        const countdownOverlay = document.getElementById('countdownOverlay');
        const countdownNumber = document.getElementById('countdownNumber');
        if (!countdownOverlay || !countdownNumber) return;
        
        let countdown = 10; // 10秒倒计时
        countdownOverlay.style.display = 'flex';
        countdownNumber.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            if (this.gameState.isPlaying) {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                countdownOverlay.classList.remove('urgent');
                return;
            }
            
            countdown--;
            countdownNumber.textContent = countdown;
            
            // 当倒计时小于等于3秒时添加紧急样式
            if (countdown <= 3) {
                countdownOverlay.classList.add('urgent');
            }
            
            // 倒计时结束时自动开始下一波
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                countdownOverlay.classList.remove('urgent');
                
                // 检查游戏状态并开始下一波
                if (!this.gameState.isPlaying && this.gameState.health > 0) {
                    console.log('倒计时结束，自动开始下一波');
                    this.startWave();
                }
            }
        }, 1000);
    }
    
    // 隐藏自动进怪倒计时
    hideAutoWaveCountdown() {
        const countdownOverlay = document.getElementById('countdownOverlay');
        if (countdownOverlay) {
            countdownOverlay.style.display = 'none';
            countdownOverlay.classList.remove('urgent');
        }
    }
    
    // 生成敌人
    spawnEnemies() {
        // 根据当前关卡调整难度
        const difficultyMultiplier = 1 + (this.gameState.currentLevel - 1) * 0.2; // 每关卡增加20%难度
        
        const baseWaveConfig = {
            1: [{type: 'basic', count: 5, interval: 1000}],
            2: [{type: 'basic', count: 3, interval: 800}, {type: 'armored', count: 2, interval: 1200}],
            3: [{type: 'basic', count: 4, interval: 600}, {type: 'armored', count: 3, interval: 1000}],
            4: [{type: 'basic', count: 5, interval: 500}, {type: 'armored', count: 3, interval: 800}, {type: 'fast', count: 2, interval: 600}],
            5: [{type: 'boss', count: 1, interval: 2000}, {type: 'basic', count: 6, interval: 400}]
        };
        
        const config = baseWaveConfig[this.gameState.currentWave] || baseWaveConfig[1];
        let totalDelay = 0;
        
        config.forEach(group => {
            // 根据关卡难度增加敌人数量
            const adjustedCount = Math.floor(group.count * difficultyMultiplier);
            const adjustedInterval = Math.max(200, Math.floor(group.interval / difficultyMultiplier)); // 最小间隔200ms
            
            console.log(`生成敌人组: ${group.type}, 数量: ${adjustedCount}, 间隔: ${adjustedInterval}ms`);
            
            for (let i = 0; i < adjustedCount; i++) {
                setTimeout(() => {
                    if (this.gameState.isPlaying) { // 确保游戏仍在进行
                        console.log(`生成敌人: ${group.type}`);
                        this.enemies.push(new Enemy(group.type, this.gameState.currentLevel));
                    }
                }, totalDelay + i * adjustedInterval);
            }
            totalDelay += adjustedCount * adjustedInterval;
        });
        
        console.log(`第${this.gameState.currentWave}波敌人生成完成，难度倍数: ${difficultyMultiplier.toFixed(1)}x`);
    }
    
    // 加载新题目
    async loadNewQuestion() {
        if (this.isLoadingNewQuestion) return;
        
        // 检查题目池是否足够
        if (this.questionPool.length <= 2) {
            console.log('题目池不足，正在补充...');
            this.isLoadingNewQuestion = true;
            
            try {
                await this.loadQuestionPool(10); // 补充10道题目
            } catch (error) {
                console.error('补充题目失败:', error);
            }
            
            this.isLoadingNewQuestion = false;
        }
        
        if (this.questionPool.length === 0) {
            console.error('没有可用题目');
            return;
        }
        
        // 从题目池中获取第一道题目
        this.currentQuestion = this.questionPool.shift();
        this.usedQuestions.push(this.currentQuestion);
        
        // 根据年级和难度设置答题时间
        this.questionTimer = this.calculateQuestionTime(this.currentQuestion);
        this.questionActive = true;
        
        console.log(`加载题目: ${this.currentQuestion.question}, 答题时间: ${this.questionTimer}秒`);
        
        // 更新UI
        document.getElementById('questionText').textContent = this.currentQuestion.question;
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            btn.textContent = this.currentQuestion.options[index];
            btn.dataset.answer = this.currentQuestion.options[index];
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
        
        document.getElementById('questionResult').classList.remove('show');
        this.startQuestionTimer();
        
        // 更新关卡进度
        this.updateLevelProgress();
    }
    
    // 计算答题时间（根据年级和题目难度）
    calculateQuestionTime(question) {
        const baseTime = {
            1: 45,  // 1年级：45秒
            2: 40,  // 2年级：40秒
            3: 35,  // 3年级：35秒
            4: 30,  // 4年级：30秒
            5: 25,  // 5年级：25秒
            6: 20   // 6年级：20秒
        };
        
        const grade = this.userConfig.grade || 1;
        let time = baseTime[grade] || 30;
        
        // 根据题目内容调整时间
        const questionText = question.question.toLowerCase();
        
        // 复杂题目增加时间
        if (questionText.includes('计算') || questionText.includes('solve') || 
            questionText.includes('古诗') || questionText.includes('阅读')) {
            time += 10;
        }
        
        // 简单题目减少时间
        if (questionText.includes('几') || questionText.includes('多少') ||
            questionText.includes('what') || questionText.includes('选择')) {
            time -= 5;
        }
        
        return Math.max(15, Math.min(60, time)); // 限制在15-60秒之间
    }
    
    // 更新关卡进度
    updateLevelProgress() {
        this.gameState.levelProgress++;
        
        // 检查是否完成当前关卡
        if (this.gameState.levelProgress >= this.gameState.questionsPerLevel) {
            this.completeLevel();
        }
        
        this.updateLevelUI();
    }
    
    // 完成关卡
    completeLevel() {
        this.gameState.currentLevel++;
        this.gameState.levelProgress = 0;
        
        // 检查是否完成所有关卡
        if (this.gameState.currentLevel > this.gameState.totalLevels) {
            // 游戏通关
            this.gameComplete();
            return;
        }
        
        // 关卡奖励（后期关卡奖励更丰富）
        const levelBonus = this.gameState.currentLevel * 50;
        this.gameState.score += levelBonus;
        
        // 显示关卡完成提示
        this.showLevelComplete(levelBonus);
        
        console.log(`关卡 ${this.gameState.currentLevel - 1} 完成！进入关卡 ${this.gameState.currentLevel}`);
    }
    
    // 游戏通关
    gameComplete() {
        // 计算通关奖励
        const completionBonus = 1000;
        this.gameState.score += completionBonus;
        
        // 显示通关提示
        const message = `🎊 恭喜通关所有${this.gameState.totalLevels}个关卡！\n✨ 获得通关奖励 ${completionBonus} 积分\n🏆 您是真正的学习大师！`;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48caf0, #ff9ff3);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 6px 30px rgba(0,0,0,0.4);
            white-space: pre-line;
            animation: pulse 2s infinite;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示最终游戏结束界面
        setTimeout(() => {
            document.body.removeChild(notification);
            this.showGameOverModal(true);
        }, 5000);
    }
    
    // 显示关卡完成提示
    showLevelComplete(bonus) {
        const message = `🎉 关卡 ${this.gameState.currentLevel - 1} 完成！\n✨ 获得 ${bonus} 积分奖励\n🚀 进入关卡 ${this.gameState.currentLevel}`;
        
        // 创建临时提示框
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            white-space: pre-line;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    // 更新关卡UI
    updateLevelUI() {
        // 更新关卡信息显示
        const levelInfo = document.getElementById('level-info');
        if (levelInfo) {
            levelInfo.textContent = `关卡 ${this.gameState.currentLevel}/${this.gameState.totalLevels} (${this.gameState.levelProgress}/${this.gameState.questionsPerLevel})`;
        }
        
        // 如果没有关卡信息元素，更新波次信息
        const waveInfo = document.getElementById('wave-info');
        if (waveInfo) {
            waveInfo.textContent = `关卡${this.gameState.currentLevel}/${this.gameState.totalLevels} 第${this.gameState.currentWave}波 (${this.gameState.levelProgress}/${this.gameState.questionsPerLevel})`;
        }
    }
    
    // 开始答题计时器
    startQuestionTimer() {
        const timer = setInterval(() => {
            if (!this.questionActive) {
                clearInterval(timer);
                return;
            }
            
            this.questionTimer--;
            document.getElementById('timer').textContent = this.questionTimer;
            
            if (this.questionTimer <= 0) {
                clearInterval(timer);
                this.answerQuestion(null, true); // 超时
            }
        }, 1000);
    }
    
    // 回答问题
    answerQuestion(e, timeout = false) {
        if (!this.questionActive) return;
        
        this.questionActive = false;
        this.gameState.totalQuestions++;
        
        let isCorrect = false;
        let selectedAnswer = '';
        
        if (!timeout && e) {
            selectedAnswer = e.target.dataset.answer;
            isCorrect = selectedAnswer === this.currentQuestion.correct;
        }
        
        // 更新按钮状态
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === this.currentQuestion.correct) {
                btn.classList.add('correct');
            } else if (!timeout && btn === e.target && !isCorrect) {
                btn.classList.add('wrong');
            }
        });
        
        // 计算积分
        let earnedScore = 0;
        if (isCorrect) {
            this.gameState.correctAnswers++;
            this.gameState.combo++;
            this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
            
            // 基础积分 + 时间奖励 + 连击奖励 + 关卡奖励
            const timeBonus = Math.floor(this.questionTimer * 0.5);
            const comboBonus = this.gameState.combo * 2;
            const levelBonus = this.gameState.currentLevel * 2;
            earnedScore = 10 + timeBonus + comboBonus + levelBonus;
        } else {
            this.gameState.combo = 0;
            earnedScore = 3;
        }
        
        this.gameState.score += earnedScore;
        
        // 显示结果
        const resultDiv = document.getElementById('questionResult');
        if (timeout) {
            resultDiv.innerHTML = `<div class="wrong">⏰ 时间到！正确答案是: ${this.currentQuestion.correct}</div>`;
            resultDiv.className = 'question-result show wrong';
        } else if (isCorrect) {
            const bonusText = this.gameState.combo > 1 ? ` (连击×${this.gameState.combo}!)` : '';
            resultDiv.innerHTML = `<div class="correct">✅ 正确！获得 ${earnedScore} 积分${bonusText}</div>`;
            resultDiv.className = 'question-result show correct';
        } else {
            resultDiv.innerHTML = `<div class="wrong">❌ 错误！正确答案是: ${this.currentQuestion.correct}<br>获得 ${earnedScore} 积分</div>`;
            resultDiv.className = 'question-result show wrong';
        }
        
        this.updateUI();
        
        // 题目已被移除（在loadNewQuestion中处理），3秒后加载新题目
        setTimeout(async () => {
            await this.loadNewQuestion();
        }, 3000);
    }
    
    // 更新UI显示
    updateUI() {
        document.getElementById('health').textContent = this.gameState.health;
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('combo').textContent = this.gameState.combo;
        
        // 更新关卡和波次信息
        this.updateLevelUI();
        
        // 更新塔菜单可用性
        const towerCosts = { arrow: 50, cannon: 60, ice: 70, magic: 120 };
        document.querySelectorAll('.tower-item').forEach(item => {
            const towerType = item.dataset.tower;
            const cost = towerCosts[towerType];
            if (this.gameState.score < cost) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });
    }
    
    // 游戏主循环
    gameLoop() {
        if (!this.gameState.isPaused) {
            this.update();
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新游戏状态
    update() {
        // 更新敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            
            // 检查敌人是否到达终点
            if (enemy.reachedEnd) {
                this.gameState.health--;
                this.enemies.splice(i, 1);
                if (this.gameState.health <= 0) {
                    this.gameOver();
                }
                continue;
            }
            
            // 检查敌人是否死亡
            if (enemy.health <= 0) {
                this.gameState.score += enemy.reward;
                this.createDeathParticles(enemy.x, enemy.y);
                this.enemies.splice(i, 1);
            }
        }
        
        // 更新塔
        this.towers.forEach(tower => {
            tower.update(this.enemies, this.projectiles);
        });
        
        // 更新子弹
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update();
            
            if (projectile.hitTarget || projectile.outOfBounds()) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // 更新粒子效果
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 检查波次是否结束
        if (this.gameState.isPlaying && this.enemies.length === 0) {
            this.waveComplete();
        }
        
        this.updateUI();
    }
    
    // 渲染游戏画面
    render() {
        // 清空画布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制路径
        this.drawPath();
        
        // 绘制塔
        this.towers.forEach(tower => tower.render(this.ctx));
        
        // 绘制敌人
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // 绘制子弹
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // 绘制粒子效果
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // 绘制建塔预览
        if (this.selectedTowerType) {
            this.drawTowerPreview();
        }
        
        // 绘制拖拽反馈
        if (this.isDraggingTower && this.draggedTower) {
            this.drawDragFeedback();
        }
    }
    
    // 绘制路径
    drawPath() {
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 60;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        
        // 绘制路径中心线
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    // 绘制建塔预览
    drawTowerPreview() {
        if (!this.selectedTowerType) return;
        
        const towerConfigs = {
            arrow: { damage: 15, range: 80, color: '#8B4513' },
            cannon: { damage: 12, range: 120, color: '#556B2F' },
            ice: { damage: 8, range: 100, color: '#4169E1' },
            magic: { damage: 25, range: 110, color: '#9932CC' }
        };
        
        const config = towerConfigs[this.selectedTowerType];
        const canBuild = this.canBuildTower(this.mouseX, this.mouseY);
        
        // 绘制射程范围（半透明圆圈）
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = canBuild ? config.color : '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, config.range, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        // 绘制射程范围边框
        this.ctx.strokeStyle = canBuild ? config.color : '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, config.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制塔预览（居中在鼠标位置）
        const towerSize = 30;
        this.ctx.globalAlpha = 0.8;
        
        // 外框
        this.ctx.fillStyle = canBuild ? config.color : '#e74c3c';
        this.ctx.fillRect(
            this.mouseX - towerSize/2, 
            this.mouseY - towerSize/2, 
            towerSize, 
            towerSize
        );
        
        // 内框
        const innerSize = 24;
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(
            this.mouseX - innerSize/2, 
            this.mouseY - innerSize/2, 
            innerSize, 
            innerSize
        );
        
        // 中心点
        this.ctx.fillStyle = canBuild ? config.color : '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        
        // 显示提示文本（在塔的上方）
        this.ctx.fillStyle = canBuild ? '#27ae60' : '#e74c3c';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(
            canBuild ? '点击建造' : '无法建造', 
            this.mouseX, 
            this.mouseY - 35
        );
        this.ctx.fillText(
            canBuild ? '点击建造' : '无法建造', 
            this.mouseX, 
            this.mouseY - 35
        );
        this.ctx.textAlign = 'left';
        
        // 显示塔信息
        const towerNames = {
            arrow: '箭塔',
            cannon: '炮塔', 
            ice: '冰塔',
            magic: '魔法塔'
        };
        
        const towerCosts = {
            arrow: 50,
            cannon: 60,
            ice: 70,
            magic: 120
        };
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(
            `${towerNames[this.selectedTowerType]} (${towerCosts[this.selectedTowerType]}积分)`, 
            this.mouseX, 
            this.mouseY + 45
        );
        this.ctx.fillText(
            `${towerNames[this.selectedTowerType]} (${towerCosts[this.selectedTowerType]}积分)`, 
            this.mouseX, 
            this.mouseY + 45
        );
    }
    
    // 创建死亡粒子效果
    createDeathParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
    
    // 关卡完成
    levelComplete() {
        this.showGameOverModal(true);
    }
    
    // 游戏结束
    gameOver() {
        this.showGameOverModal(false);
    }
    
    // 显示游戏结束弹窗
    showGameOverModal(victory) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const finalScore = document.getElementById('finalScore');
        const correctAnswers = document.getElementById('correctAnswers');
        const maxCombo = document.getElementById('maxCombo');
        
        title.textContent = victory ? '🎉 恭喜通关！' : '💀 游戏结束';
        finalScore.textContent = this.gameState.score;
        correctAnswers.textContent = this.gameState.correctAnswers;
        maxCombo.textContent = this.gameState.maxCombo;
        
        modal.classList.add('show');
    }
    
    // 重新开始游戏
    restartGame() {
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
            currentLevel: 1,  // 当前关卡
            levelProgress: 0, // 当前关卡进度 (0-10)
            questionsPerLevel: 10, // 每关卡题目数量
            totalLevels: 10  // 总共10个关卡
        };
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.selectedTowerType = null;
        this.selectedTower = null;
        
        // 重置拖拽状态
        this.isDraggingTower = false;
        this.draggedTower = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // 重置鼠标位置到画布中心
        this.mouseX = 400; // 画布中心X (800/2)
        this.mouseY = 250; // 画布中心Y (500/2)
        
        // 重置题目池系统
        this.questionPool = [];
        this.usedQuestions = [];
        this.currentQuestion = null;
        this.questionActive = false;
        this.isLoadingNewQuestion = false;
        
        // 清除自动进怪定时器
        this.clearAutoWaveTimer();
        this.autoWaveTimer = null;
        this.waveStartTime = null;
        
        // 移除可能存在的升级菜单
        const existingMenu = document.getElementById('upgradeMenu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        document.getElementById('gameOverModal').classList.remove('show');

        // 重新加载题目池并开始游戏
        this.loadQuestionPool().then(() => {
            this.loadNewQuestion();
            this.updateUI();
            // 启动自动进怪定时器
            this.startAutoWaveTimer();
        });
    }
    
    // 下一关
    nextLevel() {
        // 先显示配置界面让用户重新选择
        document.getElementById('gameOverModal').classList.remove('show');
        this.showConfigScreen();
    }
    
    // 切换暂停
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        document.getElementById('pauseGame').textContent = this.gameState.isPaused ? '继续' : '暂停';
    }
    
    // 切换游戏速度
    toggleSpeed() {
        this.gameState.gameSpeed = this.gameState.gameSpeed === 1 ? 2 : 1;
        document.getElementById('speedUp').textContent = this.gameState.gameSpeed === 1 ? '2x速度' : '1x速度';
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        // 这里可以实现消息提示功能
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    // 处理鼠标按下事件
    handleMouseDown(e) {
        // 只处理左键
        if (e.button !== 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 查找点击位置是否有塔
        const clickedTower = this.towers.find(tower => {
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            return dist < 20; // 塔的点击范围
        });
        
        if (clickedTower && !this.selectedTowerType) {
            // 开始拖拽塔
            this.isDraggingTower = true;
            this.draggedTower = clickedTower;
            this.dragOffset.x = x - clickedTower.x;
            this.dragOffset.y = y - clickedTower.y;
            this.canvas.style.cursor = 'grabbing';
            
            // 阻止默认的点击事件
            e.preventDefault();
        }
    }
    
    // 处理鼠标松开事件
    handleMouseUp(e) {
        if (this.isDraggingTower && this.draggedTower) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查新位置是否有效
            if (this.canMoveTower(this.draggedTower, x, y)) {
                // 移动塔到新位置
                this.draggedTower.x = x;
                this.draggedTower.y = y;
                this.showMessage(`${this.getTowerDisplayName(this.draggedTower.type)}已移动到新位置`, 'success');
            } else {
                this.showMessage('无法在此位置放置塔！', 'error');
            }
            
            // 结束拖拽
            this.isDraggingTower = false;
            this.draggedTower = null;
            this.canvas.style.cursor = 'default';
        }
    }
    
    // 检查塔是否可以移动到指定位置
    canMoveTower(tower, x, y) {
        const minDistance = 60; // 最小塔间距离
        
        // 检查是否在路径上
        for (let i = 0; i < this.path.length - 1; i++) {
            const dist = this.distanceToLine(x, y, this.path[i], this.path[i + 1]);
            if (dist < 40) return false; // 不能在路径上建塔
        }
        
        // 检查与其他塔的距离（排除当前塔）
        for (let otherTower of this.towers) {
            if (otherTower === tower) continue; // 跳过当前塔
            const dist = Math.sqrt((x - otherTower.x) ** 2 + (y - otherTower.y) ** 2);
            if (dist < minDistance) return false;
        }
        
        // 检查是否在画布范围内
        const towerSize = 20;
        if (x < towerSize || x > this.canvas.width - towerSize || 
            y < towerSize || y > this.canvas.height - towerSize) {
            return false;
        }
        
        return true;
    }
    
    // 处理鼠标移动事件
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // 确保鼠标位置在画布范围内
        this.mouseX = Math.max(0, Math.min(this.canvas.width, this.mouseX));
        this.mouseY = Math.max(0, Math.min(this.canvas.height, this.mouseY));
        
        // 如果正在拖拽塔，更新塔的位置
        if (this.isDraggingTower && this.draggedTower) {
            const newX = this.mouseX - this.dragOffset.x;
            const newY = this.mouseY - this.dragOffset.y;
            
            // 实时更新被拖拽塔的位置（临时位置，用于预览）
            this.draggedTower.x = newX;
            this.draggedTower.y = newY;
        }
    }
    
    // 处理鼠标右键点击事件
    handleRightClick(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 查找点击位置是否有塔
        const clickedTower = this.towers.find(tower => {
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            return dist < 20; // 塔的点击范围
        });
        
        if (clickedTower && clickedTower.level < 3) {
            this.showUpgradeMenu(clickedTower, e.clientX, e.clientY);
        }
    }
    
    // 显示升级菜单
    showUpgradeMenu(tower, screenX, screenY) {
        // 移除之前的升级菜单
        const existingMenu = document.getElementById('upgradeMenu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const upgradeCost = this.getUpgradeCost(tower);
        const canAfford = this.gameState.score >= upgradeCost;
        
        // 创建升级菜单
        const menu = document.createElement('div');
        menu.id = 'upgradeMenu';
        menu.style.position = 'fixed';
        menu.style.left = screenX + 'px';
        menu.style.top = screenY + 'px';
        menu.style.background = 'rgba(255, 255, 255, 0.95)';
        menu.style.border = '2px solid #3498db';
        menu.style.borderRadius = '8px';
        menu.style.padding = '10px';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '150px';
        menu.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        
        menu.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50;">
                ${this.getTowerDisplayName(tower.type)} (等级 ${tower.level})
            </div>
            <div style="font-size: 12px; color: #555; margin-bottom: 8px;">
                攻击力: ${tower.damage} → ${Math.floor(tower.damage * 1.5)}<br>
                射程: ${tower.range} → ${Math.floor(tower.range * 1.1)}
            </div>
            <button id="upgradeBtn" style="
                width: 100%; 
                padding: 8px; 
                border: none; 
                background: ${canAfford ? 'linear-gradient(45deg, #27ae60, #2ecc71)' : '#bdc3c7'}; 
                color: white; 
                border-radius: 5px; 
                cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                font-weight: bold;
            " ${!canAfford ? 'disabled' : ''}>
                升级 (${upgradeCost}积分)
            </button>
        `;
        
        document.body.appendChild(menu);
        
        // 升级按钮事件
        const upgradeBtn = document.getElementById('upgradeBtn');
        upgradeBtn.addEventListener('click', () => {
            if (canAfford) {
                this.upgradeTower(tower);
            }
            menu.remove();
        });
        
        // 点击其他地方关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    // 获取塔的显示名称
    getTowerDisplayName(type) {
        const names = {
            arrow: '箭塔',
            cannon: '炮塔',
            ice: '冰塔',
            magic: '魔法塔'
        };
        return names[type] || '未知塔';
    }
    
    // 获取升级成本
    getUpgradeCost(tower) {
        const baseCosts = {
            arrow: [0, 30, 50],
            cannon: [0, 40, 60],
            ice: [0, 45, 65],
            magic: [0, 80, 100]
        };
        return baseCosts[tower.type][tower.level] || 999;
    }
    
    // 升级塔
    upgradeTower(tower) {
        const upgradeCost = this.getUpgradeCost(tower);
        if (this.gameState.score >= upgradeCost && tower.level < 3) {
            this.gameState.score -= upgradeCost;
            tower.upgrade();
            this.updateUI();
            this.showMessage(`${this.getTowerDisplayName(tower.type)}升级成功！`, 'success');
        }
    }
    
    // 绘制拖拽反馈
    drawDragFeedback() {
        const tower = this.draggedTower;
        const config = {
            arrow: { range: 80, color: '#8B4513' },
            cannon: { range: 120, color: '#556B2F' },
            ice: { range: 100, color: '#4169E1' },
            magic: { range: 110, color: '#9932CC' }
        };
        
        const towerConfig = config[tower.type];
        const canMove = this.canMoveTower(tower, this.mouseX, this.mouseY);
        
        // 绘制射程范围（半透明圆圈）
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = canMove ? towerConfig.color : '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, tower.range, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        // 绘制射程范围边框
        this.ctx.strokeStyle = canMove ? towerConfig.color : '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, tower.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制塔预览（居中在鼠标位置）
        const towerSize = 30;
        this.ctx.globalAlpha = 0.8;
        
        // 外框
        this.ctx.fillStyle = canMove ? towerConfig.color : '#e74c3c';
        this.ctx.fillRect(
            this.mouseX - towerSize/2, 
            this.mouseY - towerSize/2, 
            towerSize, 
            towerSize
        );
        
        // 内框
        const innerSize = 24;
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(
            this.mouseX - innerSize/2, 
            this.mouseY - innerSize/2, 
            innerSize, 
            innerSize
        );
        
        // 中心点
        this.ctx.fillStyle = canMove ? towerConfig.color : '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        
        // 显示提示文本（在塔的上方）
        this.ctx.fillStyle = canMove ? '#27ae60' : '#e74c3c';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(
            canMove ? '松开鼠标放置' : '无法在此放置', 
            this.mouseX, 
            this.mouseY - 35
        );
        this.ctx.fillText(
            canMove ? '松开鼠标放置' : '无法在此放置', 
            this.mouseX, 
            this.mouseY - 35
        );
        this.ctx.textAlign = 'left';
        
        // 显示塔信息
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(
            `拖拽 ${this.getTowerDisplayName(tower.type)} (等级 ${tower.level})`, 
            this.mouseX, 
            this.mouseY + 45
        );
        this.ctx.fillText(
            `拖拽 ${this.getTowerDisplayName(tower.type)} (等级 ${tower.level})`, 
            this.mouseX, 
            this.mouseY + 45
        );
    }
    
    // 加载题目池（支持动态加载）
    async loadQuestionPool(additionalQuestions = 0) {
        const { grade, subject, customContent } = this.userConfig;
        
        // 计算需要生成的题目数量（当前关卡剩余 + 下一关卡 + 额外请求）
        const remainingInCurrentLevel = this.gameState.questionsPerLevel - this.gameState.levelProgress;
        const questionsNeeded = remainingInCurrentLevel + this.gameState.questionsPerLevel + additionalQuestions;
        
        try {
            console.log(`正在加载题目池，需要 ${questionsNeeded} 道题目...`);
            
            // 调用统一服务器API生成题目
            const response = await fetch('/generate_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade: grade,
                    subject: subject,
                    customContent: customContent,
                    questionsCount: questionsNeeded // 传递需要的题目数量
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.questions) {
                console.log(`成功获取AI生成的 ${result.questions.length} 道题目`);
                
                // 将新题目添加到题目池
                this.questionPool = [...this.questionPool, ...result.questions];
                
                // 显示成功消息
                this.showAISuccessMessage(result.questions.length, true);
                return true;
            } else {
                throw new Error(result.error || 'API返回格式错误');
            }
            
        } catch (error) {
            console.error('AI API调用失败:', error);
            
            // 如果API调用失败，使用本地备用题目
            console.log('使用本地备用题目...');
            const localQuestions = this.generateLocalFallbackQuestions(grade, subject, customContent, questionsNeeded);
            this.questionPool = [...this.questionPool, ...localQuestions];
            
            // 显示警告消息
            this.showAIErrorMessage(error.message);
            return false;
        }
    }
    
    // 显示AI成功消息
    showAISuccessMessage(questionCount, isAdditional = false) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            const message = isAdditional 
                ? `✅ AI已补充 ${questionCount} 道新题目到题目池`
                : `✅ AI已为您生成 ${questionCount} 道个性化题目`;
            statusElement.innerHTML = `<span style="color: #27ae60;">${message}</span>`;
        }
    }
    
    // 显示AI错误消息
    showAIErrorMessage(errorMessage) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.innerHTML = `<span style="color: #e74c3c;">⚠️ AI服务暂时不可用，使用本地题目</span>`;
        }
        console.warn('AI题目生成失败，错误信息:', errorMessage);
    }
    
    // 本地备用题目生成（保持原有逻辑）
    generateLocalFallbackQuestions(grade, subject, customContent, count = 8) {
        console.log(`生成 ${count} 道本地备用题目...`);
        
        // 根据科目和年级生成题目
        let newQuestions = [];
        
        if (subject === 'math') {
            newQuestions = this.generateMathQuestions(grade, customContent);
        } else if (subject === 'chinese') {
            newQuestions = this.generateChineseQuestions(grade, customContent);
        } else if (subject === 'english') {
            newQuestions = this.generateEnglishQuestions(grade, customContent);
        }
        
        // 如果需要更多题目，重复生成并稍作变化
        while (newQuestions.length < count) {
            const additionalQuestions = this.generateVariantQuestions(newQuestions, count - newQuestions.length);
            newQuestions = [...newQuestions, ...additionalQuestions];
        }
        
        // 只返回需要的数量
        const result = newQuestions.slice(0, count);
        console.log(`本地备用题目生成完成: ${result.length} 道`);
        return result;
    }
    
    // 生成变体题目（基于现有题目）
    generateVariantQuestions(baseQuestions, count) {
        const variants = [];
        for (let i = 0; i < count && i < baseQuestions.length; i++) {
            const base = baseQuestions[i % baseQuestions.length];
            const variant = {
                ...base,
                id: base.id + 100 + i,
                question: this.createQuestionVariant(base.question, base.subject)
            };
            variants.push(variant);
        }
        return variants;
    }
    
    // 创建题目变体
    createQuestionVariant(originalQuestion, subject) {
        // 简单的题目变体生成逻辑
        if (subject === '数学' || subject === 'math') {
            // 对于数学题目，可以改变数字
            return originalQuestion.replace(/\d+/g, (match) => {
                const num = parseInt(match);
                return (num + Math.floor(Math.random() * 5) + 1).toString();
            });
        }
        return originalQuestion; // 其他科目暂时返回原题目
    }
    
    // 波次完成
    waveComplete() {
        this.gameState.isPlaying = false;
        this.gameState.score += 30; // 波次奖励
        
        if (this.gameState.currentWave >= this.gameState.totalWaves) {
            this.levelComplete();
        } else {
            this.gameState.currentWave++;
            this.showMessage(`第${this.gameState.currentWave - 1}波完成！获得30积分奖励`, 'success');
            
            // 启动自动进怪定时器
            this.startAutoWaveTimer();
        }
    }
}

// 塔类
class Tower {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.baseDamage = config.damage;
        this.baseRange = config.range;
        this.damage = config.damage;
        this.range = config.range;
        this.attackSpeed = config.speed;
        this.color = config.color;
        this.lastAttack = 0;
        this.target = null;
    }
    
    // 升级塔
    upgrade() {
        if (this.level < 3) {
            this.level++;
            this.damage = Math.floor(this.baseDamage * Math.pow(1.5, this.level - 1));
            this.range = Math.floor(this.baseRange * Math.pow(1.1, this.level - 1));
            this.attackSpeed = Math.floor(this.attackSpeed * 0.9); // 攻击速度提升
        }
    }
    
    update(enemies, projectiles) {
        const now = Date.now();
        
        // 寻找目标
        this.findTarget(enemies);
        
        // 攻击目标
        if (this.target && now - this.lastAttack > this.attackSpeed) {
            this.attack(projectiles);
            this.lastAttack = now;
        }
    }
    
    findTarget(enemies) {
        this.target = null;
        let closestDistance = this.range;
        
        for (let enemy of enemies) {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance <= closestDistance) {
                this.target = enemy;
                closestDistance = distance;
            }
        }
    }
    
    attack(projectiles) {
        if (!this.target) return;
        
        projectiles.push(new Projectile(
            this.x, this.y,
            this.target.x, this.target.y,
            this.damage, this.target, this.type
        ));
    }
    
    render(ctx) {
        // 尝试使用图片渲染
        const imageKey = `${this.type}_tower_lv${this.level}`;
        const towerImage = window.imageLoader ? window.imageLoader.getImage(imageKey) : null;
        
        if (towerImage) {
            // 使用图片渲染塔
            const size = 48; // 塔的渲染尺寸
            ctx.drawImage(
                towerImage,
                this.x - size/2,
                this.y - size/2,
                size,
                size
            );
        } else {
            // 使用原来的绘制方法（后备方案）
            // 绘制射程范围（半透明）
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // 绘制塔身
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
            
            // 绘制塔顶
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
        }
        
        // 绘制等级标识
        if (this.level > 1) {
            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.level.toString(), this.x, this.y - 30);
            ctx.textAlign = 'left';
        }
        
        // 绘制炮管（指向目标）
        if (this.target) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillStyle = '#34495e';
            ctx.fillRect(0, -3, 20, 6);
            ctx.restore();
        }
    }
}

// 敌人类
class Enemy {
    constructor(type, level = 1) {
        this.type = type;
        this.level = level;
        this.pathIndex = 0;
        this.progress = 0;
        this.x = 0;
        this.y = 250;
        this.reachedEnd = false;
        
        // 根据类型设置基础属性
        const baseConfigs = {
            basic: { health: 20, speed: 1, reward: 5, color: '#e74c3c', size: 12 },
            armored: { health: 35, speed: 0.7, reward: 8, color: '#95a5a6', size: 15 },
            fast: { health: 15, speed: 1.5, reward: 6, color: '#f39c12', size: 10 },
            boss: { health: 100, speed: 0.5, reward: 25, color: '#8e44ad', size: 20 }
        };
        
        const baseConfig = baseConfigs[type] || baseConfigs.basic;
        
        // 根据关卡等级调整属性
        const levelMultiplier = 1 + (level - 1) * 0.3; // 每关卡增加30%属性
        
        this.maxHealth = Math.floor(baseConfig.health * levelMultiplier);
        this.health = this.maxHealth;
        this.speed = baseConfig.speed * (1 + (level - 1) * 0.1); // 速度适度增加
        this.reward = Math.floor(baseConfig.reward * levelMultiplier);
        this.color = baseConfig.color;
        this.size = baseConfig.size;
        
        console.log(`生成${type}敌人: 等级${level}, 血量${this.health}, 速度${this.speed.toFixed(1)}, 奖励${this.reward}`);
    }
    
    update() {
        if (this.reachedEnd) return;
        
        // 沿路径移动
        const game = window.game; // 访问全局游戏实例
        const path = game.path;
        
        if (this.pathIndex >= path.length - 1) {
            this.reachedEnd = true;
            return;
        }
        
        const current = path[this.pathIndex];
        const next = path[this.pathIndex + 1];
        
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.progress += (this.speed * game.gameState.gameSpeed) / distance;
        
        if (this.progress >= 1) {
            this.pathIndex++;
            this.progress = 0;
        }
        
        if (this.pathIndex < path.length - 1) {
            const current = path[this.pathIndex];
            const next = path[this.pathIndex + 1];
            
            this.x = current.x + (next.x - current.x) * this.progress;
            this.y = current.y + (next.y - current.y) * this.progress;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    render(ctx) {
        // 尝试使用图片渲染
        const imageKey = `enemy_${this.type}`;
        const enemyImage = window.imageLoader ? window.imageLoader.getImage(imageKey) : null;
        
        if (enemyImage) {
            // 使用图片渲染敌人
            const size = this.size * 2;
            ctx.drawImage(
                enemyImage,
                this.x - size/2,
                this.y - size/2,
                size,
                size
            );
        } else {
            // 使用原来的绘制方法（后备方案）
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制血条
        const barWidth = this.size * 2;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 8, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.6 ? '#27ae60' : healthPercent > 0.3 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 8, barWidth * healthPercent, barHeight);
    }
}

// 子弹类
class Projectile {
    constructor(startX, startY, targetX, targetY, damage, target, towerType) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.target = target;
        this.towerType = towerType;
        this.speed = 5;
        this.hitTarget = false;
        
        // 计算方向
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // 检查是否击中目标
        if (this.target && !this.hitTarget) {
            const distance = Math.sqrt((this.x - this.target.x) ** 2 + (this.y - this.target.y) ** 2);
            if (distance < 15) {
                this.target.takeDamage(this.damage);
                this.hitTarget = true;
                
                // 特殊效果
                if (this.towerType === 'ice') {
                    // 冰冻减速效果（简化实现）
                    this.target.speed *= 0.7;
                    setTimeout(() => {
                        if (this.target) this.target.speed /= 0.7;
                    }, 2000);
                }
            }
        }
    }
    
    outOfBounds() {
        return this.x < 0 || this.x > 800 || this.y < 0 || this.y > 500;
    }
    
    render(ctx) {
        // 尝试使用图片渲染
        const imageKey = `${this.towerType}_projectile`;
        const projectileImage = window.imageLoader ? window.imageLoader.getImage(imageKey) : null;
        
        if (projectileImage) {
            // 使用图片渲染子弹
            const size = 12;
            ctx.save();
            ctx.translate(this.x, this.y);
            // 根据移动方向旋转子弹
            const angle = Math.atan2(this.vy, this.vx);
            ctx.rotate(angle);
            ctx.drawImage(
                projectileImage,
                -size/2, -size/2,
                size, size
            );
            ctx.restore();
        } else {
            // 使用原来的绘制方法（后备方案）
            const colors = {
                arrow: '#8B4513',
                cannon: '#556B2F',
                ice: '#4169E1',
                magic: '#9932CC'
            };
            
            ctx.fillStyle = colors[this.towerType] || '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 粒子效果类
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 30;
        this.maxLife = 30;
        this.color = `hsl(${Math.random() * 60 + 15}, 70%, 50%)`;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // 重力
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    window.game = new TowerDefenseGame();
}); 