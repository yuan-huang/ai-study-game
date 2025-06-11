import React, { useState } from 'react';
import { gameStateStores } from '@/stores/GameStateStores';
import { getSpiritWelcome } from '@/api/spirteApi';
import { gameEvents } from '@/utils/gameEvents';
import styles from './LoginForm.module.css';

interface GradeOption {
    text: string;
    value: string;
}

interface LoginFormProps {
    isVisible: boolean;
    onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isVisible, onClose }) => {
    const [username, setUsername] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('4');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const gradeOptions: GradeOption[] = [
        { text: '小学四年级', value: '4' },
    ];

    const showError = (message: string) => {
        setErrorMessage(message);
        gameEvents.emit('loginError', { message });
        
        setTimeout(() => {
            setErrorMessage('');
        }, 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoggingIn) return;
        
        if (!username.trim()) {
            showError('请输入你的名字');
            return;
        }

        setIsLoggingIn(true);

        try {
            const userData = await gameStateStores.login(
                username.trim(), 
                parseInt(selectedGrade), 
                ['语文', '数学', '英语']
            );
            
            // 保存到本地存储
            localStorage.setItem('gameUser', JSON.stringify(userData));
            localStorage.setItem('gameUserCacheTime', Date.now().toString());
            
            // 获取欢迎语句
            const welcomeMessage = await getSpiritWelcome();
            
            // 发射登录成功事件
            gameEvents.emit('loginSuccess', {
                welcomeMessage: welcomeMessage.data?.welcomeMessage,
                userData
            });
            
            // 隐藏表单
            gameEvents.emit('hideLoginForm', {});
            if (onClose) onClose();
            
        } catch (error) {
            console.error('登录失败:', error);
            showError('登录失败，请重试');
            setIsLoggingIn(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as any);
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        className={styles.formInput}
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoggingIn}
                        autoFocus
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <select
                        className={styles.gradeSelect}
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        disabled={isLoggingIn}
                    >
                        {gradeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.text}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={isLoggingIn}
                    style={{ opacity: isLoggingIn ? 0.7 : 1 }}
                >
                    {isLoggingIn ? '进入中...' : '开始探索'}
                </button>
                
                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
}; 