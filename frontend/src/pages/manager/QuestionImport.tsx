import React, { useState, useCallback } from 'react';

interface Question {
    id?: string;
    question: string;
    options: string[];
    correctAnswer: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;
}

export const QuestionImport: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        setFile(selectedFile);

        if (selectedFile.type === 'application/json') {
            try {
                const text = await selectedFile.text();
                const data = JSON.parse(text);
                setQuestions(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error('JSON解析失败:', error);
                alert('JSON文件格式错误');
            }
        } else if (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv') {
            // CSV解析逻辑
            try {
                const text = await selectedFile.text();
                const csvData = parseCSV(text);
                setQuestions(csvData);
            } catch (error) {
                console.error('CSV解析失败:', error);
                alert('CSV文件格式错误');
            }
        }
    };

    const parseCSV = (csvText: string): Question[] => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
                question: values[0] || '',
                options: [values[1], values[2], values[3], values[4]].filter(Boolean),
                correctAnswer: parseInt(values[5]) || 0,
                category: values[6] || '通用',
                difficulty: (values[7] as 'easy' | 'medium' | 'hard') || 'medium',
                explanation: values[8] || ''
            };
        });
    };

    const handleImport = async () => {
        if (questions.length === 0) {
            alert('请先上传包含题目的文件');
            return;
        }

        setImporting(true);
        try {
            const response = await fetch('/api/questions/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions }),
            });

            if (response.ok) {
                const result = await response.json();
                setImportResult(result);
                setQuestions([]);
                setFile(null);
            } else {
                throw new Error('导入失败');
            }
        } catch (error) {
            console.error('导入错误:', error);
            alert('导入失败，请检查网络连接和数据格式');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">题目导入</h2>
                <p className="text-gray-600">
                    支持导入JSON和CSV格式的题目文件。请确保文件格式正确。
                </p>
            </div>

            {/* 文件上传区域 */}
            <div className="mb-8">
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="mb-4">
                        <p className="text-lg text-gray-600 mb-2">
                            拖拽文件到此处，或
                        </p>
                        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                            选择文件
                            <input
                                type="file"
                                className="hidden"
                                accept=".json,.csv"
                                onChange={handleFileInput}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">
                        支持 JSON 和 CSV 格式文件
                    </p>
                </div>

                {file && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            已选择文件: <span className="font-medium">{file.name}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            解析到 {questions.length} 道题目
                        </p>
                    </div>
                )}
            </div>

            {/* 预览区域 */}
            {questions.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">题目预览</h3>
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                        {questions.slice(0, 5).map((question, index) => (
                            <div key={index} className="p-4 border-b last:border-b-0">
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">题目 {index + 1}:</span>
                                    <p className="text-gray-900">{question.question}</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">选项:</span>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {question.options.map((option, optIndex) => (
                                            <li key={optIndex} className={optIndex === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex space-x-4 text-sm text-gray-500">
                                    <span>分类: {question.category}</span>
                                    <span>难度: {question.difficulty}</span>
                                </div>
                            </div>
                        ))}
                        {questions.length > 5 && (
                            <div className="p-4 text-center text-gray-500">
                                还有 {questions.length - 5} 道题目...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 导入按钮 */}
            {questions.length > 0 && (
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => {
                            setQuestions([]);
                            setFile(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        清除
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {importing ? '导入中...' : `导入 ${questions.length} 道题目`}
                    </button>
                </div>
            )}

            {/* 导入结果 */}
            {importResult && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-lg font-medium text-green-800 mb-2">导入完成</h4>
                    <p className="text-green-700">
                        成功导入 {importResult.success} 道题目
                        {importResult.failed > 0 && `, ${importResult.failed} 道题目导入失败`}
                    </p>
                </div>
            )}
        </div>
    );
}; 