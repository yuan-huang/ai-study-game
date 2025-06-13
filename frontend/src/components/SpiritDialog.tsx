import React, { useState, useEffect, useRef } from 'react';
import { getSpiritWelcome, chatWithSpirit, getSpiritChatHistory, clearSpiritChatHistory, chatWithSpiritStream } from '../api/spirteApi';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
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
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage; // 保存消息内容
    // 添加用户消息
    const userMessage: Message = {
      type: 'user',
      content: messageToSend
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsStreaming(true);

    // 添加一个空的精灵消息用于流式更新
    const spiritMessage: Message = {
      type: 'spirit',
      content: ''
    };
    setMessages(prev => [...prev, spiritMessage]);

    try {
      // 使用流式对话API
      console.log('开始流式对话:', messageToSend);
      await chatWithSpiritStream(messageToSend, (chunk) => {
        console.log('收到流式数据块:', chunk);
        // 更新精灵消息内容
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].type === 'spirit') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: newMessages[lastIndex].content + chunk
            };
          }
          return newMessages;
        });
      });
      console.log('流式对话完成');
    } catch (error) {
      console.error('发送消息失败:', error);
      let errorMessage = '抱歉，我遇到了一些问题，请稍后再试。';

      if (error instanceof Error) {
        if (error.message === '未登录') {
          errorMessage = '请先登录后再试。';
          window.dispatchEvent(new CustomEvent('authRequired'));
        }
      }

      // 更新为错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex] && newMessages[lastIndex].type === 'spirit') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: errorMessage
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
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
                <div className={styles.messageContent}>
                  {message.content}
                  {index === messages.length - 1 && message.type === 'spirit' && isStreaming && (
                    <span className={styles.typingIndicator}>▋</span>
                  )}
                </div>
                {message.type === 'spirit' && (
                  <div className={styles.messageTime}>
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '刚刚'}
                  </div>
                )}
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
              placeholder={isStreaming ? "精灵正在回复中..." : "输入消息..."}
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? '发送中...' : '发送'}
            </button>
            <button
              className={styles.clearButton}
              onClick={handleClearChatHistory}
              disabled={isLoading}
              title="清除聊天记录"
            >
              清除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 