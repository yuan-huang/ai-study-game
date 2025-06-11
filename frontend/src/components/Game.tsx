import React, { useState, useEffect } from 'react';
import { SpiritDialog } from './SpiritDialog';
import { LoginForm } from './LoginForm';
import { gameEvents } from '@/utils/gameEvents';

export const Game: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);
  const [spiritPosition, setSpiritPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 监听精灵点击事件
    const unsubscribeSpiritClick = gameEvents.on('spiritClick', (data) => {
      console.log('Game组件收到spiritClick事件', data);
      setIsDialogOpen(true);
    });

    // 监听显示登录表单事件
    const unsubscribeShowLogin = gameEvents.on('showLoginForm', () => {
      console.log('Game组件收到showLoginForm事件');
      setIsLoginFormVisible(true);
    });

    // 监听隐藏登录表单事件
    const unsubscribeHideLogin = gameEvents.on('hideLoginForm', () => {
      console.log('Game组件收到hideLoginForm事件');
      setIsLoginFormVisible(false);
    });

    // 监听登录成功事件
    const unsubscribeLoginSuccess = gameEvents.on('loginSuccess', (data) => {
      console.log('Game组件收到loginSuccess事件', data);
      // 这里可以进行场景切换的处理
      // 比如通知Phaser场景管理器
      const event = new CustomEvent('phaserLoginSuccess', {
        detail: data
      });
      window.dispatchEvent(event);
    });

    // 监听登录错误事件
    const unsubscribeLoginError = gameEvents.on('loginError', (data) => {
      console.error('登录错误:', data.message);
      // 可以在这里显示全局错误提示
    });

    // 清理事件监听器
    return () => {
      unsubscribeSpiritClick();
      unsubscribeShowLogin();
      unsubscribeHideLogin();
      unsubscribeLoginSuccess();
      unsubscribeLoginError();
    };
  }, []);

  return (
    <>
      {/* 精灵对话框 */}
      <SpiritDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      
      {/* 登录表单 */}
      <LoginForm 
        isVisible={isLoginFormVisible}
        onClose={() => setIsLoginFormVisible(false)}
      />
    </>
  );
}; 