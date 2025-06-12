import React, { useState, useEffect } from 'react';

interface SystemSettings {
    maxQuestionsPerGame: number;
    timePerQuestion: number;
    difficultyWeights: {
        easy: number;
        medium: number;
        hard: number;
    };
    enableCategories: string[];
    gameSettings: {
        enableSound: boolean;
        enableAnimations: boolean;
        autoNext: boolean;
    };
}

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        maxQuestionsPerGame: 10,
        timePerQuestion: 30,
        difficultyWeights: {
            easy: 0.4,
            medium: 0.4,
            hard: 0.2
        },
        enableCategories: [],
        gameSettings: {
            enableSound: true,
            enableAnimations: true,
            autoNext: false
        }
    });

    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings({ ...settings, ...data });
            }
        } catch (error) {
            console.error('获取设置失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/questions/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('获取分类失败:', error);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveResult(null);

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setSaveResult('设置保存成功');
            } else {
                setSaveResult('设置保存失败');
            }
        } catch (error) {
            console.error('保存设置错误:', error);
            setSaveResult('保存设置时发生错误');
        } finally {
            setSaving(false);
        }
    };

    const handleDifficultyWeightChange = (difficulty: 'easy' | 'medium' | 'hard', value: number) => {
        const newWeights = { ...settings.difficultyWeights };
        newWeights[difficulty] = value / 100; // 转换为小数

        // 确保权重总和为1
        const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
        if (total > 0) {
            Object.keys(newWeights).forEach(key => {
                newWeights[key as keyof typeof newWeights] = newWeights[key as keyof typeof newWeights] / total;
            });
        }

        setSettings({
            ...settings,
            difficultyWeights: newWeights
        });
    };

    const handleCategoryToggle = (category: string) => {
        const newCategories = settings.enableCategories.includes(category)
            ? settings.enableCategories.filter(c => c !== category)
            : [...settings.enableCategories, category];

        setSettings({
            ...settings,
            enableCategories: newCategories
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">系统设置</h2>
                <p className="text-gray-600">
                    配置游戏相关的设置和参数
                </p>
            </div>

            <div className="space-y-8">
                {/* 游戏基础设置 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">游戏基础设置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                每场游戏最大题目数
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={settings.maxQuestionsPerGame}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    maxQuestionsPerGame: parseInt(e.target.value) || 10
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                每题时间限制（秒）
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="300"
                                value={settings.timePerQuestion}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    timePerQuestion: parseInt(e.target.value) || 30
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 难度权重设置 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">难度分布权重</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        设置游戏中不同难度题目的出现比例
                    </p>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">简单题目</label>
                                <span className="text-sm text-gray-500">
                                    {Math.round(settings.difficultyWeights.easy * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(settings.difficultyWeights.easy * 100)}
                                onChange={(e) => handleDifficultyWeightChange('easy', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">中等题目</label>
                                <span className="text-sm text-gray-500">
                                    {Math.round(settings.difficultyWeights.medium * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(settings.difficultyWeights.medium * 100)}
                                onChange={(e) => handleDifficultyWeightChange('medium', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">困难题目</label>
                                <span className="text-sm text-gray-500">
                                    {Math.round(settings.difficultyWeights.hard * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(settings.difficultyWeights.hard * 100)}
                                onChange={(e) => handleDifficultyWeightChange('hard', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* 题目分类设置 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">启用的题目分类</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        选择游戏中要包含的题目分类
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {categories.map(category => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableCategories.includes(category)}
                                    onChange={() => handleCategoryToggle(category)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{category}</span>
                            </label>
                        ))}
                    </div>

                    {categories.length === 0 && (
                        <p className="text-sm text-gray-500">暂无可用分类，请先导入题目</p>
                    )}
                </div>

                {/* 游戏体验设置 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">游戏体验设置</h3>

                    <div className="space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.gameSettings.enableSound}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    gameSettings: {
                                        ...settings.gameSettings,
                                        enableSound: e.target.checked
                                    }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700">启用音效</p>
                                <p className="text-xs text-gray-500">游戏中播放背景音乐和音效</p>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.gameSettings.enableAnimations}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    gameSettings: {
                                        ...settings.gameSettings,
                                        enableAnimations: e.target.checked
                                    }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700">启用动画效果</p>
                                <p className="text-xs text-gray-500">显示过渡动画和特效</p>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.gameSettings.autoNext}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    gameSettings: {
                                        ...settings.gameSettings,
                                        autoNext: e.target.checked
                                    }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700">自动进入下一题</p>
                                <p className="text-xs text-gray-500">回答正确后自动跳转到下一题</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* 保存按钮 */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>

            {/* 保存结果提示 */}
            {saveResult && (
                <div className={`mt-4 p-4 rounded-lg ${saveResult.includes('成功')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {saveResult}
                </div>
            )}
        </div>
    );
}; 