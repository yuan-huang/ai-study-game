// 题目API服务
import { getWithParams, post, ApiResponse } from '../utils/request';

// 学科代码类型
export type SubjectCode = 'chinese' | 'math' | 'english' | 'curious'  ;

// 难度等级类型
export type DifficultyLevel = '简单' | '中等' | '较难' | '困难';

// 答案类型（单选题答案通常是A/B/C/D）
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | string;

// 题目数据接口
export interface Question {
    _id: any;
    id: number;
    question: string;
    options: string[];
    right_answer: AnswerOption;
    category: string;
    explanation: string;
    difficulty_score: number;
    subject?: SubjectCode;
    grade?: number;
    level?: DifficultyLevel;
    source?: string;
    tags?: string[];
    usage_count?: number;
    correct_rate?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// 获取题目请求参数接口
export interface GetQuestionsParams {
    subject: SubjectCode;
    grade: number;
    category: string;
    count?: number;
}

// 获取题目响应接口
export interface GetQuestionsResponse {
    questions: Question[];
    requestedCount: number;
    actualCount: number;
    needMoreQuestions: boolean;
}

// AI生成题目请求参数接口
export interface GenerateQuestionsParams {
    subject: SubjectCode;
    grade: number;
    category: string;
    count?: number;
    difficulty?: number;
    saveToDatabase?: boolean;
}

// AI生成题目响应接口
export interface GenerateQuestionsResponse {
    questions: Question[];
    generatedCount: number;
    savedToDatabase: boolean;
}

// 智能获取题目参数接口
export interface GetQuestionsWithAIParams {
    subject: SubjectCode;
    grade: number;
    category: string;
    count?: number;
    difficulty?: number;
}

// 验证答案参数接口
export interface ValidateAnswerParams {
    question: Question;
    userAnswer: string;
}

// 计算得分参数接口
export interface CalculateScoreParams {
    question: Question;
    isCorrect: boolean;
    streak?: number;
}

// 题目统计信息接口
export interface QuestionStats {
    totalQuestions: number;
    avgDifficulty: number;
    avgCorrectRate: number;
    categories: string[];
    difficultyDistribution: Record<DifficultyLevel, number>;
}

// 游戏配置接口（用于塔防游戏等）
export interface GameConfig {
    subject: SubjectCode;
    grade: number;
    category: string;
    questionCount: number;
    waveCount?: number;
    difficulty: number;
    initialHealth?: number;
    initialScore?: number;
    scorePerCorrectAnswer?: number;
    comboBonus?: number;
}

// 错题记录接口
export interface WrongAnswerRecord {
    questionId: number;
    question: Question;
    userAnswer: string;
    correctAnswer: string;
    timestamp: Date | string;
    attempts: number;
}

/*
{
  "success": true,
  "message": "获取题目成功",
  "data": {
    "questions": [
      {
        "question": "'它板正的姿势啦，步态啦，和别的公鹅攀谈时的腔调啦'使用的修辞是",
        "category": "句子与修辞",
        "difficulty_score": 3.5,
        "explanation": "这句话把鹅的行为用人的行为来描述，使用了拟人的修辞手法。",
        "id": 39,
        "options": [
          "A. 比喻",
          "B. 拟人",
          "C. 排比",
          "D. 夸张"
        ],
        "right_answer": "B"
      },
      {
        "question": "'湖水静得像一面镜子'的修辞手法是",
        "category": "句子与修辞",
        "difficulty_score": 2.5,
        "explanation": "这句话把湖水比作镜子，使用了比喻的修辞手法。",
        "id": 36,
        "options": [
          "A. 拟人",
          "B. 比喻",
          "C. 夸张",
          "D. 排比"
        ],
        "right_answer": "B"
      },
      {
        "question": "下列句子没有语病的是",
        "category": "句子与修辞",
        "difficulty_score": 3.5,
        "explanation": "D选项语法正确，表达清楚。其他选项都有语病。",
        "id": 40,
        "options": [
          "A. 他穿了一件灰色上衣，一顶蓝帽子。",
          "B. 在老师的帮助下，我克服了错误。",
          "C. 花园里开满了五颜六色的红花。",
          "D. 经过努力，我的写作水平提高了。"
        ],
        "right_answer": "D"
      },
      {
        "question": "'恐龙的一支经过漫长的演化'中'漫长'可以替换为",
        "category": "句子与修辞",
        "difficulty_score": 2.5,
        "explanation": "'漫长'指时间很长，可以用'长久'替换。",
        "id": 41,
        "options": [
          "A. 快速",
          "B. 长久",
          "C. 短暂",
          "D. 突然"
        ],
        "right_answer": "B"
      },
      {
        "question": "下列句子表达情感最强烈的是",
        "category": "句子与修辞",
        "difficulty_score": 3.5,
        "explanation": "反问句比陈述句表达的情感更强烈，更有说服力。",
        "id": 42,
        "options": [
          "A. 这真是有趣的事情。",
          "B. 这难道不是有趣的事情吗？",
          "C. 这可能是有趣的事情。",
          "D. 这大概是有趣的事情。"
        ],
        "right_answer": "B"
      },
      {
        "question": "'三月的桃花水，是春天的竖琴'使用的修辞是",
        "category": "句子与修辞",
        "difficulty_score": 2.5,
        "explanation": "这句话把桃花水比作竖琴，使用了比喻的修辞手法。",
        "id": 38,
        "options": [
          "A. 比喻",
          "B. 拟人",
          "C. 夸张",
          "D. 排比"
        ],
        "right_answer": "A"
      },
      {
        "question": "下列标点符号使用正确的是",
        "category": "句子与修辞",
        "difficulty_score": 3.5,
        "explanation": "B选项标点符号使用正确，并列词语之间用顿号，句末用句号。",
        "id": 37,
        "options": [
          "A. '快跑！'他喊：'要下雨了！'",
          "B. 田野种着玉米、高粱、大豆。",
          "C. 妈妈问：'作业写完了吗'？",
          "D. 荷花，睡莲，芦苇都在起舞。"
        ],
        "right_answer": "B"
      }
    ],
    "requestedCount": 20,
    "actualCount": 7,
    "needMoreQuestions": true
  }
}
*/
// 题目API服务类
export class QuestionApiService {
    /**
     * 获取指定数量的题目
     * @param subject 学科代码
     * @param grade 年级
     * @param category 分类名称
     * @param count 题目数量
     */
    async getQuestions(
        subject: SubjectCode,
        grade: number,
        category: string,
        count: number = 10
    ): Promise<ApiResponse<GetQuestionsResponse>> {
        return getWithParams<GetQuestionsResponse>('/questions', {
            subject,
            grade,
            category,
            count
        });
    }

