import { Question, UserConfig } from '@/types/towerDefenseScene';
import { questionApi } from '@/api/questionApi';
import { ObjectId } from 'bson';

export class QuestionManager {
    private userConfig: UserConfig;
    private questionPool: Question[] = [];
    private currentQuestion: Question | null = null;
    private answeredQuestionIds: string[] = []; // 记录已回答的问题ID
    private isAllQuestionsAnswered: boolean = false; // 标记是否所有问题都已回答
    private isInitialized: boolean = false; // 标记是否已初始化

    constructor(userConfig: UserConfig) {
        this.userConfig = userConfig;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            // 一次性加载所有问题
            await this.loadQuestionsFromAPI({
                subject: this.userConfig.subject,
                grade: this.userConfig.grade,
                category: this.userConfig.category,
                excludeIds: this.answeredQuestionIds
            });
            this.isInitialized = true;
            console.log('题目加载完成，共加载题目数量:', this.questionPool.length);
        } catch (error) {
            console.error('从API加载题目失败，使用本地生成:', error);
            this.generateLocalQuestions();
            this.isInitialized = true;
        }
    }

    private generateLocalQuestions(): void {
        // 根据年级和科目生成题目
        this.questionPool = [];
        
        if (this.userConfig.subject === '数学') {
            this.generateMathQuestions();
        } else if (this.userConfig.subject === '语文') {
            this.generateChineseQuestions();
        } else if (this.userConfig.subject === '英语') {
            this.generateEnglishQuestions();
        }
    }

    private generateMathQuestions(): void {
        // 根据年级生成不同难度的数学题
        const grade = this.userConfig.grade;
        
        for (let i = 0; i < 50; i++) {
            let question: Question;
            
            if (grade <= 2) {
                // 低年级：简单加减法
                question = this.generateSimpleAddition();
            } else if (grade <= 4) {
                // 中年级：加减乘法
                question = this.generateMediumMath();
            } else {
                // 高年级：复杂运算
                question = this.generateAdvancedMath();
            }
            
            this.questionPool.push(question);
        }
    }

    private generateSimpleAddition(): Question {
        const a = Phaser.Math.Between(1, 10);
        const b = Phaser.Math.Between(1, 10);
        const answer = a + b;
        
        const options = [answer];
        while (options.length < 4) {
            const wrong = Phaser.Math.Between(2, 20);
            if (!options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        // 打乱选项
        Phaser.Utils.Array.Shuffle(options);
        
        return {
            id: this.generateQuestionId(),
            question: `${a} + ${b} = ?`,
            options: options.map(o => o.toString()),
            correct: answer.toString()
        };
    }

    private generateMediumMath(): Question {
        const operations = ['+', '-', '×'];
        const op = Phaser.Utils.Array.GetRandom(operations);
        
        let a: number, b: number, answer: number;
        
        if (op === '+') {
            a = Phaser.Math.Between(10, 50);
            b = Phaser.Math.Between(10, 50);
            answer = a + b;
        } else if (op === '-') {
            a = Phaser.Math.Between(20, 100);
            b = Phaser.Math.Between(1, a);
            answer = a - b;
        } else { // ×
            a = Phaser.Math.Between(2, 12);
            b = Phaser.Math.Between(2, 12);
            answer = a * b;
        }
        
        const options = [answer];
        while (options.length < 4) {
            let wrong: number;
            if (op === '×') {
                wrong = Phaser.Math.Between(answer - 20, answer + 20);
            } else {
                wrong = Phaser.Math.Between(Math.max(1, answer - 10), answer + 10);
            }
            if (!options.includes(wrong) && wrong > 0) {
                options.push(wrong);
            }
        }
        
        Phaser.Utils.Array.Shuffle(options);
        
        return {
            id: this.generateQuestionId(),
            question: `${a} ${op} ${b} = ?`,
            options: options.map(o => o.toString()),
            correct: answer.toString()
        };
    }

    private generateAdvancedMath(): Question {
        // 高年级可以包含更复杂的运算
        const questionTypes = ['fraction', 'decimal', 'compound'];
        const type = Phaser.Utils.Array.GetRandom(questionTypes);
        
        if (type === 'fraction') {
            return this.generateFractionQuestion();
        } else if (type === 'decimal') {
            return this.generateDecimalQuestion();
        } else {
            return this.generateCompoundQuestion();
        }
    }

    private generateFractionQuestion(): Question {
        const a = Phaser.Math.Between(1, 5);
        const b = Phaser.Math.Between(2, 8);
        const c = Phaser.Math.Between(1, 5);
        const d = Phaser.Math.Between(2, 8);
        
        // 简化分数加法：a/b + c/d
        const numerator = a * d + c * b;
        const denominator = b * d;
        
        // 化简
        const gcd = this.getGCD(numerator, denominator);
        const simplifiedNum = numerator / gcd;
        const simplifiedDen = denominator / gcd;
        
        const answer = simplifiedDen === 1 ? simplifiedNum.toString() : `${simplifiedNum}/${simplifiedDen}`;
        
        const options = [answer];
        // 生成错误选项
        while (options.length < 4) {
            const wrongNum = Phaser.Math.Between(1, 10);
            const wrongDen = Phaser.Math.Between(2, 10);
            const wrong = wrongDen === 1 ? wrongNum.toString() : `${wrongNum}/${wrongDen}`;
            if (!options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        Phaser.Utils.Array.Shuffle(options);
        
        return {
            id: this.generateQuestionId(),
            question: `${a}/${b} + ${c}/${d} = ?`,
            options: options,
            correct: answer
        };
    }

    private generateDecimalQuestion(): Question {
        const a = parseFloat((Math.random() * 10).toFixed(1));
        const b = parseFloat((Math.random() * 10).toFixed(1));
        const answer = parseFloat((a + b).toFixed(1));
        
        const options = [answer.toString()];
        while (options.length < 4) {
            const wrong = parseFloat((Math.random() * 20).toFixed(1));
            if (!options.includes(wrong.toString())) {
                options.push(wrong.toString());
            }
        }
        
        Phaser.Utils.Array.Shuffle(options);
        
        return {
            id: this.generateQuestionId(),
            question: `${a} + ${b} = ?`,
            options: options,
            correct: answer.toString()
        };
    }

    private generateCompoundQuestion(): Question {
        const a = Phaser.Math.Between(5, 20);
        const b = Phaser.Math.Between(2, 10);
        const c = Phaser.Math.Between(1, 5);
        const answer = a + b * c;
        
        const options = [answer];
        while (options.length < 4) {
            const wrong = Phaser.Math.Between(answer - 10, answer + 10);
            if (!options.includes(wrong) && wrong > 0) {
                options.push(wrong);
            }
        }
        
        Phaser.Utils.Array.Shuffle(options);
        
        return {
            id: this.generateQuestionId(),
            question: `${a} + ${b} × ${c} = ?`,
            options: options.map(o => o.toString()),
            correct: answer.toString()
        };
    }

    private generateChineseQuestions(): void {
        // TODO: 实现语文题目生成
        // 可以包含：字词拼音、成语理解、古诗填空等
        console.log('语文题目生成功能待实现');
    }

    private generateEnglishQuestions(): void {
        // TODO: 实现英语题目生成
        // 可以包含：单词选择、语法填空、阅读理解等
        console.log('英语题目生成功能待实现');
    }

    private getGCD(a: number, b: number): number {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    private generateQuestionId(): string {
        return new ObjectId().toString();
    }

    public getNextQuestion(): Question | null {
        // 如果还没有初始化，返回null
        if (!this.isInitialized) {
            console.warn('QuestionManager尚未初始化');
            return null;
        }

        // 如果所有问题都已回答完成，返回null
        if (this.isAllQuestionsAnswered) {
            return null;
        }
        
        if (this.questionPool.length === 0) {
            this.isAllQuestionsAnswered = true;
            return null;
        }
        
        // 随机选择一个问题
        const questionIndex = Phaser.Math.Between(0, this.questionPool.length - 1);
        this.currentQuestion = this.questionPool[questionIndex];
        this.questionPool.splice(questionIndex, 1);
        
        // 记录已回答的问题ID
        if (this.currentQuestion._id) {
            this.answeredQuestionIds.push(this.currentQuestion._id);
        }
        
        return this.currentQuestion;
    }

    public checkAnswer(answer: string, question: Question): boolean {
        return answer === question.correct;
    }

    public getCurrentQuestion(): Question | null {
        return this.currentQuestion;
    }

    // API调用方法
    public async loadQuestionsFromAPI(params: {
        subject: string;
        grade: number;
        category: string;
        excludeIds?: string[];
    }): Promise<Question[]> {
        try {
            const response = await questionApi.getQuestions(
                params.subject as any, 
                params.grade, 
                params.category,
                params.excludeIds
            );
            
            if (response.success && response.data && response.data.questions) {
                // 转换API数据格式到本地Question类型
                const convertedQuestions: Question[] = response.data.questions.map(apiQuestion => ({
                    _id: apiQuestion._id,
                    question: apiQuestion.question,
                    options: apiQuestion.options,
                    explanation: apiQuestion.explanation,
                    correct: apiQuestion.right_answer,
                    difficulty: apiQuestion.difficulty_score ? 
                        (apiQuestion.difficulty_score <= 1.5 ? '简单' : 
                         apiQuestion.difficulty_score <= 2.5 ? '中等' : 
                         apiQuestion.difficulty_score <= 3.5 ? '较难' : '困难') : '中等'
                }));
                
                this.questionPool = convertedQuestions;
                console.log(`成功从API加载了 ${this.questionPool.length} 道题目`);
                
                // 如果没有加载到任何题目，抛出错误
                if (this.questionPool.length === 0) {
                    throw new Error('服务异常：未获取到任何题目');
                }
                
                return convertedQuestions;
            } else {
                throw new Error('服务异常：API返回数据格式错误');
            }
        } catch (error) {
            console.error('加载题目失败:', error);
            throw error;
        }
    }

    public getQuestionPoolSize(): number {
        return this.questionPool.length;
    }

    public isQuestionsExhausted(): boolean {
        return this.isAllQuestionsAnswered;
    }

    public getAnsweredQuestionIds(): string[] {
        return this.answeredQuestionIds;
    }

    public refillQuestionPool(): void {
        if (this.questionPool.length < 5 && !this.isAllQuestionsAnswered) {
            this.initialize();
        }
    }
} 