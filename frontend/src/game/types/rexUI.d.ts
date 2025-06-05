import 'phaser';

declare module 'phaser' {
    interface Scene {
        rexUI: any; // 这里可以根据需要详细定义 rexUI 的类型
    }
}

declare module 'phaser3-rex-plugins/templates/ui/ui-components.js' {
    export class DropDownList extends Phaser.GameObjects.GameObject {
        constructor(scene: Phaser.Scene, config: {
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            background?: Phaser.GameObjects.GameObject;
            text?: Phaser.GameObjects.Text;
            panel?: {
                background?: Phaser.GameObjects.GameObject;
                items?: Phaser.GameObjects.Text[];
            };
            space?: {
                left?: number;
                right?: number;
                top?: number;
                bottom?: number;
                panel?: number;
                item?: number;
            };
        });

        getSelectedText(): string;
        destroy(): void;
    }
}

declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js'; 