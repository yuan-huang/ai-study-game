import React, { useState, useEffect, useRef } from 'react';
import { getSpiritWelcome, chatWithSpirit, getSpiritChatHistory, clearSpiritChatHistory } from '../api/spirteApi';
import styles from './SpiritDialog.module.css';
import { ApiResponse } from '../utils/request';

interface Message {
  type: 'user' | 'spirit';
  content: string;
  timestamp?: Date;
}

interface ChatHistoryItem {
  role: 'user' | 'spirit';
  content: string;
  timestamp: Date;
}

interface ChatHistoryResponse {
  history: ChatHistoryItem[];
}

interface SpiritDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpiritDialog: React.FC<SpiritDialogProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 加载历史消息
      getSpiritChatHistory().then((response: ApiResponse<ChatHistoryResponse>) => {
        console.log("历史消息", response);
        if (response.success && response.data) {
          setMessages(response.data.history.map(item => ({
            type: item.role,
            content: item.content,
            timestamp: item.timestamp
          })));
          //如果历史消息为空，则添加欢迎语
          if (response.data.history.length === 0) {
            getSpiritWelcome().then((response: ApiResponse<{ welcomeMessage: string }>) => {
              if (response.success && response.data) {
                setMessages([{
                  type: 'spirit',
                  content: response.data.welcomeMessage
                }]);
              }
            });
            
          }
        }
      });
    }
  }, [isOpen]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      type: 'user',
      content: inputMessage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 发送到后端并获取回复
    try {
      const response = await chatWithSpirit(inputMessage);
      if (response.success && response.data) {
        setMessages(prev => [...prev, {
          type: 'spirit',
          content: response.data.message
        }]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 阻止事件冒泡
  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 阻止键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // 处理关闭
  const handleClose = () => {
    // 触发关闭事件
    window.dispatchEvent(new CustomEvent('spiritDialogClose'));
    onClose();
  };

  if (!isOpen) return null;

  const handleClearChatHistory = () => {
    clearSpiritChatHistory().then(response => {
      if (response.success) {
        setMessages([]);
      }
    });
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={handleOverlayClick}>
        <div className={styles.header}>
          <h3>精灵对话</h3>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${styles[message.type]}`}>
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputArea}>
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息..."
            />
            <button onClick={handleSendMessage}>发送</button>
            <button className={styles.clearButton} onClick={handleClearChatHistory}>清除</button>
          </div>
        </div>
      </div>
    </div>
  );
}; 