    /**
     * 获取指定数量的题目（使用参数对象）
     * @param params 请求参数
     */
    async getQuestionsWithParams(
        params: GetQuestionsParams
    ): Promise<ApiResponse<GetQuestionsResponse>> {
        return getWithParams<GetQuestionsResponse>('/questions', {
            subject: params.subject,
            grade: params.grade,
            category: params.category,
            count: params.count || 10
        });
    }

    /**
     * 通过AI生成新题目
     * @param subject 学科代码
     * @param grade 年级
     * @param category 分类名称
     * @param count 生成数量
     * @param difficulty 难度分数
     * @param saveToDatabase 是否保存到数据库
     */
    async generateQuestions(
        subject: SubjectCode,
        grade: number,
        category: string,
        count: number = 5,
        difficulty: number = 2.5,
        saveToDatabase: boolean = false
    ): Promise<ApiResponse<GenerateQuestionsResponse>> {
        return post<GenerateQuestionsResponse>('/questions/generate', {
            subject,
            grade,
            category,
            count,
            difficulty,
            saveToDatabase
        });
    }

    /**
     * 通过AI生成新题目（使用参数对象）
     * @param params 请求参数
     */
    async generateQuestionsWithParams(
        params: GenerateQuestionsParams
    ): Promise<ApiResponse<GenerateQuestionsResponse>> {
        return post<GenerateQuestionsResponse>('/questions/generate', {
            subject: params.subject,
            grade: params.grade,
            category: params.category,
            count: params.count || 5,
            difficulty: params.difficulty || 2.5,
            saveToDatabase: params.saveToDatabase || false
        });
    }

    /**
     * 智能获取题目 - 如果数据库题目不足则自动调用AI生成
     * @param subject 学科代码
     * @param grade 年级
     * @param category 分类名称
     * @param count 需要的题目数量
     * @param difficulty 难度分数
     */
    async getQuestionsWithAI(
        subject: SubjectCode,
        grade: number,
        category: string,
        count: number = 10,
        difficulty: number = 2.5
    ): Promise<ApiResponse<Question[]>> {
        try {
            // 首先尝试从数据库获取题目
            const dbResponse = await this.getQuestions(subject, grade, category, count);
            
            if (!dbResponse.success || !dbResponse.data) {
                return {
                    success: false,
                    message: '获取题目失败'
                };
            }

            const { questions, needMoreQuestions, actualCount } = dbResponse.data;
            
            // 如果题目数量足够，直接返回
            if (!needMoreQuestions) {
                return {
                    success: true,
                    data: questions,
                    message: `成功获取${actualCount}道题目`
                };
            }

            // 如果题目不足，调用AI生成补充
            const needCount = count - actualCount;
            console.log(`数据库题目不足，需要AI生成${needCount}道题目`);
            
            const aiResponse = await this.generateQuestions(
                subject, 
                grade, 
                category, 
                needCount, 
                difficulty, 
                true // 保存到数据库
            );

            if (!aiResponse.success || !aiResponse.data) {
                // AI生成失败，返回现有题目
                return {
                    success: true,
                    data: questions,
                    message: `AI生成失败，返回现有${actualCount}道题目`
                };
            }

            // 合并数据库题目和AI生成题目
            const allQuestions = [...questions, ...aiResponse.data.questions];
            
            return {
                success: true,
                data: allQuestions,
                message: `成功获取${allQuestions.length}道题目（${actualCount}道来自数据库，${aiResponse.data.generatedCount}道AI生成）`
            };

        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '获取题目异常'
            };
        }
    }

