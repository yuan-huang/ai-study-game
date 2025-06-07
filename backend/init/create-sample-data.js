const fs = require('fs');
const path = require('path');

// 数学题目示例数据
const mathGrade4Data = [
  {
    id: 101,
    question: "小明有24颗糖果，平均分给6个小朋友，每个小朋友能分到几颗？",
    options: ["A. 3颗", "B. 4颗", "C. 5颗", "D. 6颗"],
    right_answer: "B",
    category: "应用题",
    level: "中级",
    explanation: "24 ÷ 6 = 4，所以每个小朋友能分到4颗糖果。"
  },
  {
    id: 102,
    question: "计算：125 × 8 = ?",
    options: ["A. 900", "B. 1000", "C. 1100", "D. 1200"],
    right_answer: "B",
    category: "计算题",
    level: "中级",
    explanation: "125 × 8 = 125 × 8 = 1000"
  },
  {
    id: 103,
    question: "一个长方形的长是8厘米，宽是5厘米，它的周长是多少厘米？",
    options: ["A. 22厘米", "B. 24厘米", "C. 26厘米", "D. 28厘米"],
    right_answer: "C",
    category: "几何题",
    level: "中级",
    explanation: "长方形周长 = 2 × (长 + 宽) = 2 × (8 + 5) = 2 × 13 = 26厘米"
  }
];

// 英语题目示例数据
const englishGrade5Data = [
  {
    id: 201,
    question: "Choose the correct word: I ____ an apple every day.",
    options: ["A. eat", "B. eats", "C. eating", "D. ate"],
    right_answer: "A",
    category: "语法",
    level: "初级",
    explanation: "主语是第一人称单数'I'，动词用原形'eat'。"
  },
  {
    id: 202,
    question: "What's the plural form of 'child'?",
    options: ["A. childs", "B. children", "C. childes", "D. child's"],
    right_answer: "B",
    category: "词汇",
    level: "初级",
    explanation: "'child'的复数形式是不规则变化，为'children'。"
  },
  {
    id: 203,
    question: "Which sentence is correct?",
    options: [
      "A. She don't like apples.", 
      "B. She doesn't likes apples.", 
      "C. She doesn't like apples.", 
      "D. She not like apples."
    ],
    right_answer: "C",
    category: "语法",
    level: "中级",
    explanation: "第三人称单数的否定句用'doesn't + 动词原形'。"
  }
];

// 创建目录和文件的函数
function createDataFile(dirPath, fileName, data) {
  // 确保目录存在
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 创建目录: ${dirPath}`);
  }
  
  const filePath = path.join(dirPath, fileName);
  
  // 检查文件是否已存在
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  文件已存在，跳过: ${filePath}`);
    return;
  }
  
  // 写入文件
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ 创建文件: ${filePath} (${data.length} 条题目)`);
}

// 主函数
function createSampleData() {
  console.log('🚀 开始创建示例数据文件...');
  
  const dataDir = path.join(__dirname, '..', 'docs', 'data');
  
  // 创建数学题目文件
  const mathDir = path.join(dataDir, 'math');
  createDataFile(mathDir, 'grade4.json', mathGrade4Data);
  
  // 创建英语题目文件
  const englishDir = path.join(dataDir, 'english');
  createDataFile(englishDir, 'grade5.json', englishGrade5Data);
  
  console.log('\n🎉 示例数据文件创建完成!');
  console.log('\n📁 文件结构:');
  console.log('docs/data/');
  console.log('├── chinese/grade4.json (50 条语文题目)');
  console.log('├── math/grade4.json (3 条数学题目)');
  console.log('└── english/grade5.json (3 条英语题目)');
  console.log('\n💡 现在可以运行以下命令测试：');
  console.log('npm run init-db-preview  # 预览所有数据');
  console.log('npm run init-math       # 只初始化数学');
  console.log('npm run init-english    # 只初始化英语');
  console.log('npm run init-db         # 初始化所有学科');
}

// 如果直接运行此脚本
if (require.main === module) {
  createSampleData();
}

module.exports = {
  createSampleData,
  mathGrade4Data,
  englishGrade5Data
}; 