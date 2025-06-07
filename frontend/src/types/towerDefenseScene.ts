// 塔防游戏状态接口
export interface TowerDefenseGameState {
    health: number;
    score: number;
    combo: number;
    maxCombo: number;
    currentWave: number;
    totalWaves: number;
    isPlaying: boolean;
    isPaused: boolean;
    gameSpeed: number;
    correctAnswers: number;
    totalQuestions: number;
    currentLevel: number;
    levelProgress: number;
    questionsPerLevel: number;
    totalLevels: number;
}

// 用户配置接口
export interface UserConfig {
    userLevel: number;
    category: string;
    grade: number;
    subject: string;
}

// 题目接口
export interface Question {
    id?: number;
    question: string;
    options: string[];
    correct: string;
    difficulty?: string;
    explanation?: string;
}

// 塔类型
export interface TowerType {
    type: string;
    name: string;
    cost: number;
    damage?: number;
    range: number;
    fireRate?: number;
    level: number;
    maxLevel: number;
    image: string | undefined;
    icon: string;
}

// 敌人类型
export interface EnemyType {
    type: string;
    health: number;
    speed: number;
    reward?: number;
    image: string | undefined;
}

// 塔对象接口
export interface Tower extends Phaser.GameObjects.Image {
    towerType: TowerType;
    lastFired: number;
    rangeCircle?: Phaser.GameObjects.Graphics;
}

// 敌人对象接口
export interface Enemy extends Phaser.GameObjects.Image {
    enemyType: EnemyType;
    currentHealth: number;
    maxHealth: number;
    pathIndex: number;
    pathT: number;
    healthBar?: Phaser.GameObjects.Graphics;
    healthBarBg?: Phaser.GameObjects.Graphics;
}

// 投射物对象接口
export interface Projectile extends Phaser.GameObjects.Image {
    target: Enemy;
    damage: number;
    speed: number;
}