    /**
     * 验证答案
     * @param question 题目
     * @param userAnswer 用户答案
     */
    validateAnswer(question: Question, userAnswer: string): boolean {
        return question.right_answer.toLowerCase() === userAnswer.toLowerCase();
    }

    /**
     * 验证答案（使用参数对象）
     * @param params 验证参数
     */
    validateAnswerWithParams(params: ValidateAnswerParams): boolean {
        return this.validateAnswer(params.question, params.userAnswer);
    }

    /**
     * 计算得分
     * @param question 题目
     * @param isCorrect 是否答对
     * @param streak 连续答对数
     */
    calculateScore(question: Question, isCorrect: boolean, streak: number = 0): number {
        if (!isCorrect) return 0;
        
        const baseScore = 5; // 基础分数
        const difficultyBonus = Math.floor(question.difficulty_score * 2); // 难度加成
        const streakBonus = Math.min(streak, 10); // 连击加成，最多10分
        
        return baseScore + difficultyBonus + streakBonus;
    }

    /**
     * 计算得分（使用参数对象）
     * @param params 计算参数
     */
    calculateScoreWithParams(params: CalculateScoreParams): number {
        return this.calculateScore(params.question, params.isCorrect, params.streak || 0);
    }

    /**
     * 打乱题目选项
     * @param question 题目
     */
    shuffleOptions(question: Question): Question {
        const shuffledOptions = [...question.options];
        
        // Fisher-Yates洗牌算法
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        return {
            ...question,
            options: shuffledOptions
        };
    }

    /**
     * 随机排序题目数组
     * @param questions 题目数组
     */
    shuffleQuestions(questions: Question[]): Question[] {
        const shuffled = [...questions];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    /**
     * 获取难度等级描述
     * @param score 难度分数
     */
    getDifficultyLevel(score: number): DifficultyLevel {
        if (score <= 1.5) return '简单';
        if (score <= 2.5) return '中等';
        if (score <= 3.5) return '较难';
        return '困难';
    }

    /**
     * 格式化题目选项
     * @param options 原始选项数组
     */
    formatOptions(options: string[]): string[] {
        return options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            return option.startsWith(`${letter}.`) ? option : `${letter}. ${option}`;
        });
    }

    /**
     * 提取选项字母
     * @param answer 完整答案（如 "A. 选项1"）
     */
    extractAnswerLetter(answer: string): AnswerOption {
        const match = answer.match(/^([ABCD])\./);
        return match ? match[1] as AnswerOption : answer;
    }

    /**
     * 批量验证题目格式
     * @param questions 题目数组
     */
    validateQuestionsFormat(questions: Question[]): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        questions.forEach((question, index) => {
            if (!question.question || question.question.trim() === '') {
                errors.push(`第${index + 1}题：题目内容不能为空`);
            }
            
            if (!Array.isArray(question.options) || question.options.length !== 4) {
                errors.push(`第${index + 1}题：必须有4个选项`);
            }
            
            if (!question.right_answer || question.right_answer.trim() === '') {
                errors.push(`第${index + 1}题：必须有正确答案`);
            }
            
            if (question.difficulty_score < 1 || question.difficulty_score > 5) {
                errors.push(`第${index + 1}题：难度分数必须在1-5之间`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取题目统计信息
     * @param questions 题目数组
     */
    getQuestionStats(questions: Question[]): QuestionStats {
        const totalQuestions = questions.length;
        const avgDifficulty = questions.reduce((sum, q) => sum + q.difficulty_score, 0) / totalQuestions;
        const avgCorrectRate = questions.reduce((sum, q) => sum + (q.correct_rate || 0), 0) / totalQuestions;
        const categories = [...new Set(questions.map(q => q.category))];
        
        const difficultyDistribution: Record<DifficultyLevel, number> = {
            '简单': 0,
            '中等': 0,
            '较难': 0,
            '困难': 0
        };
        
        questions.forEach(q => {
            const level = this.getDifficultyLevel(q.difficulty_score);
            difficultyDistribution[level]++;
        });
        
        return {
            totalQuestions,
            avgDifficulty,
            avgCorrectRate,
            categories,
            difficultyDistribution
        };
    }
}

// 创建单例实例
export const questionApi = new QuestionApiService();

// 导出 ApiResponse 类型
export type { ApiResponse };

// 默认导出
export default questionApi; 