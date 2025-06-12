import React, { useState } from 'react';
import { QuestionImport } from './manager/QuestionImport';
import { QuestionList } from './manager/QuestionList';
import { Settings } from './manager/Settings';

type TabType = 'import' | 'list' | 'settings';

export const ManagerApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('import');

    const renderContent = () => {
        switch (activeTab) {
            case 'import':
                return <QuestionImport />;
            case 'list':
                return <QuestionList />;
            case 'settings':
                return <Settings />;
            default:
                return <QuestionImport />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                知识花园 - 题目管理系统
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                返回游戏
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 标签页导航 */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'import'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            题目导入
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'list'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            题目列表
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            系统设置
                        </button>
                    </nav>
                </div>

                {/* 内容区域 */}
                <div className="bg-white rounded-lg shadow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}; 