/**
 * 认证工具模块
 * 提供统一的认证失败处理、token清理等功能
 */

/**
 * 清除所有认证相关的本地存储
 */
export function clearAuthData(): void {
    console.log('🗑️ 清除认证数据');
    localStorage.removeItem('token');
    localStorage.removeItem('gameUser');
    localStorage.removeItem('gameUserCacheTime');
    localStorage.removeItem('welcomeMessage');
    localStorage.removeItem('welcomeMessageTimestamp');
}

/**
 * 检查是否有有效的认证token
 */
export function hasValidAuth(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('gameUser');
    return !!(token && user);
}

/**
 * 获取当前的认证token
 */
export function getAuthToken(): string | null {
    return localStorage.getItem('token');
}

/**
 * 处理认证失败，跳转到登录页面
 * @param scene - Phaser场景实例
 * @param message - 错误消息
 */
export function handleAuthFailure(scene: Phaser.Scene, message: string = '认证失败'): void {
    console.warn('🚨 处理认证失败:', message);
    
    // 清除认证数据
    clearAuthData();
    
    // 停止所有音效
    scene.sound.stopAll();
    
    // 淡出效果并跳转到登录页面
    scene.cameras.main.fadeOut(500, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start('LoginScene');
    });
}

/**
 * 检查API响应是否为认证错误
 * @param response - API响应
 */
export function isAuthError(response: any): boolean {
    return response && !response.success && (
        response.status === 401 || 
        response.status === 403 ||
        (response.message && response.message.includes('认证')) ||
        (response.message && response.message.includes('令牌'))
    );
}

/**
 * 发送全局认证失败事件
 * @param status - HTTP状态码
 * @param message - 错误消息
 */
export function emitAuthFailedEvent(status: number, message: string): void {
    const authFailedEvent = new CustomEvent('authFailed', { 
        detail: { status, message } 
    });
    window.dispatchEvent(authFailedEvent);
}

/**
 * 安全地执行需要认证的操作
 * @param operation - 需要认证的异步操作
 * @param scene - Phaser场景实例
 * @param fallback - 认证失败时的回调函数
 */
export async function withAuthGuard<T>(
    operation: () => Promise<T>,
    scene?: Phaser.Scene,
    fallback?: (error: any) => void
): Promise<T | null> {
    try {
        if (!hasValidAuth()) {
            throw new Error('无效的认证状态');
        }
        
        return await operation();
    } catch (error) {
        console.error('认证保护的操作失败:', error);
        
        if (scene) {
            handleAuthFailure(scene, error instanceof Error ? error.message : '操作失败');
        }
        
        if (fallback) {
            fallback(error);
        }
        
        return null;
    }
}

/**
 * 创建认证失败监听器
 * @param scene - Phaser场景实例
 * @param customHandler - 自定义处理函数（可选）
 */
export function createAuthFailedListener(
    scene: Phaser.Scene, 
    customHandler?: (detail: any) => void
): () => void {
    const authFailedHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.warn('收到全局认证失败事件:', customEvent.detail);
        
        if (customHandler) {
            customHandler(customEvent.detail);
        } else {
            handleAuthFailure(scene, customEvent.detail?.message || '认证失败');
        }
    };
    
    window.addEventListener('authFailed', authFailedHandler);
    
    // 返回清理函数
    return () => {
        window.removeEventListener('authFailed', authFailedHandler);
    };
} 