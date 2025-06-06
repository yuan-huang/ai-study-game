// 资源类型枚举
export enum AssetType {
    IMAGE = 'image',
    AUDIO = 'audio',
    SPRITE = 'sprite',
}

// 资源配置接口
interface AssetItem {
    key: string;
    path: string;
    type: AssetType;
    frameConfig?: {
        frameWidth: number;
        frameHeight: number;
        startFrame?: number;
        endFrame?: number;
        margin?: number;
        spacing?: number;
    };
}

// 场景资源配置
interface SceneAssets {
    [key: string]: AssetItem[];
}

// 游戏资源配置表
export const GameAssets: SceneAssets = {

    // 公共资源
    Common: [
        //frontend\public\images\ui\base\cursor-arrow.svg
        {
            key: 'cursor-arrow',
            path: '/images/ui/base/cursor-arrow.svg',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\base\cursor-pointer.svg
        {
            key: 'pointer',
            path: '/images/ui/base/cursor-pointer.svg',
            type: AssetType.IMAGE
        }
    ],

    // 登录场景资源
    LoginScene: [
        {
            key: 'login-canvas',
            path: '/images/ui/main-ui/login-bg.jpeg',
            type: AssetType.IMAGE
        },
        {
            key: 'login-bgm',
            path: '/audio/login-bgm.mp3',
            type: AssetType.AUDIO
        }
    ],
    
    // 主场景资源
    MainScene: [
        {
            key: 'enter-game',
            path: '/audio/bgm/enter-game.mp3',
            type: AssetType.AUDIO
        },
        {
            key: 'main-bg',
            path: '/images/ui/main-ui/main-canvas.jpg',
            type: AssetType.IMAGE
        },
        // 语文建筑，数学建筑，英语建筑
        {
            key: 'chinese-building',
            path: '/images/ui/buildings/building-chinese.png',
            type: AssetType.IMAGE
        },
        {
            key: 'math-building',
            path: '/images/ui/buildings/building-math.png',
            type: AssetType.IMAGE
        },
        {
            key: 'english-building',
            path: '/images/ui/buildings/building-english.png',
            type: AssetType.IMAGE
        },
        {
            key: 'curious-tree',
            path: '/images/ui/buildings/curious-tree.png',
            type: AssetType.IMAGE
        },
        {
            key: 'knowledge-flower',
            path: '/images/ui/buildings/knowledge-flower.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\sprites\sprite.png
        {
            key: 'sprite',
            path: '/images/ui/sprites/sprite.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\sprites\sprite-fly.png
        {
            key: 'sprite-fly',
            path: '/images/ui/sprites/sprite-fly.png',
            type: AssetType.IMAGE
        },

    ],

    // 关卡选择场景资源
    LevelSelect: [
        {
            key: 'level-map-bg',
            path: '/images/ui/level-select/level-map-bg.png',
            type: AssetType.IMAGE
        },
        {
            key: 'level-node',
            path: '/images/ui/level-select/level-node.png',
            type: AssetType.IMAGE
        },
        {
            key: 'level-node-completed',
            path: '/images/ui/level-select/level-node-completed.png',
            type: AssetType.IMAGE
        },
        {
            key: 'level-node-locked',
            path: '/images/ui/level-select/level-node-locked.png',
            type: AssetType.IMAGE
        },
        {
            key: 'level-line',
            path: '/images/ui/level-select/level-line.png',
            type: AssetType.IMAGE
        }
    ],

    // 塔防关卡资源
    TowerDefense: [
        {
            key: 'tower-defense-bg',
            path: '/images/game/tower-defense/background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'tower-base',
            path: '/images/game/tower-defense/tower-base.png',
            type: AssetType.IMAGE
        },
        {
            key: 'tower-turret',
            path: '/images/game/tower-defense/tower-turret.png',
            type: AssetType.IMAGE
        },
        {
            key: 'tower-upgrade',
            path: '/images/game/tower-defense/tower-upgrade.png',
            type: AssetType.IMAGE
        },
        {
            key: 'monster',
            path: '/images/game/tower-defense/monster-sprite.png',
            type: AssetType.SPRITE,
            frameConfig: {
                frameWidth: 64,
                frameHeight: 64,
                startFrame: 0,
                endFrame: 23
            }
        },
        {
            key: 'projectile',
            path: '/images/game/tower-defense/projectile.png',
            type: AssetType.IMAGE
        },
        {
            key: 'explosion',
            path: '/images/game/tower-defense/explosion.png',
            type: AssetType.SPRITE,
            frameConfig: {
                frameWidth: 64,
                frameHeight: 64,
                startFrame: 0,
                endFrame: 15
            }
        }
    ],

    // 图片选择关卡资源
    ImageQuiz: [
        {
            key: 'quiz-bg',
            path: '/images/game/quiz/quiz-background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'option-bg',
            path: '/images/game/quiz/option-background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'correct-icon',
            path: '/images/game/quiz/correct-icon.png',
            type: AssetType.IMAGE
        },
        {
            key: 'wrong-icon',
            path: '/images/game/quiz/wrong-icon.png',
            type: AssetType.IMAGE
        },
        // 语文题目图片示例
        {
            key: 'chinese-quiz-1',
            path: '/images/game/quiz/chinese/quiz-1.png',
            type: AssetType.IMAGE
        },
        // 数学题目图片示例
        {
            key: 'math-quiz-1',
            path: '/images/game/quiz/math/quiz-1.png',
            type: AssetType.IMAGE
        }
    ],

    // 单词拖拽关卡资源
    WordDrag: [
        {
            key: 'word-drag-bg',
            path: '/images/game/word-drag/background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'word-slot',
            path: '/images/game/word-drag/word-slot.png',
            type: AssetType.IMAGE
        },
        {
            key: 'word-bg',
            path: '/images/game/word-drag/word-background.png',
            type: AssetType.IMAGE
        },
        // 图片示例
        {
            key: 'apple-img',
            path: '/images/game/word-drag/items/apple.png',
            type: AssetType.IMAGE
        },
        {
            key: 'banana-img',
            path: '/images/game/word-drag/items/banana.png',
            type: AssetType.IMAGE
        },
        {
            key: 'orange-img',
            path: '/images/game/word-drag/items/orange.png',
            type: AssetType.IMAGE
        },
        {
            key: 'grape-img',
            path: '/images/game/word-drag/items/grape.png',
            type: AssetType.IMAGE
        }
    ],

    // 通用UI资源
    UI: [
        {
            key: 'button-bg',
            path: '/images/ui/common/button-background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'panel-bg',
            path: '/images/ui/common/panel-background.png',
            type: AssetType.IMAGE
        },
        {
            key: 'star-icon',
            path: '/images/ui/common/star-icon.png',
            type: AssetType.IMAGE
        },
        {
            key: 'coin-icon',
            path: '/images/ui/common/coin-icon.png',
            type: AssetType.IMAGE
        },
        {
            key: 'sound-on',
            path: '/images/ui/common/sound-on.png',
            type: AssetType.IMAGE
        },
        {
            key: 'sound-off',
            path: '/images/ui/common/sound-off.png',
            type: AssetType.IMAGE
        }
    ]
};

// 通过 key 获取资源路径
export function getAssetPath(key: string): string | undefined {
    // 遍历所有场景
    for (const sceneName in GameAssets) {
        const scene = GameAssets[sceneName];
        // 在场景中查找匹配的资源
        const asset = scene.find(item => item.key === key);
        if (asset) {
            return asset.path;
        }
    }
    return undefined;
}

// 通过 key 获取完整资源配置
export function getAssetConfig(key: string): AssetItem | undefined {
    for (const sceneName in GameAssets) {
        const scene = GameAssets[sceneName];
        const asset = scene.find(item => item.key === key);
        if (asset) {
            return asset;
        }
    }
    return undefined;
} 
