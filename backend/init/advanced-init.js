const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-garden';

// 动态创建题目模型的函数
function createQuestionModel(subject, grade) {
  const collectionName = `questions_${subject}_grade${grade}`;
  
  // 如果模型已存在，直接返回
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  const QuestionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    question: { type: String, required: true, unique: true }, // 题目内容唯一
    options: { type: [String], required: true },
    right_answer: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    explanation: { type: String, required: true },
    subject: { type: String, required: true, default: subject }, // 学科
    grade: { type: Number, required: true, default: grade }, // 年级
    source: { type: String, default: '' },
    tags: { type: [String], default: [] },
    difficulty_score: { type: Number, default: 0 },
    usage_count: { type: Number, default: 0 },
    correct_rate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // 创建索引
  QuestionSchema.index({ question: 1 }, { unique: true }); // 题目内容唯一索引
  QuestionSchema.index({ question: 'text' }); // 题目内容文本搜索索引
  QuestionSchema.index({ category: 1 });
  QuestionSchema.index({ level: 1 });
  QuestionSchema.index({ tags: 1 });
  QuestionSchema.index({ difficulty_score: 1 });
  QuestionSchema.index({ subject: 1 });
  QuestionSchema.index({ grade: 1 });
  QuestionSchema.index({ subject: 1, grade: 1 });
  QuestionSchema.index({ category: 1, level: 1 });

  return mongoose.model(collectionName, QuestionSchema, collectionName);
}

// 解析文件路径获取学科和年级信息
function parseFileInfo(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..', 'docs', 'data'), filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts.length < 2) {
    return null;
  }
  
  const subject = parts[0]; // 学科目录名
  const fileName = parts[parts.length - 1]; // 文件名
  
  // 从文件名提取年级信息
  const gradeMatch = fileName.match(/grade(\d+)/i) || fileName.match(/(\d+)年级/);
  const grade = gradeMatch ? parseInt(gradeMatch[1]) : null;
  
  if (!grade) {
    console.warn(`⚠️  无法从文件名 ${fileName} 中提取年级信息`);
    return null;
  }
  
  return {
    subject: subject.toLowerCase(),
    grade: grade,
    fileName: fileName,
    collectionName: `questions_${subject.toLowerCase()}_grade${grade}`
  };
}

// 命令行参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    clearData: false,
    createIndexes: true,
    dryRun: false,
    verbose: false,
    dataPath: null,
    subject: null, // 指定特定学科
    grade: null    // 指定特定年级
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--clear':
      case '-c':
        options.clearData = true;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--no-indexes':
        options.createIndexes = false;
        break;
      case '--data-path':
        options.dataPath = args[++i];
        break;
      case '--subject':
        options.subject = args[++i];
        break;
      case '--grade':
        options.grade = parseInt(args[++i]);
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
MongoDB数据初始化脚本 - 多学科版本

用法: node advanced-init.js [选项]

选项:
  -c, --clear         清除现有数据后重新导入
  -d, --dry-run       预览模式，不实际执行数据库操作
  -v, --verbose       显示详细日志
  --no-indexes        不创建数据库索引
  --data-path PATH    指定数据目录路径（默认: docs/data）
  --subject SUBJECT   只处理指定学科（如: chinese, math, english）
  --grade GRADE       只处理指定年级（如: 4, 5, 6）
  -h, --help          显示此帮助信息

文件结构:
  docs/data/chinese/grade4.json  -> questions_chinese_grade4 集合
  docs/data/math/grade5.json     -> questions_math_grade5 集合
  docs/data/english/grade6.json  -> questions_english_grade6 集合

示例:
  node advanced-init.js --clear --verbose           # 清除所有数据并详细记录
  node advanced-init.js --subject chinese          # 只处理语文学科
  node advanced-init.js --grade 4                   # 只处理4年级
  node advanced-init.js --subject math --grade 5    # 只处理5年级数学
  node advanced-init.js --dry-run                   # 预览模式
  `);
}

// 读取JSON文件的函数
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filePath} 失败:`, error.message);
    return null;
  }
}

