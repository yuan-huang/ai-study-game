import { Types } from 'phaser';
import { LoadingScene } from '../scenes/LoadingScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { LoginScene } from '../scenes/LoginScene';

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
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: isDev
        }
    },
    scene: [
        LoginScene,
        LoadingScene,
        MainMenuScene
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