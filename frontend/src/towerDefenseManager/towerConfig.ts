import { getAssetPath } from '@/config/AssetConfig';
import { TowerDefenseGameState, TowerType, EnemyType } from '@/types/towerDefenseScene';

/**
 * 初始游戏状态配置
 */
export const INITIAL_GAME_STATE: TowerDefenseGameState = {
    health: 10,
    score: 100, // 调试：增加初始积分便于建塔
    combo: 0,
    maxCombo: 0,
    currentWave: 1,
    totalWaves: 1, //总波次 - 设置为1可以直接通关
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

/**
 * 游戏区域尺寸配置
 */
export const GAME_AREA_CONFIG = {
    width: 1400,
    height: 1000
};

/**
 * 布局配置
 */
export const LAYOUT_CONFIG = {
    statusBarHeight: 60,
    rightContainerWidth: 700,
    singlePanelSpacing: 20
};

/**
 * 塔类型配置
 */
export const TOWER_TYPES: { [key: string]: TowerType } = {
    "tower-arrow": {
        type: 'tower-arrow',
        name: '箭塔',
        cost: 50,
        damage: 20,
        range: 150,
        fireRate: 1000,
        level: 1,
        maxLevel: 10,
        image: getAssetPath('tower-arrow'),
        icon: '🏹'
    },
    "tower-freeze": {
        type: 'tower-freeze',
        name: '冰冻塔',
        cost: 70,
        damage: 15,
        range: 150,
        fireRate: 1500,
        level: 1,
        maxLevel: 10,
        image: getAssetPath('tower-freeze'),
        icon: '❄️'
    },
    "tower-laser": {
        type: 'tower-laser',
        name: '激光塔',
        cost: 100,
        damage: 30,
        range: 180,
        fireRate: 800,
        level: 1,
        maxLevel: 10,
        image: getAssetPath('tower-laser'),
        icon: '⚡'
    },
    "tower-poison": {
        type: 'tower-poison',
        name: '毒塔',
        cost: 70,
        damage: 10,
        range: 140,
        fireRate: 500,
        level: 1,
        maxLevel: 10,
        image: getAssetPath('tower-poison'),
        icon: '☠️'
    }
};

/**
 * 敌人类型配置
 */
export const ENEMY_TYPES: { [key: string]: EnemyType } = {
    "monster-normal": {
        type: 'monster-normal',
        health: 50,
        speed: 100,
        reward: 1,
        image: getAssetPath('monster-normal')
    },
    "monster-gluttonous": {
        type: 'monster-gluttonous',
        health: 80,
        speed: 80,
        reward: 2,
        image: getAssetPath('monster-gluttonous')
    },
    "monster-grumpy": {
        type: 'monster-grumpy',
        health: 120,
        speed: 60,
        reward: 3,
        image: getAssetPath('monster-grumpy')
    },
    "monster-lazy": {
        type: 'monster-lazy',
        health: 100,
        speed: 40,
        reward: 3,
        image: getAssetPath('monster-lazy')
    },
    "monster-messy": {
        type: 'monster-messy',
        health: 60,
        speed: 120,
        reward: 2,
        image: getAssetPath('monster-messy')
    }
};

/**
 * 波次配置 - 每波怪物配置
 */
export const WAVE_CONFIG: { [key: number]: Array<{icon: string, name: string, type: string, count: number}> } = {
    1: [
        { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 5 },
        { icon: '🐙', name: '懒惰怪', type: 'monster-lazy', count: 3 },
        { icon: '🐙', name: '邋遢怪', type: 'monster-messy', count: 2 },
    ],
    2: [
        { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 3 },
        { icon: '🐙', name: '懒惰怪', type: 'monster-lazy', count:5 },
        { icon: '🐙', name: '邋遢怪', type: 'monster-messy', count: 2 },
    ],
    3: [
        { icon: '🐙', name: '邋遢怪', type: 'monster-messy', count: 5 },
        { icon: '🐙', name: '懒惰怪', type: 'monster-lazy', count: 3 },
        { icon: '👹', name: '贪吃怪', type: 'monster-gluttonous', count: 2 }
    ],
    4: [
        { icon: '🐙', name: '懒惰怪', type: 'monster-lazy', count: 6 }, 
        { icon: '👹', name: '贪吃怪', type: 'monster-gluttonous', count: 3 },
        { icon: '🚶', name: '暴躁怪', type: 'monster-grumpy', count: 1 }
    ],
    5: [
        { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 6 },
        { icon: '👹', name: '加强兵', type: 'monster-gluttonous', count: 2 },
        { icon: '💨', name: '快速兵', type: 'monster-messy', count: 1 },
        { icon: '👾', name: 'BOSS', type: 'monster-grumpy', count: 1 }
    ]
};

/**
 * 游戏路径配置
 */
export const generateGamePath = (gameWidth: number, gameHeight: number): Phaser.Math.Vector2[] => {
    const pathMargin = 50;
    const pathPoints = [
        { x: pathMargin, y: gameHeight * 0.2 },
        { x: gameWidth * 0.25, y: gameHeight * 0.2 },
        { x: gameWidth * 0.25, y: gameHeight * 0.6 },
        { x: gameWidth * 0.4, y: gameHeight * 0.6 },
        { x: gameWidth * 0.4, y: gameHeight * 0.2 },
        { x: gameWidth * 0.6, y: gameHeight * 0.2 },
        { x: gameWidth * 0.6, y: gameHeight * 0.8 },
        { x: gameWidth * 0.8, y: gameHeight * 0.8 },
        { x: gameWidth * 0.8, y: gameHeight * 0.4 },
        { x: gameWidth - pathMargin, y: gameHeight * 0.4 }
    ];

    return pathPoints.map(point => new Phaser.Math.Vector2(point.x, point.y));
};

/**
 * 游戏时间配置
 */
export const TIMING_CONFIG = {
    // 波次间隔时间
    waveCooldown: 5000,
    // 敌人生成间隔
    enemySpawnInterval: 1200,
    // 游戏开始延迟
    gameStartDelay: 2000,
    // 答题显示下一题延迟
    nextQuestionDelay: 2000,
    // 塔信息显示时间
    towerInfoDisplayTime: 3000
};

/**
 * 塔防游戏颜色配置
 */
export const TOWER_COLORS: { [key: string]: number } = {
    'tower-arrow': 0x8d6e63,
    'tower-poison': 0x9c27b0,
    'tower-freeze': 0x42a5f5,
    'tower-laser': 0xffa726
};

/**
 * 获取波次怪物配置
 */
export const getWaveMonsters = (wave: number): Array<{icon: string, name: string, type: string, count: number}> => {
    return WAVE_CONFIG[wave] || WAVE_CONFIG[5];
};

/**
 * 计算游戏布局尺寸
 */
export const calculateGameLayout = (screenWidth: number, screenHeight: number) => {
    const gameContainerWidth = screenWidth - LAYOUT_CONFIG.rightContainerWidth;
    const mainContentHeight = screenHeight - LAYOUT_CONFIG.statusBarHeight;
    const singlePanelHeight = (mainContentHeight - LAYOUT_CONFIG.singlePanelSpacing * 2) / 2;

    return {
        gameContainerWidth,
        mainContentHeight,
        singlePanelHeight,
        gameAreaWidth: gameContainerWidth,
        gameAreaHeight: mainContentHeight
    };
};
