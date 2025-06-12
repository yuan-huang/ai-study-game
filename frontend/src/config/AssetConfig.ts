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
        },
        // 设置图标
        {
            key: 'settings-icon',
            path: '/images/ui/icons/settings-icon.svg',
            type: AssetType.IMAGE
        },

        // 使用道具音效 - 通用道具使用反馈
        {
            key: 'mission-accomplished-sound',
            path: '/audio/MissionAccomplishedSound.mp3',
            type: AssetType.AUDIO
        },
        //frontend\public\images\ui\avatar\avatar-bg.png
        {
            key: 'avatar-bg',
            path: '/images/ui/avatar/avatar-bg.png',
            type: AssetType.IMAGE
        }
    ],

    // 登录场景资源
    LoginScene: [
        {
            key: 'login-canvas',
            path: '/images/ui/main-ui/login-bg.jpg',
            type: AssetType.IMAGE
        },
        // 登陆界面音乐 - 登录场景背景音乐
        {
            key: 'landing-interface-music',
            path: '/audio/LandingInterfaceMusic.mp3',
            type: AssetType.AUDIO
        }
    ],

    // 主场景资源
    MainScene: [
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
        // 主城背景音乐 - 主场景背景音乐
        {
            key: 'main-city-bgm',
            path: '/audio/MainCityBackgroundMusic.mp3',
            type: AssetType.AUDIO
        }

    ],

    // 关卡选择场景资源
    LevelSelect: [
        //frontend\public\images\ui\level-select\level-select-bg.png
        {
            key: 'level-select-bg',
            path: '/images/ui/level-select/level-select-bg.png',
            type: AssetType.IMAGE
        },
        // 关卡背景音乐 - 关卡选择和游戏进行时的背景音乐
        {
            key: 'level-background-music',
            path: '/audio/MainCityBackgroundMusic.mp3',
            type: AssetType.AUDIO
        }
    ],

    // 塔防关卡资源
    TowerDefense: [
        //frontend\public\images\ui\main-ui\towerDefense-bg.jpeg
        {
            key: 'towerDefense-bg',
            path: '/images/ui/main-ui/towerDefense-bg.png',
            type: AssetType.IMAGE
        },
        // frontend\public\images\ui\entities\tower-arrow.png
        {
            key: 'tower-arrow',
            path: '/images/ui/entities/tower-arrow.png',
            type: AssetType.IMAGE
        },
        // frontend\public\images\ui\entities\tower-cannon.png
        {
            key: 'tower-rocket',
            path: '/images/ui/entities/tower-rocket.png',
            type: AssetType.IMAGE
        },
        // frontend\public\images\ui\entities\tower-freeze.png
        {
            key: 'tower-freeze',
            path: '/images/ui/entities/tower-freeze.png',
            type: AssetType.IMAGE
        },
        // frontend\public\images\ui\entities\tower-laser.png
        {
            key: 'tower-laser',
            path: '/images/ui/entities/tower-laser.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\entities\tower-nomarl.png
        {
            key: 'tower-poison',
            path: '/images/ui/entities/tower-poison.png',
            type: AssetType.IMAGE
        },
        // 防御塔攻击音效 1 - 防御塔攻击时的音效
        {
            key: 'defense-tower-attack-1',
            path: '/audio/DefenseTowerAttackSound1.mp3',
            type: AssetType.AUDIO
        },
        // 防御塔攻击音效 2 - 防御塔攻击时的音效
        {
            key: 'defense-tower-attack-2',
            path: '/audio/DefenseTowerAttackSound2.mp3',
            type: AssetType.AUDIO
        },
        // 击杀音效 - 击败怪物时的音效
        {
            key: 'elimination-sound',
            path: '/audio/EliminationSoundEffect.mp3',
            type: AssetType.AUDIO
        },
        // 点击音效 - 通用UI交互音效
        {
            key: 'click-sound',
            path: '/audio/ClickSoundEffect.mp3',
            type: AssetType.AUDIO
        },
        // 答题正确音效 - 通用答题反馈
        {
            key: 'correct-answer-sound',
            path: '/audio/CorrectAnswerSoundEffect.mp3',
            type: AssetType.AUDIO
        },
        // 通关音效 - 通用关卡完成音效
        {
            key: 'clearance-sound',
            path: '/audio/ClearanceSoundEffect.mp3',
            type: AssetType.AUDIO
        },

    ],

    Monster: [
        //frontend\public\images\ui\entities\monster-gluttonous.png
        {
            key: 'monster-gluttonous',
            path: '/images/ui/entities/monster-gluttonous.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\entities\monster-grumpy.png
        {
            key: 'monster-grumpy',
            path: '/images/ui/entities/monster-grumpy.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\entities\monster-lazy.png
        {
            key: 'monster-lazy',
            path: '/images/ui/entities/monster-lazy.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\entities\monster-messy.png
        {
            key: 'monster-messy',
            path: '/images/ui/entities/monster-messy.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\entities\monster-prankster.png
        {
            key: 'monster-prankster',
            path: '/images/ui/entities/monster-prankster.png',
            type: AssetType.IMAGE
        },
    ],

    //知识之花
    KnowledgeFlower: [
        //frontend\public\images\ui\main-ui\garden.jpg
        {
            key: 'garden',
            path: '/images/ui/main-ui/garden.jpg',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\storage\backpack.png
        {
            key: 'backpack',
            path: '/images/ui/storage/backpack.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\flowers\flower-chinese.png
        {
            key: 'flower-chinese',
            path: '/images/ui/flowers/flower-chinese.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\flowers\flower-math.png
        {
            key: 'flower-math',
            path: '/images/ui/flowers/flower-math.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\flowers\flower-english.png      
        {
            key: 'flower-english',
            path: '/images/ui/flowers/flower-english.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\flowers\flower-technology.png
        {
            key: 'flower-technology',
            path: '/images/ui/flowers/flower-technology.png',
            type: AssetType.IMAGE
        },
        //frontend\public\images\ui\flowers\flower-marine.png
        {
            key: 'flower-marine',
            path: '/images/ui/flowers/flower-marine.png',
            type: AssetType.IMAGE
        },
        //甘露 frontend\public\images\ui\storage\sweet-dew.png
        {
            key: 'nectar',
            path: '/images/ui/storage/sweet-dew.png',
            type: AssetType.IMAGE
        },
        // 知识花园背景音乐 - 知识花园场景的背景音乐
        {
            key: 'garden-bgm',
            path: '/audio/KnowledgeGardenBackgroundMusic.mp3',
            type: AssetType.AUDIO
        }
    ],


    // 好奇树
    CuriousTree: [
        //frontend\public\images\ui\main-ui\curious-tree.jpg
        {
            key: 'curious-tree-bg',
            path: '/images/ui/main-ui/curious-tree-bg.jpg',
            type: AssetType.IMAGE
        },
        // 好奇树背景音乐 - 好奇树场景的背景音乐
        {
            key: 'curious-tree-bgm',
            path: '/audio/KnowledgeGardenBackgroundMusic.mp3',
            type: AssetType.AUDIO
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
