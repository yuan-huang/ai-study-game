import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export class TowerDefenseController {
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

  protected internalServerError(res: Response, message: string) {
    res.status(500).json({
      success: false,
      message
    });
  }

  /**
   * 获取塔防游戏所需的数据
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

      logger.info(`获取塔防数据: subject=${subject}, grade=${gradeNum}, category=${category}`);

      // 生成题目数据
      const questions = this.generateQuestions(subject, gradeNum, questionCountNum, difficultyNum);
      
      // 生成怪物配置数据
      const monsterData = this.generateMonsterData(waveCountNum, difficultyNum);

      // 生成塔类型配置
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

      logger.info(`成功获取塔防数据: ${questions.length} 道题目, ${monsterData.waves.length} 个波次`);
      this.success(res, response, '获取塔防数据成功');

    } catch (error) {
      logger.error('获取塔防数据失败:', error);
      this.internalServerError(res, '获取塔防数据失败');
    }
  }

  /**
   * 生成题目
   */
  private generateQuestions(subject: string, grade: number, count: number, difficulty: number): any[] {


    if (subject === 'math' || subject === '数学') {
      return this.generateMathQuestions(grade, count, difficulty);
    } else if (subject === 'chinese' || subject === '语文') {
      return this.generateChineseQuestions(count, difficulty);
    } else if (subject === 'english' || subject === '英语') {
      return this.generateEnglishQuestions(count, difficulty);
    } else {
      return this.generateGeneralQuestions(count, difficulty);
    }
  }

  /**
   * 生成数学题目
   */
  private generateMathQuestions(grade: number, count: number, difficulty: number): any[] {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      let question;
      
      if (grade <= 2) {
        question = this.generateSimpleMathQuestion();
      } else if (grade <= 4) {
        question = this.generateMediumMathQuestion();
      } else {
        question = this.generateAdvancedMathQuestion();
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
  private generateSimpleMathQuestion(): any {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = a + b;
    
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
      question: `${a} + ${b} = ?`,
      options: options.map(o => o.toString()),
      correct: answer.toString()
    };
  }

  /**
   * 生成中等数学题目
   */
  private generateMediumMathQuestion(): any {
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
  private generateAdvancedMathQuestion(): any {
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
  private generateChineseQuestions(count: number, difficulty: number): any[] {
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
  private generateEnglishQuestions(count: number, difficulty: number): any[] {
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
  private generateGeneralQuestions(count: number, difficulty: number): any[] {
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
        // 根据波次选择怪物类型
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
   * 根据数值获取难度等级
   */
  private getDifficultyLevel(score: number): string {
    if (score <= 1.5) return '简单';
    if (score <= 2.5) return '中等';
    if (score <= 3.5) return '较难';
    return '困难';
  }
} 