// 获取data目录下所有JSON文件
function getAllJsonFiles(dataPath, options = {}) {
  const files = [];
  try {
    const items = fs.readdirSync(dataPath);
    for (const item of items) {
      const fullPath = path.join(dataPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 如果指定了学科，只处理对应学科目录
        if (options.subject && item.toLowerCase() !== options.subject.toLowerCase()) {
          continue;
        }
        files.push(...getAllJsonFiles(fullPath, options));
      } else if (stat.isFile() && item.toLowerCase().endsWith('.json')) {
        // 如果指定了年级，检查文件名是否包含该年级
        if (options.grade) {
          const gradeMatch = item.match(/grade(\d+)/i) || item.match(/(\d+)年级/);
          const fileGrade = gradeMatch ? parseInt(gradeMatch[1]) : null;
          if (fileGrade !== options.grade) {
            continue;
          }
        }
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`读取目录 ${dataPath} 失败:`, error.message);
  }
  return files;
}

// 增强的数据处理函数
function enhanceQuestion(question, sourceName, subject, grade) {
  // 计算难度分数（基于题目长度、选项复杂度等）
  let difficultyScore = 1;
  
  // 根据级别调整难度分数
  const levelScores = {
    '初级': 1,
    '中级': 2,
    '高级': 3,
    '专家': 4
  };
  difficultyScore = levelScores[question.level] || 1;
  
  // 根据年级调整基础难度
  difficultyScore += (grade - 1) * 0.5;
  
  // 根据题目长度调整
  if (question.question.length > 50) difficultyScore += 0.5;
  if (question.question.length > 100) difficultyScore += 0.5;
  
  // 根据选项长度调整
  const avgOptionLength = question.options.reduce((sum, opt) => sum + opt.length, 0) / question.options.length;
  if (avgOptionLength > 20) difficultyScore += 0.3;
  
  // 生成标签
  const tags = [];
  if (question.category) tags.push(question.category);
  if (question.level) tags.push(question.level);
  tags.push(subject); // 添加学科标签
  tags.push(`${grade}年级`); // 添加年级标签
  
  // 根据学科和内容生成额外标签
  if (subject === 'chinese') {
    if (question.question.includes('诗') || question.question.includes('古诗')) tags.push('古诗词');
    if (question.question.includes('作者') || question.question.includes('作家')) tags.push('文学常识');
    if (question.question.includes('修辞') || question.question.includes('比喻')) tags.push('修辞手法');
  } else if (subject === 'math') {
    if (question.question.includes('计算') || question.question.includes('算')) tags.push('计算题');
    if (question.question.includes('应用') || question.question.includes('解决')) tags.push('应用题');
    if (question.question.includes('几何') || question.question.includes('图形')) tags.push('几何题');
  } else if (subject === 'english') {
    if (question.question.includes('语法') || question.question.includes('grammar')) tags.push('语法');
    if (question.question.includes('词汇') || question.question.includes('vocabulary')) tags.push('词汇');
    if (question.question.includes('阅读') || question.question.includes('reading')) tags.push('阅读理解');
  }
  
  return {
    ...question,
    subject: subject,
    grade: grade,
    source: sourceName,
    difficulty_score: Math.round(difficultyScore * 10) / 10,
    tags: [...new Set(tags)], // 去重
    updatedAt: new Date()
  };
}

// 批量处理数据的函数
async function processQuestions(questions, sourceName, fileInfo, options) {
  if (options.dryRun) {
    console.log(`🔍 [预览模式] 将要处理 ${questions.length} 条题目到集合 ${fileInfo.collectionName}`);
    questions.slice(0, 3).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.question.substring(0, 50)}...`);
    });
    return { upsertedCount: 0, modifiedCount: questions.length, duplicates: 0 };
  }

  try {
    const QuestionModel = createQuestionModel(fileInfo.subject, fileInfo.grade);
    const enhancedQuestions = questions.map(q => 
      enhanceQuestion(q, sourceName, fileInfo.subject, fileInfo.grade)
    );
    
    // 检查重复题目
    let duplicateCount = 0;
    const uniqueQuestions = [];
    const seenQuestions = new Set();
    
    for (const question of enhancedQuestions) {
      if (seenQuestions.has(question.question)) {
        duplicateCount++;
        if (options.verbose) {
          console.warn(`⚠️  发现重复题目: ${question.question.substring(0, 50)}...`);
        }
      } else {
        seenQuestions.add(question.question);
        uniqueQuestions.push(question);
      }
    }
    
    const operations = uniqueQuestions.map(question => ({
      updateOne: {
        filter: { question: question.question }, // 使用题目内容作为唯一标识
        update: { $set: question },
        upsert: true
      }
    }));

    const result = await QuestionModel.bulkWrite(operations, { ordered: false });
    
    // 添加重复计数
    result.duplicates = duplicateCount;
    
    if (options.verbose) {
      console.log(`✅ 详细处理结果 - ${sourceName} -> ${fileInfo.collectionName}:`);
      console.log(`   - 处理题目: ${questions.length} 条`);
      console.log(`   - 唯一题目: ${uniqueQuestions.length} 条`);
      console.log(`   - 新增: ${result.upsertedCount} 条`);
      console.log(`   - 更新: ${result.modifiedCount} 条`);
      console.log(`   - 文件内重复: ${duplicateCount} 条`);
      console.log(`   - 跳过: ${questions.length - result.upsertedCount - result.modifiedCount - duplicateCount} 条`);
    }
    
    return result;
  } catch (error) {
    // 处理MongoDB重复键错误
    if (error.code === 11000) {
      console.warn(`⚠️  检测到重复题目，已跳过 (${sourceName})`);
      return { upsertedCount: 0, modifiedCount: 0, duplicates: questions.length };
    }
    console.error(`❌ 处理数据失败 (${sourceName}):`, error.message);
    throw error;
  }
}

// 创建数据库索引
async function createIndexes(models) {
  try {
    for (const model of models) {
      await model.createIndexes();
    }
    console.log(`✅ 为 ${models.length} 个集合创建索引成功`);
  } catch (error) {
    console.error('❌ 创建索引失败:', error.message);
  }
}

// 清除现有数据
async function clearExistingData(options) {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const questionCollections = collections.filter(col => 
      col.name.startsWith('questions_')
    );
    
    if (options.subject || options.grade) {
      // 只清除指定学科或年级的数据
      const filteredCollections = questionCollections.filter(col => {
        if (options.subject && !col.name.includes(`_${options.subject}_`)) {
          return false;
        }
        if (options.grade && !col.name.includes(`_grade${options.grade}`)) {
          return false;
        }
        return true;
      });
      
      for (const col of filteredCollections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        if (count > 0) {
          await mongoose.connection.db.collection(col.name).deleteMany({});
          console.log(`🗑️  已清除集合 ${col.name} 中的 ${count} 条数据`);
        }
      }
    } else {
      // 清除所有题目数据
      for (const col of questionCollections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        if (count > 0) {
          await mongoose.connection.db.collection(col.name).deleteMany({});
          console.log(`🗑️  已清除集合 ${col.name} 中的 ${count} 条数据`);
        }
      }
    }
    
    if (questionCollections.length === 0) {
      console.log('📭 未找到题目集合，无需清除');
    }
  } catch (error) {
    console.error('❌ 清除数据失败:', error.message);
    throw error;
  }
}

// 数据验证函数（增强版）
function validateQuestion(question, index, fileName, options) {
  const required = ['id', 'question', 'options', 'right_answer', 'category', 'level'];
  const missing = required.filter(field => !question[field]);
  
  if (missing.length > 0) {
    const message = `${fileName} 第 ${index + 1} 题缺少必需字段: ${missing.join(', ')}`;
    if (options.verbose) console.warn(`⚠️  ${message}`);
    return { valid: false, errors: [`缺少字段: ${missing.join(', ')}`] };
  }
  
  const errors = [];
  
  // 验证选项格式
  if (!Array.isArray(question.options) || question.options.length === 0) {
    errors.push('选项格式错误');
  } else if (question.options.length < 2) {
    errors.push('选项数量不足');
  }
  
  // 验证答案格式
  if (question.right_answer && !question.options.some(opt => opt.startsWith(question.right_answer))) {
    errors.push('答案与选项不匹配');
  }
  
  // 验证ID格式
  if (typeof question.id !== 'number' || question.id <= 0) {
    errors.push('ID格式错误');
  }
  
  if (errors.length > 0) {
    if (options.verbose) {
      console.warn(`⚠️  ${fileName} 第 ${index + 1} 题验证失败: ${errors.join(', ')}`);
    }
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
}

// 生成数据统计报告
async function generateReport() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const questionCollections = collections.filter(col => 
      col.name.startsWith('questions_')
    );
    
    console.log('\n📊 数据统计报告:');
    console.log(`   - 找到 ${questionCollections.length} 个题目集合`);
    
    let totalQuestions = 0;
    const subjectStats = {};
    const gradeStats = {};
    
    for (const col of questionCollections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      totalQuestions += count;
      
      // 解析集合名称
      const match = col.name.match(/questions_(\w+)_grade(\d+)/);
      if (match) {
        const subject = match[1];
        const grade = parseInt(match[2]);
        
        if (!subjectStats[subject]) subjectStats[subject] = 0;
        if (!gradeStats[grade]) gradeStats[grade] = 0;
        
        subjectStats[subject] += count;
        gradeStats[grade] += count;
        
        console.log(`   - ${col.name}: ${count} 条题目`);
      }
    }
    
    console.log(`\n📈 汇总统计:`);
    console.log(`   - 题目总数: ${totalQuestions} 条`);
    console.log(`   - 学科分布:`);
    Object.entries(subjectStats).forEach(([subject, count]) => {
      console.log(`     * ${subject}: ${count} 条`);
    });
    console.log(`   - 年级分布:`);
    Object.entries(gradeStats).forEach(([grade, count]) => {
      console.log(`     * ${grade}年级: ${count} 条`);
    });
    
  } catch (error) {
    console.error('❌ 生成报告失败:', error.message);
  }
}

// 主初始化函数
async function advancedInitialize() {
  const options = parseArgs();
  
  console.log('🚀 开始多学科数据初始化...');
  if (options.dryRun) console.log('🔍 运行在预览模式');
  if (options.verbose) console.log('📝 详细日志模式已启用');
  if (options.subject) console.log(`🎯 只处理学科: ${options.subject}`);
  if (options.grade) console.log(`🎯 只处理年级: ${options.grade}`);
  
  try {
    // 连接MongoDB
    console.log('📡 连接MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB连接成功');

    // 清除现有数据（如果指定）
    if (options.clearData && !options.dryRun) {
      await clearExistingData(options);
    }

    // 获取数据目录路径
    const dataPath = options.dataPath || path.join(__dirname, '..', 'docs', 'data');
    console.log(`📂 扫描数据目录: ${dataPath}`);

    // 获取所有JSON文件
    const jsonFiles = getAllJsonFiles(dataPath, options);
    console.log(`📄 找到 ${jsonFiles.length} 个JSON文件:`);

    // 按学科和年级分组显示
    const fileGroups = {};
    jsonFiles.forEach(file => {
      const fileInfo = parseFileInfo(file);
      if (fileInfo) {
        const key = `${fileInfo.subject}_grade${fileInfo.grade}`;
        if (!fileGroups[key]) fileGroups[key] = [];
        fileGroups[key].push(fileInfo.fileName);
      }
    });

    Object.entries(fileGroups).forEach(([key, files]) => {
      console.log(`   - ${key}: ${files.join(', ')}`);
    });

    if (jsonFiles.length === 0) {
      console.log('⚠️  未找到匹配的JSON文件，初始化结束');
      return;
    }

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let totalDuplicates = 0;
    const usedModels = new Set();

    // 处理每个JSON文件
    for (const filePath of jsonFiles) {
      const fileName = path.basename(filePath);
      const fileInfo = parseFileInfo(filePath);
      
      if (!fileInfo) {
        console.log(`❌ 跳过文件: ${fileName} (无法解析学科和年级信息)`);
        continue;
      }

      console.log(`\n📖 处理文件: ${fileName} -> ${fileInfo.collectionName}`);
      
      const data = readJsonFile(filePath);
      if (!data) {
        console.log(`❌ 跳过文件: ${fileName}`);
        continue;
      }

      if (!Array.isArray(data)) {
        console.error(`❌ ${fileName} 不是有效的数组格式`);
        continue;
      }

      // 验证和过滤数据
      const validQuestions = [];
      const validationResults = data.map((question, index) => 
        validateQuestion(question, index, fileName, options)
      );

      validationResults.forEach((result, index) => {
        if (result.valid) {
          validQuestions.push(data[index]);
        } else {
          totalErrors++;
          if (options.verbose) {
            console.warn(`⚠️  题目 ${index + 1} 验证失败: ${result.errors.join(', ')}`);
          }
        }
      });

      if (validQuestions.length === 0) {
        console.log(`⚠️  ${fileName} 没有有效的题目数据`);
        continue;
      }

      console.log(`✅ ${fileName} 验证通过 ${validQuestions.length}/${data.length} 条题目`);

      // 处理数据
      try {
        const result = await processQuestions(validQuestions, fileName, fileInfo, options);
        totalProcessed += validQuestions.length;
        totalInserted += result.upsertedCount || 0;
        totalUpdated += result.modifiedCount || 0;
        totalDuplicates += result.duplicates || 0;
        
        // 记录使用的模型
        if (!options.dryRun) {
          usedModels.add(createQuestionModel(fileInfo.subject, fileInfo.grade));
        }
      } catch (error) {
        console.error(`❌ 处理 ${fileName} 时发生错误:`, error.message);
      }
    }

    // 创建索引
    if (options.createIndexes && !options.dryRun && usedModels.size > 0) {
      await createIndexes(Array.from(usedModels));
    }

    // 输出总结
    console.log('\n🎉 多学科数据初始化完成!');
    console.log(`📊 处理统计:`);
    console.log(`   - 总计处理: ${totalProcessed} 条题目`);
    console.log(`   - 新增: ${totalInserted} 条`);
    console.log(`   - 更新: ${totalUpdated} 条`);
    console.log(`   - 重复跳过: ${totalDuplicates} 条`);
    console.log(`   - 验证错误: ${totalErrors} 条`);
    console.log(`   - 涉及集合: ${usedModels.size} 个`);

    // 生成报告
    if (!options.dryRun) {
      await generateReport();
    }

  } catch (error) {
    console.error('❌ 初始化过程中发生错误:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 数据库连接已关闭');
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  advancedInitialize()
    .then(() => {
      console.log('✅ 多学科初始化脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 多学科初始化脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  advancedInitialize,
  createQuestionModel,
  parseFileInfo
}; 