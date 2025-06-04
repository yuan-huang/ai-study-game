import React, { useEffect, useRef } from 'react';
import 'phaser';
import { useUserStore } from '../stores/userStore';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    // 加载资源
    this.load.image('ground', '/assets/ground.png');
    this.load.image('building', '/assets/building.png');
    this.load.image('npc', '/assets/npc.png');
    this.load.spritesheet('player', '/assets/player.png', { frameWidth: 32, frameHeight: 48 });
  }

  create(): void {
    // 创建地面
    this.add.tileSprite(512, 300, 1024, 600, 'ground');

    // 创建建筑
    const buildings = [
      { x: 200, y: 200, name: '语文科' },
      { x: 512, y: 200, name: '数学科' },
      { x: 824, y: 200, name: '英语科' }
    ];

    buildings.forEach(building => {
      const sprite = this.add.sprite(building.x, building.y, 'building');
      const text = this.add.text(building.x, building.y + 50, building.name, {
        fontSize: '20px',
        color: '#000'
      });
      text.setOrigin(0.5);
    });

    // 创建中心花园
    const gardenGraphics = this.add.graphics();
    gardenGraphics.lineStyle(2, 0x00ff00);
    gardenGraphics.strokeCircle(512, 400, 50);
    const gardenText = this.add.text(512, 400, '知识花园', {
      fontSize: '16px',
      color: '#000'
    });
    gardenText.setOrigin(0.5);

    // 创建NPC
    const npc = this.add.sprite(512, 300, 'npc');
    const npcText = this.add.text(512, 330, '智慧精灵', {
      fontSize: '14px',
      color: '#000'
    });
    npcText.setOrigin(0.5);
  }
}

const GameIndex: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 1024,
      height: 600,
      parent: gameRef.current,
      scene: MainScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      render: {
        pixelArt: true,
        antialias: false
      }
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">姓名：</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">年级：</span>
              <span className="font-medium">{user?.grade}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">性别：</span>
              <span className="font-medium">{user?.gender}</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">经验值：</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">等级：</span>
              <span className="font-medium">1</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="game-content">
        <div ref={gameRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default GameIndex; 