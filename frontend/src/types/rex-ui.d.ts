// Rex-UI 插件类型定义
declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js' {
    const UIPlugin: any;
    export default UIPlugin;
}

// 扩展 Phaser 场景类型
declare module 'phaser' {
    interface Scene {
        rexUI: {
            add: {
                dialog(config: any): any;
                sizer(config: any): any;
                gridSizer(config: any): any;
                scrollablePanel(config: any): any;
                roundRectangle(x: number, y: number, width: number, height: number, radius: number, color: number): any;
            };
        };
    }
} 