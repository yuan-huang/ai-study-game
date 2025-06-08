import { Request, Response } from 'express';
import { createQuestionModel } from '../models/Question';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class QuestionController {
  /**
   * 统一响应格式的辅助方法
   */
  protected success(res: Response, data: any, message: string = '操作成功') {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }

  protected badRequest(res: Response, message: string) {
    res.status(400).json({
      success: false,
      message
    });
  }

  protected notFound(res: Response, message: string) {
    res.status(404).json({
      success: false,
      message
    });
  }

  protected internalServerError(res: Response, message: string) {
    res.status(500).json({
      success: false,
      message
    });
  }

  /**
   * 获取指定数量的题目
   * @param req 请求对象
   * @param res 响应对象
   */
  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { subject, grade, category, count = 10 } = req.query;

      // 参数验证
      if (!subject || !grade || !category) {
        this.badRequest(res, '缺少必需参数: subject, grade, category');
        return;
      }

      const gradeNum = parseInt(grade as string);
      const countNum = parseInt(count as string);

      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        this.badRequest(res, '年级参数无效');
        return;
      }

      if (isNaN(countNum) || countNum < 1 || countNum > 50) {
        this.badRequest(res, '题目数量无效，应为1-50之间');
        return;
      }

      logger.info(`获取题目: subject=${subject}, grade=${gradeNum}, category=${category}, count=${countNum}`);

      // 获取对应的题目模型
      const QuestionModel = createQuestionModel(subject as string, gradeNum);

      // 随机获取指定数量的题目
      const questions = await QuestionModel.aggregate([
        { $match: { category: category as string } },
        { $sample: { size: countNum } },
        {
          $project: {
            _id: 1,
            id: 1,
            question: 1,
            options: 1,
            right_answer: 1,
            category: 1,
            explanation: 1,
            difficulty_score: 1
          }
        }
      ]);

      if (questions.length === 0) {
        this.notFound(res, '该类别下没有找到题目');
        return;
      }

      // 如果题目数量不足，返回现有题目并提示
      const response = {
        questions,
        requestedCount: countNum,
        actualCount: questions.length,
        needMoreQuestions: questions.length < countNum
      };

      logger.info(`成功获取 ${questions.length} 道题目`);
      this.success(res, response, '获取题目成功');

    } catch (error) {
      logger.error('获取题目失败:', error);
      this.internalServerError(res, '获取题目失败');
    }
  }

  /**
   * 通过AI生成新题目
   * @param req 请求对象
   * @param res 响应对象
   */
  async generateQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { subject, grade, category, count = 5, difficulty = 2.5 } = req.body;

      // 参数验证
      if (!subject || !grade || !category) {
        this.badRequest(res, '缺少必需参数: subject, grade, category');
        return;
      }

      const gradeNum = parseInt(grade);
      const countNum = parseInt(count);
      const difficultyNum = parseFloat(difficulty);

      if (isNaN(gradeNum) || isNaN(countNum) || isNaN(difficultyNum)) {
        this.badRequest(res, '参数格式错误');
        return;
      }

      logger.info(`AI生成题目: subject=${subject}, grade=${gradeNum}, category=${category}, count=${countNum}`);

      // 构建AI提示词
      const prompt = this.buildPrompt(subject, gradeNum, category, countNum, difficultyNum);
      
      // 调用AI生成题目
      const generatedQuestions = await this.callAIService(prompt);
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        this.internalServerError(res, 'AI生成题目失败');
        return;
      }

      // 可选：将生成的题目保存到数据库
      if (req.body.saveToDatabase) {
        await this.saveGeneratedQuestions(generatedQuestions, subject, gradeNum);
      }

      const response = {
        questions: generatedQuestions,
        generatedCount: generatedQuestions.length,
        savedToDatabase: !!req.body.saveToDatabase
      };

      logger.info(`AI成功生成 ${generatedQuestions.length} 道题目`);
      this.success(res, response, 'AI生成题目成功');

    } catch (error) {
      logger.error('AI生成题目失败:', error);
      this.internalServerError(res, 'AI生成题目失败');
    }
  }

  /**
   * 构建AI提示词
   */
  private buildPrompt(subject: string, grade: number, category: string, count: number, difficulty: number): string {
    const subjectMap: { [key: string]: string } = {
      'chinese': '语文',
      'math': '数学',
      'english': '英语',
      'curious': '科学常识',
      'knowledge': '综合知识'
    };

    const subjectName = subjectMap[subject] || subject;
    const difficultyLevel = difficulty <= 1.5 ? '简单' : difficulty <= 2.5 ? '中等' : difficulty <= 3.5 ? '较难' : '困难';

    return `请为${grade}年级学生生成${count}道${subjectName}学科的${category}类型题目，难度为${difficultyLevel}。

要求：
1. 每道题目包含题干、4个选项（A、B、C、D）、正确答案和详细解释
2. 题目适合${grade}年级学生的认知水平
3. 选项设置要有迷惑性，但正确答案要明确
4. 解释要清晰易懂，帮助学生理解知识点

请按照以下JSON格式返回，确保返回的是有效的JSON数组：
[
  {
    "question": "题目内容",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "right_answer": "A",
    "explanation": "详细解释",
    "difficulty_score": ${difficulty}
  }
]

直接返回JSON数组，不要包含任何其他文字。`;
  }

  /**
   * 调用AI服务生成题目
   */
  private async callAIService(prompt: string): Promise<any[]> {
    try {
      // 这里应该调用真实的AI服务（如Google Gemini、OpenAI等）
      // 当前返回模拟数据，实际部署时需要替换为真实的AI调用
      
      logger.info('调用AI服务生成题目...');
      
      // 模拟AI服务调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模拟生成的题目
      return this.getMockGeneratedQuestions();
      
      // 真实的AI调用代码示例（需要配置相应的API密钥）:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // 解析AI返回的JSON
      return JSON.parse(aiResponse);
      */
      
    } catch (error) {
      logger.error('AI服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 获取模拟生成的题目（用于开发测试）
   */
  private getMockGeneratedQuestions(): any[] {
    return [
      {
        question: "下列哪个字的读音是正确的？",
        options: ["A. 载(zǎi)重", "B. 载(zài)重", "C. 载(zāi)重", "D. 载(zé)重"],
        right_answer: "B",
        explanation: "载重的'载'应该读作zài，表示装载、承载的意思。",
        difficulty_score: 2.5
      },
      {
        question: "古诗'春眠不觉晓'的下一句是什么？",
        options: ["A. 处处闻啼鸟", "B. 夜来风雨声", "C. 花落知多少", "D. 草色遥看近却无"],
        right_answer: "A",
        explanation: "这是孟浩然的《春晓》，全诗为：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
        difficulty_score: 2.0
      },
      {
        question: "下列词语中，哪个是描写心情的？",
        options: ["A. 春暖花开", "B. 心花怒放", "C. 鸟语花香", "D. 绿树成荫"],
        right_answer: "B",
        explanation: "心花怒放是描写心情愉悦、高兴的词语，其他选项都是描写景色的。",
        difficulty_score: 1.8
      }
    ];
  }

  /**
   * 将生成的题目保存到数据库
   */
  private async saveGeneratedQuestions(questions: any[], subject: string, grade: number): Promise<void> {
    try {
      const QuestionModel = createQuestionModel(subject, grade);
      
      // 使用时间戳作为起始ID，避免类型问题
      let nextId = Date.now();
      
      // 为每个题目分配ID并保存
      const questionsToSave = questions.map(q => ({
        ...q,
        id: nextId++,
        subject,
        grade,
        category: q.category || '通用',
        level: q.level || '中等',
        source: 'AI生成',
        tags: ['AI生成'],
        usage_count: 0,
        correct_rate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await QuestionModel.insertMany(questionsToSave);
      logger.info(`成功保存 ${questionsToSave.length} 道AI生成的题目到数据库`);
      
    } catch (error) {
      logger.error('保存AI生成题目到数据库失败:', error);
      // 不抛出错误，因为生成成功比保存更重要
    }
  }

  /**
   * 获取塔防游戏所需的数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getTowerDefenseData(req: Request, res: Response): Promise<void> {
    try {
      const { 
        subject, 
        grade, 
        category, 
        questionCount = 20, 
        waveCount = 5, 
        difficulty = 2 
      } = req.body;

      // 参数验证
      if (!subject || !grade || !category) {
        this.badRequest(res, '缺少必需参数: subject, grade, category');
        return;
      }

      const gradeNum = parseInt(grade);
      const questionCountNum = parseInt(questionCount);
      const waveCountNum = parseInt(waveCount);
      const difficultyNum = parseInt(difficulty);

      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        this.badRequest(res, '年级参数无效');
        return;
      }

      if (isNaN(questionCountNum) || questionCountNum < 5 || questionCountNum > 100) {
        this.badRequest(res, '题目数量无效，应为5-100之间');
        return;
      }

      if (isNaN(waveCountNum) || waveCountNum < 1 || waveCountNum > 20) {
        this.badRequest(res, '波次数量无效，应为1-20之间');
        return;
      }

      if (isNaN(difficultyNum) || difficultyNum < 1 || difficultyNum > 5) {
        this.badRequest(res, '难度等级无效，应为1-5之间');
        return;
      }

      logger.info(`获取塔防数据: subject=${subject}, grade=${gradeNum}, category=${category}, questionCount=${questionCountNum}, waveCount=${waveCountNum}, difficulty=${difficultyNum}`);

      try {
        // 尝试从数据库获取题目
        const QuestionModel = createQuestionModel(subject, gradeNum);
        let questions = await QuestionModel.aggregate([
          { $match: { category: category } },
          { $sample: { size: questionCountNum } },
          {
            $project: {
              _id: 0,
              id: 1,
              question: 1,
              options: 1,
              right_answer: 1,
              category: 1,
              explanation: 1,
              difficulty_score: 1
            }
          }
        ]);

        // 如果数据库中题目不足，使用生成的题目补充
        if (questions.length < questionCountNum) {
          logger.info(`数据库题目不足，使用生成题目补充。需要: ${questionCountNum}, 现有: ${questions.length}`);
          const additionalQuestions = this.generateTowerDefenseQuestions(subject, gradeNum, category, questionCountNum - questions.length, difficultyNum);
          questions = questions.concat(additionalQuestions);
        }

        // 格式化题目数据以匹配前端接口
        const formattedQuestions = questions.map((q, index) => ({
          id: q.id || index + 1,
          question: q.question,
          options: q.options,
          correct: q.right_answer,
          difficulty: this.getDifficultyLevel(q.difficulty_score || difficultyNum)
        }));

        // 生成怪物配置数据
        const monsterData = this.generateMonsterData(waveCountNum, difficultyNum);

        // 生成塔类型配置
        const towerTypes = this.getTowerTypes();

        const response = {
          questions: formattedQuestions,
          monsters: monsterData,
          towers: towerTypes,
          gameConfig: {
            subject,
            grade: gradeNum,
            category,
            questionCount: formattedQuestions.length,
            waveCount: waveCountNum,
            difficulty: difficultyNum,
            initialHealth: Math.max(5, 15 - difficultyNum * 2),
            initialScore: Math.max(50, 200 - difficultyNum * 30),
            scorePerCorrectAnswer: 20 + difficultyNum * 10,
            comboBonus: 5 + difficultyNum * 2
          }
        };

        logger.info(`成功获取塔防数据: ${formattedQuestions.length} 道题目, ${monsterData.waves.length} 个波次`);
        this.success(res, response, '获取塔防数据成功');

      } catch (dbError) {
        logger.warn('数据库查询失败，使用生成数据:', dbError);
        
        // 数据库查询失败时，完全使用生成的数据
        const questions = this.generateTowerDefenseQuestions(subject, gradeNum, category, questionCountNum, difficultyNum);
        const monsterData = this.generateMonsterData(waveCountNum, difficultyNum);
        const towerTypes = this.getTowerTypes();

        const response = {
          questions,
          monsters: monsterData,
          towers: towerTypes,
          gameConfig: {
            subject,
            grade: gradeNum,
            category,
            questionCount: questions.length,
            waveCount: waveCountNum,
            difficulty: difficultyNum,
            initialHealth: Math.max(5, 15 - difficultyNum * 2),
            initialScore: Math.max(50, 200 - difficultyNum * 30),
            scorePerCorrectAnswer: 20 + difficultyNum * 10,
            comboBonus: 5 + difficultyNum * 2
          }
        };

        this.success(res, response, '获取塔防数据成功（使用生成数据）');
      }

    } catch (error) {
      logger.error('获取塔防数据失败:', error);
      this.internalServerError(res, '获取塔防数据失败');
    }
  }

  /**
   * 生成塔防游戏题目
   */
  private generateTowerDefenseQuestions(subject: string, grade: number, category: string, count: number, difficulty: number): any[] {
    const questions = [];
    
    if (subject === 'math' || subject === '数学') {
      questions.push(...this.generateMathQuestions(grade, count, difficulty));
    } else if (subject === 'chinese' || subject === '语文') {
      questions.push(...this.generateChineseQuestions(grade, count, difficulty));
    } else if (subject === 'english' || subject === '英语') {
      questions.push(...this.generateEnglishQuestions(grade, count, difficulty));
    } else {
      questions.push(...this.generateGeneralQuestions(grade, count, difficulty));
    }

    return questions.slice(0, count);
  }

  /**
   * 生成数学题目
   */
  private generateMathQuestions(grade: number, count: number, difficulty: number): any[] {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      let question;
      
      if (grade <= 2) {
        question = this.generateSimpleMathQuestion(difficulty);
      } else if (grade <= 4) {
        question = this.generateMediumMathQuestion(difficulty);
      } else {
        question = this.generateAdvancedMathQuestion(difficulty);
      }
      
      questions.push({
        id: i + 1,
        ...question,
        difficulty: this.getDifficultyLevel(difficulty)
      });
    }
    
    return questions;
  }

  /**
   * 生成简单数学题目
   */
  private generateSimpleMathQuestion(difficulty: number): any {
    const operations = difficulty <= 2 ? ['+'] : ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b, answer;
    
    if (operation === '+') {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 20) + 5;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    }
    
    const options = [answer];
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 6) - 3;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // 打乱选项
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      question: `${a} ${operation} ${b} = ?`,
      options: options.map(o => o.toString()),
      correct: answer.toString()
    };
  }

  /**
   * 生成中等数学题目
   */
  private generateMediumMathQuestion(difficulty: number): any {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b, answer;
    
    if (operation === '+') {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      answer = a + b;
    } else if (operation === '-') {
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    } else { // ×
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
    }
    
    const options = [answer];
    while (options.length < 4) {
      let wrong;
      if (operation === '×') {
        wrong = answer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrong = answer + Math.floor(Math.random() * 10) - 5;
      }
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // 打乱选项
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      question: `${a} ${operation} ${b} = ?`,
      options: options.map(o => o.toString()),
      correct: answer.toString()
    };
  }

  /**
   * 生成高级数学题目
   */
  private generateAdvancedMathQuestion(difficulty: number): any {
    const questionTypes = ['fraction', 'decimal', 'compound'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    if (type === 'fraction') {
      return this.generateFractionQuestion();
    } else if (type === 'decimal') {
      return this.generateDecimalQuestion();
    } else {
      return this.generateCompoundMathQuestion();
    }
  }

  /**
   * 生成分数题目
   */
  private generateFractionQuestion(): any {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 8) + 2;
    const c = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 8) + 2;
    
    const numerator = a * d + c * b;
    const denominator = b * d;
    
    // 化简分数
    const gcd = this.getGCD(numerator, denominator);
    const simplifiedNum = numerator / gcd;
    const simplifiedDen = denominator / gcd;
    
    const answer = simplifiedDen === 1 ? simplifiedNum.toString() : `${simplifiedNum}/${simplifiedDen}`;
    
    const options = [answer];
    while (options.length < 4) {
      const wrongNum = Math.floor(Math.random() * 10) + 1;
      const wrongDen = Math.floor(Math.random() * 10) + 2;
      const wrong = wrongDen === 1 ? wrongNum.toString() : `${wrongNum}/${wrongDen}`;
      if (!options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // 打乱选项
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      question: `${a}/${b} + ${c}/${d} = ?`,
      options,
      correct: answer
    };
  }

  /**
   * 生成小数题目
   */
  private generateDecimalQuestion(): any {
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
    
    // 打乱选项
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      question: `${a} + ${b} = ?`,
      options,
      correct: answer.toString()
    };
  }

  /**
   * 生成复合运算题目
   */
  private generateCompoundMathQuestion(): any {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 10) + 2;
    const c = Math.floor(Math.random() * 5) + 1;
    const answer = a + b * c;
    
    const options = [answer];
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 20) - 10;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // 打乱选项
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      question: `${a} + ${b} × ${c} = ?`,
      options: options.map(o => o.toString()),
      correct: answer.toString()
    };
  }

  /**
   * 生成语文题目
   */
  private generateChineseQuestions(grade: number, count: number, difficulty: number): any[] {
    const questions = [];
    const chineseQuestions = [
      {
        question: "下列哪个字的读音是正确的？",
        options: ["载(zǎi)重", "载(zài)重", "载(zāi)重", "载(zé)重"],
        correct: "载(zài)重"
      },
      {
        question: "古诗'春眠不觉晓'的下一句是什么？",
        options: ["处处闻啼鸟", "夜来风雨声", "花落知多少", "草色遥看近却无"],
        correct: "处处闻啼鸟"
      },
      {
        question: "下列词语中，哪个是描写心情的？",
        options: ["春暖花开", "心花怒放", "鸟语花香", "绿树成荫"],
        correct: "心花怒放"
      },
      {
        question: "'红豆生南国'是谁的诗句？",
        options: ["王维", "李白", "杜甫", "白居易"],
        correct: "王维"
      },
      {
        question: "下列哪个成语的意思是'非常高兴'？",
        options: ["愁眉苦脸", "兴高采烈", "垂头丧气", "心事重重"],
        correct: "兴高采烈"
      }
    ];
    
    for (let i = 0; i < count; i++) {
      const baseQuestion = chineseQuestions[i % chineseQuestions.length];
      questions.push({
        id: i + 1,
        question: baseQuestion.question,
        options: baseQuestion.options,
        correct: baseQuestion.correct,
        difficulty: this.getDifficultyLevel(difficulty)
      });
    }
    
    return questions;
  }

  /**
   * 生成英语题目
   */
  private generateEnglishQuestions(grade: number, count: number, difficulty: number): any[] {
    const questions = [];
    const englishQuestions = [
      {
        question: "What is the English word for '苹果'?",
        options: ["Apple", "Orange", "Banana", "Grape"],
        correct: "Apple"
      },
      {
        question: "Choose the correct sentence:",
        options: ["I am a student.", "I is a student.", "I are a student.", "I be a student."],
        correct: "I am a student."
      },
      {
        question: "What color is the sky?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct: "Blue"
      },
      {
        question: "How do you say 'hello' in Chinese?",
        options: ["你好", "再见", "谢谢", "对不起"],
        correct: "你好"
      },
      {
        question: "Which is a pet animal?",
        options: ["Tiger", "Lion", "Dog", "Elephant"],
        correct: "Dog"
      }
    ];
    
    for (let i = 0; i < count; i++) {
      const baseQuestion = englishQuestions[i % englishQuestions.length];
      questions.push({
        id: i + 1,
        question: baseQuestion.question,
        options: baseQuestion.options,
        correct: baseQuestion.correct,
        difficulty: this.getDifficultyLevel(difficulty)
      });
    }
    
    return questions;
  }

  /**
   * 生成通用题目
   */
  private generateGeneralQuestions(grade: number, count: number, difficulty: number): any[] {
    const questions = [];
    const generalQuestions = [
      {
        question: "地球上最大的海洋是？",
        options: ["太平洋", "大西洋", "印度洋", "北冰洋"],
        correct: "太平洋"
      },
      {
        question: "一年有多少个季节？",
        options: ["2个", "3个", "4个", "5个"],
        correct: "4个"
      },
      {
        question: "中国的首都是？",
        options: ["上海", "北京", "广州", "深圳"],
        correct: "北京"
      },
      {
        question: "彩虹有几种颜色？",
        options: ["5种", "6种", "7种", "8种"],
        correct: "7种"
      },
      {
        question: "人体有多少颗牙齿？（成人）",
        options: ["28颗", "30颗", "32颗", "34颗"],
        correct: "32颗"
      }
    ];
    
    for (let i = 0; i < count; i++) {
      const baseQuestion = generalQuestions[i % generalQuestions.length];
      questions.push({
        id: i + 1,
        question: baseQuestion.question,
        options: baseQuestion.options,
        correct: baseQuestion.correct,
        difficulty: this.getDifficultyLevel(difficulty)
      });
    }
    
    return questions;
  }

  /**
   * 生成怪物数据
   */
  private generateMonsterData(waveCount: number, difficulty: number): any {
    const monsterTypes = [
      {
        type: 'monster-normal',
        name: '普通怪物',
        health: 30 + difficulty * 10,
        speed: 80 + difficulty * 10,
        reward: 5 + difficulty,
        image: 'monster-normal'
      },
      {
        type: 'monster-gluttonous',
        name: '贪吃怪物',
        health: 50 + difficulty * 15,
        speed: 60 + difficulty * 8,
        reward: 8 + difficulty * 2,
        image: 'monster-gluttonous'
      },
      {
        type: 'monster-grumpy',
        name: '暴躁怪物',
        health: 80 + difficulty * 20,
        speed: 50 + difficulty * 5,
        reward: 12 + difficulty * 3,
        image: 'monster-grumpy'
      },
      {
        type: 'monster-lazy',
        name: '懒惰怪物',
        health: 70 + difficulty * 18,
        speed: 40 + difficulty * 3,
        reward: 10 + difficulty * 2,
        image: 'monster-lazy'
      },
      {
        type: 'monster-messy',
        name: '混乱怪物',
        health: 40 + difficulty * 12,
        speed: 100 + difficulty * 15,
        reward: 6 + difficulty,
        image: 'monster-messy'
      }
    ];

    const waves = [];
    for (let i = 1; i <= waveCount; i++) {
      const enemyCount = Math.min(3 + i, 8 + difficulty);
      const enemies = [];
      
      for (let j = 0; j < enemyCount; j++) {
        // 根据波次选择怪物类型，后面的波次有更强的怪物
        let availableTypes = monsterTypes.slice(0, Math.min(1 + Math.floor(i / 2), monsterTypes.length));
        const monsterType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        enemies.push(monsterType.type);
      }
      
      waves.push({
        waveNumber: i,
        enemies,
        delay: Math.max(1000, 2000 - difficulty * 200),
        spawnInterval: Math.max(800, 1500 - difficulty * 100)
      });
    }

    return {
      types: monsterTypes,
      waves
    };
  }

  /**
   * 获取塔类型配置
   */
  private getTowerTypes(): any {
    return {
      'tower-arrow': {
        type: 'tower-arrow',
        name: '箭塔',
        cost: 50,
        damage: 20,
        range: 150,
        fireRate: 1000,
        level: 1,
        maxLevel: 10,
        icon: '🏹',
        description: '基础防御塔，攻击单个敌人'
      },
      'tower-freeze': {
        type: 'tower-freeze',
        name: '冰冻塔',
        cost: 70,
        damage: 15,
        range: 150,
        fireRate: 1500,
        level: 1,
        maxLevel: 10,
        icon: '❄️',
        description: '减慢敌人移动速度'
      },
      'tower-laser': {
        type: 'tower-laser',
        name: '激光塔',
        cost: 100,
        damage: 30,
        range: 180,
        fireRate: 800,
        level: 1,
        maxLevel: 10,
        icon: '⚡',
        description: '高伤害远程攻击'
      },
      'tower-poison': {
        type: 'tower-poison',
        name: '毒塔',
        cost: 70,
        damage: 10,
        range: 140,
        fireRate: 500,
        level: 1,
        maxLevel: 10,
        icon: '☠️',
        description: '持续伤害和范围攻击'
      }
    };
  }

  /**
   * 计算最大公约数
   */
  private getGCD(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * 根据数值获取难度等级
   */
  private getDifficultyLevel(score: number): string {
    if (score <= 1.5) return '简单';
    if (score <= 2.5) return '中等';
    if (score <= 3.5) return '较难';
    return '困难';
  }
} 