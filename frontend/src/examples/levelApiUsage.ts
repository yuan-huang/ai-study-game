// 关卡API使用示例
import { levelApi, LevelData, SubjectCode, SUBJECT_MAP } from '@/api/levelApi';

/**
 * 示例：获取关卡列表
 */
export async function exampleGetLevels() {
    console.log('📚 获取关卡列表示例');
    
    try {
        const subject: SubjectCode = 'chinese';
        const grade = 4;
        
        console.log(`正在获取${levelApi.getSubjectName(subject)}${grade}年级的关卡...`);
        
        const response = await levelApi.getLevels(subject, grade);
        
        if (response.success && response.data) {
            console.log('✅ 获取成功！');
            console.log(`学科: ${response.data.subject}`);
            console.log(`年级: ${response.data.grade}`);
            console.log(`关卡数量: ${response.data.categories.length}`);
            
            // 显示前3个关卡
            response.data.categories.slice(0, 3).forEach((category, index) => {
                const display = levelApi.formatLevelDisplay(category);
                console.log(`${index + 1}. ${display.title}`);
                console.log(`   ${display.info}`);
            });
        } else {
            console.error('❌ 获取失败:', response.message);
        }
    } catch (error) {
        console.error('❌ 发生异常:', error);
    }
}

/**
 * 示例：获取关卡统计信息
 */
export async function exampleGetLevelStats() {
    console.log('📊 获取关卡统计信息示例');
    
    try {
        const subject: SubjectCode = 'chinese';
        const grade = 4;
        const category = '古诗词';
        
        console.log(`正在获取${category}的统计信息...`);
        
        const response = await levelApi.getLevelStats(subject, grade, category);
        
        if (response.success && response.data) {
            console.log('✅ 获取成功！');
            console.log(`总题目数: ${response.data.totalQuestions}`);
            console.log(`平均难度: ${response.data.avgDifficulty}`);
            console.log(`平均正确率: ${(response.data.avgCorrectRate * 100).toFixed(1)}%`);
            console.log(`标签: ${response.data.allTags.join(', ')}`);
        } else {
            console.error('❌ 获取失败:', response.message);
        }
    } catch (error) {
        console.error('❌ 发生异常:', error);
    }
}

/**
 * 示例：使用工具方法
 */
export function exampleUtilityMethods() {
    console.log('🔧 工具方法使用示例');
    
    // 获取学科名称
    console.log('学科映射:');
    Object.entries(SUBJECT_MAP).forEach(([code, name]) => {
        console.log(`  ${code} -> ${name}`);
    });
    
    // 难度颜色测试
    console.log('\n难度颜色映射:');
    [1.0, 2.0, 3.0, 4.0, 5.0].forEach(score => {
        const color = levelApi.getDifficultyColor(score);
        console.log(`  难度 ${score}: 0x${color.toString(16)}`);
    });
}

/**
 * 示例：数据排序和格式化
 */
export function exampleDataProcessing() {
    console.log('📋 数据处理示例');
    
    // 模拟关卡数据
    const mockLevelData: LevelData[] = [
        { category: '古诗词', count: 35, difficulty_score: 2.8 },
        { category: '文学常识', count: 25, difficulty_score: 1.8 },
        { category: '阅读理解', count: 20, difficulty_score: 3.1 },
        { category: '字词理解', count: 40, difficulty_score: 2.2 }
    ];
    
    console.log('原始数据:');
    mockLevelData.forEach((data, index) => {
        console.log(`  ${index + 1}. ${data.category} (${data.count}题, 难度:${data.difficulty_score})`);
    });
    
    // 排序数据
    const sortedData = levelApi.sortLevels(mockLevelData);
    console.log('\n排序后数据:');
    sortedData.forEach((data, index) => {
        const display = levelApi.formatLevelDisplay(data);
        console.log(`  ${index + 1}. ${display.title}`);
        console.log(`     ${display.info} (颜色: 0x${display.color.toString(16)})`);
    });
}

/**
 * 示例：错误处理
 */
export async function exampleErrorHandling() {
    console.log('❌ 错误处理示例');
    
    // 无效学科代码
    const invalidSubject = 'invalid' as SubjectCode;
    const response1 = await levelApi.getLevels(invalidSubject, 4);
    console.log('无效学科代码:', response1.message);
    
    // 无效年级
    const response2 = await levelApi.getLevels('chinese', 15);
    console.log('无效年级:', response2.message);
    
    // 空分类名称
    const response3 = await levelApi.getLevelStats('chinese', 4, '');
    console.log('空分类名称:', response3.message);
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
    console.log('🚀 关卡API使用示例集合\n');
    
    await exampleGetLevels();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleGetLevelStats();
    console.log('\n' + '='.repeat(50) + '\n');
    
    exampleUtilityMethods();
    console.log('\n' + '='.repeat(50) + '\n');
    
    exampleDataProcessing();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleErrorHandling();
    console.log('\n✅ 所有示例运行完成');
}

// 在控制台中运行示例
// runAllExamples(); 