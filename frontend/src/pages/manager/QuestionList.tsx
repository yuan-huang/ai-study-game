import React, { useState, useEffect } from 'react';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;
    createdAt: string;
}

export const QuestionList: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [questionsPerPage] = useState(10);

    // 获取题目列表
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/questions');
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
            } else {
                console.error('获取题目列表失败');
            }
        } catch (error) {
            console.error('获取题目列表错误:', error);
        } finally {
            setLoading(false);
        }
    };

    // 删除题目
    const handleDelete = async (questionId: string) => {
        if (!confirm('确定要删除这道题目吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/questions/${questionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setQuestions(questions.filter(q => q.id !== questionId));
                alert('题目删除成功');
            } else {
                alert('题目删除失败');
            }
        } catch (error) {
            console.error('删除题目错误:', error);
            alert('删除题目失败');
        }
    };

    // 筛选和搜索
    const filteredQuestions = questions.filter(question => {
        const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
        const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesCategory && matchesDifficulty && matchesSearch;
    });

    // 分页
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

    // 获取所有分类
    const categories = Array.from(new Set(questions.map(q => q.category)));

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '简单';
            case 'medium': return '中等';
            case 'hard': return '困难';
            default: return difficulty;
        }
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">题目列表</h2>
                <p className="text-gray-600">
                    共有 {questions.length} 道题目，当前显示 {filteredQuestions.length} 道
                </p>
            </div>

            {/* 筛选和搜索 */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">搜索题目</label>
                    <input
                        type="text"
                        placeholder="搜索题目内容..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">全部分类</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">全部难度</option>
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setSelectedDifficulty('all');
                            setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        重置筛选
                    </button>
                </div>
            </div>

            {/* 题目列表 */}
            <div className="space-y-4 mb-6">
                {currentQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        没有找到符合条件的题目
                    </div>
                ) : (
                    currentQuestions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-sm text-gray-500">
                                            #{indexOfFirstQuestion + index + 1}
                                        </span>
                                        <span className="text-sm text-gray-600">{question.category}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                            {getDifficultyText(question.difficulty)}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {question.question}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => handleDelete(question.id)}
                                    className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                                    title="删除题目"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-2">选项：</p>
                                <ul className="space-y-1">
                                    {question.options.map((option, optIndex) => (
                                        <li
                                            key={optIndex}
                                            className={`text-sm pl-4 ${optIndex === question.correctAnswer
                                                ? 'text-green-700 font-medium'
                                                : 'text-gray-700'
                                                }`}
                                        >
                                            {String.fromCharCode(65 + optIndex)}. {option}
                                            {optIndex === question.correctAnswer && (
                                                <span className="ml-2 text-green-600">✓</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {question.explanation && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-1">解释：</p>
                                    <p className="text-sm text-gray-700">{question.explanation}</p>
                                </div>
                            )}

                            <div className="text-xs text-gray-500">
                                创建时间: {new Date(question.createdAt).toLocaleString('zh-CN')}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        上一页
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 border rounded-md text-sm font-medium ${currentPage === page
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        下一页
                    </button>
                </div>
            )}
        </div>
    );
}; 