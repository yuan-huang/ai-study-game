import { Types } from 'phaser';
import { LoadingScene } from '../scenes/LoadingScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { LoginScene } from '../scenes/LoginScene';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { MainScene } from '../scenes/MainScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';

const isDev = import.meta.env.DEV;

export const GameConfig: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: isDev
        }
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        }]
    },
    scene: [
        LoginScene,
        LoadingScene,
        MainScene,
        LevelSelectScene,
        // MainMenuScene
        // 其他场景将在这里添加
    ],
    audio: {
        disableWebAudio: false
    },
    render: {
        pixelArt: true,
        antialias: false
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
    }
};

// 关卡类型枚举
export enum LevelType {
    TOWER_DEFENSE = 'tower_defense',    // 怪兽塔防
    IMAGE_QUIZ = 'image_quiz',          // 图片选择问题
    WORD_DRAG = 'word_drag',            // 图片拖拽单词
    WORD_MATCH = 'word_match',          // 词语匹配
    DIALOGUE = 'dialogue'               // 对话练习
}

// 关卡基础数据接口
export interface LevelData {
    id: number;                 // 关卡ID
    type: LevelType;           // 关卡类型
    title: string;             // 关卡标题
    description: string;       // 关卡描述
    difficulty: number;        // 难度等级（1-5）
    score: number;             // 通关所需分数
    timeLimit?: number;        // 时间限制（秒）
    subject: string;           // 学科（chinese/math/english）
}

// 塔防关卡数据
export interface TowerDefenseLevelData extends LevelData {
    monstersCount: number;     // 怪物总数
    monsterHealth: number;     // 怪物血量
    initialTowers: number;     // 初始塔数量
    questionCount: number;     // 题目数量
    comboTimeWindow: number;   // 连击时间窗口（秒）
}

// 图片选择关卡数据
export interface ImageQuizLevelData extends LevelData {
    questionCount: number;     // 题目数量
    optionsPerQuestion: number;// 每题选项数
    imageType: 'single' | 'comparison'; // 单图或对比图
}

// 单词拖拽关卡数据
export interface WordDragLevelData extends LevelData {
    wordCount: number;         // 单词数量
    categories: number;        // 分类数
    hasAudio: boolean;        // 是否包含音频
}

// 词语匹配关卡数据
export interface WordMatchLevelData extends LevelData {
    pairCount: number;        // 匹配对数
    timePerPair: number;      // 每对匹配时间
}

// 对话练习关卡数据
export interface DialogueLevelData extends LevelData {
    dialogueLength: number;    // 对话长度
    aiRole: string;           // AI角色
    scenario: string;         // 场景描述
}

// 获取关卡配置
export function getLevelConfig(levelId: number, subject: string): LevelData | null {
    // TODO: 从后端获取关卡配置
    // 这里先返回示例数据
    const configs: { [key: string]: { [key: number]: LevelData } } = {
        chinese: {
            1: {
                id: 1,
                type: LevelType.WORD_MATCH,
                title: '拼音练习',
                description: '通过匹配拼音和汉字来学习',
                difficulty: 1,
                score: 100,
                subject: 'chinese'
            },
            2: {
                id: 2,
                type: LevelType.IMAGE_QUIZ,
                title: '词语认知',
                description: '看图选择正确的词语',
                difficulty: 2,
                score: 150,
                subject: 'chinese'
            }
        },
        math: {
            1: {
                id: 1,
                type: LevelType.TOWER_DEFENSE,
                title: '加法闯关',
                description: '通过解答加法题目来击败怪物',
                difficulty: 1,
                score: 100,
                subject: 'math'
            },
            2: {
                id: 2,
                type: LevelType.TOWER_DEFENSE,
                title: '减法挑战',
                description: '用减法题目的答案来升级防御塔',
                difficulty: 2,
                score: 150,
                subject: 'math'
            }
        },
        english: {
            1: {
                id: 1,
                type: LevelType.WORD_DRAG,
                title: '单词配对',
                description: '将单词拖到对应的图片上',
                difficulty: 1,
                score: 100,
                subject: 'english'
            },
            2: {
                id: 2,
                type: LevelType.DIALOGUE,
                title: '日常对话',
                description: '进行简单的英语对话练习',
                difficulty: 2,
                score: 150,
                subject: 'english'
            }
        }
    };

    return configs[subject]?.[levelId] || null;
} 