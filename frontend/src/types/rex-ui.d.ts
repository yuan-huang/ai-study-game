declare module 'phaser3-rex-plugins/dist/rexuiplugin.min.js' {
    const UIPlugin: any;
    export default UIPlugin;
}

declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js' {
    const UIPlugin: any;
    export default UIPlugin;
}

// 扩展 Phaser Scene 类型
declare namespace Phaser {
    interface Scene {
        rexUI: {
            add: {
                label: (config: any) => any;
                sizer: (config: any) => any;
                scrollablePanel: (config: any) => any;
                dialog: (config: any) => any;
                roundRectangle: (x: number, y: number, width: number, height: number, radius: number, fillColor?: number, fillAlpha?: number) => any;
                textBox: (config: any) => any;
                textArea: (config: any) => any;
                numberBar: (config: any) => any;
                slider: (config: any) => any;
                gridSizer: (config: any) => any;
                fixWidthSizer: (config: any) => any;
                overlapSizer: (config: any) => any;
                toast: (config: any) => any;
                tabs: (config: any) => any;
                menu: (config: any) => any;
                click: (gameObject: any, config?: any) => any;
                tap: (gameObject: any, config?: any) => any;
                press: (gameObject: any, config?: any) => any;
                swipe: (gameObject: any, config?: any) => any;
                pan: (gameObject: any, config?: any) => any;
                pinch: (gameObject: any, config?: any) => any;
                rotate: (gameObject: any, config?: any) => any;
                flip: (gameObject: any, config?: any) => any;
                shake: (gameObject: any, config?: any) => any;
                [key: string]: any;
            };
            [key: string]: any;
        };
    }
}

// 全局声明以确保在任何地方都能访问
declare global {
    namespace Phaser {
        interface Scene {
            rexUI: {
                add: {
                    label: (config: any) => any;
                    sizer: (config: any) => any;
                    scrollablePanel: (config: any) => any;
                    dialog: (config: any) => any;
                    roundRectangle: (x: number, y: number, width: number, height: number, radius: number, fillColor?: number, fillAlpha?: number) => any;
                    textBox: (config: any) => any;
                    textArea: (config: any) => any;
                    numberBar: (config: any) => any;
                    slider: (config: any) => any;
                    gridSizer: (config: any) => any;
                    fixWidthSizer: (config: any) => any;
                    overlapSizer: (config: any) => any;
                    toast: (config: any) => any;
                    tabs: (config: any) => any;
                    menu: (config: any) => any;
                    click: (gameObject: any, config?: any) => any;
                    tap: (gameObject: any, config?: any) => any;
                    press: (gameObject: any, config?: any) => any;
                    swipe: (gameObject: any, config?: any) => any;
                    pan: (gameObject: any, config?: any) => any;
                    pinch: (gameObject: any, config?: any) => any;
                    rotate: (gameObject: any, config?: any) => any;
                    flip: (gameObject: any, config?: any) => any;
                    shake: (gameObject: any, config?: any) => any;
                    [key: string]: any;
                };
                [key: string]: any;
            };
        }
    }
}