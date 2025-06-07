// 测试MongoDB查询功能
const fetch = require('node-fetch');

// 测试塔防API
async function testTowerDefenseAPI() {
    try {
        console.log('🚀 开始测试塔防API MongoDB查询功能...\n');

        const testData = {
            subject: 'math',
            grade: 4,
            category: '四则运算',
            questionCount: 10,
            waveCount: 3,
            difficulty: 2
        };

        console.log('📊 发送请求数据:');
        console.log(JSON.stringify(testData, null, 2));
        console.log('\n');

        const response = await fetch('http://localhost:3000/api/tower-defense/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP 错误! 状态: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('✅ API 响应成功!');
        console.log('📝 响应状态:', result.success ? '成功' : '失败');
        console.log('💬 响应消息:', result.message);
        
        if (result.data) {
            console.log('\n📋 数据概览:');
            console.log('- 题目数量:', result.data.questions?.length || 0);
            console.log('- 怪物波次:', result.data.monsters?.waves?.length || 0);
            console.log('- 塔类型数量:', Object.keys(result.data.towers || {}).length);
            
            if (result.data.questions && result.data.questions.length > 0) {
                console.log('\n🎯 示例题目:');
                console.log('问题:', result.data.questions[0].question);
                console.log('选项:', result.data.questions[0].options);
                console.log('正确答案:', result.data.questions[0].correct);
            }
            
            if (result.data.gameConfig) {
                console.log('\n⚙️ 游戏配置:');
                console.log('- 初始生命值:', result.data.gameConfig.initialHealth);
                console.log('- 初始分数:', result.data.gameConfig.initialScore);
                console.log('- 正确答案奖励:', result.data.gameConfig.scorePerCorrectAnswer);
            }
        }
        
        console.log('\n🎉 测试完成!');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 提示: 请确保后端服务器已启动 (npm start)');
        }
    }
}

// 测试普通题目查询API
async function testQuestionAPI() {
    try {
        console.log('\n🔍 测试普通题目查询API...\n');

        const url = 'http://localhost:3000/api/questions?subject=math&grade=4&category=四则运算&count=5';
        console.log('📡 GET 请求:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP 错误! 状态: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('✅ 题目查询API响应成功!');
        console.log('📝 响应状态:', result.success ? '成功' : '失败');
        console.log('💬 响应消息:', result.message);
        
        if (result.data && result.data.questions) {
            console.log('📊 获取到', result.data.questions.length, '道题目');
            
            if (result.data.questions.length > 0) {
                console.log('\n📝 示例题目:');
                const q = result.data.questions[0];
                console.log('- ID:', q.id);
                console.log('- 问题:', q.question);
                console.log('- 选项:', q.options);
                console.log('- 正确答案:', q.right_answer);
                console.log('- 类别:', q.category);
            }
        }
        
    } catch (error) {
        console.error('❌ 题目查询测试失败:', error.message);
    }
}

// 执行测试
async function runTests() {
    await testTowerDefenseAPI();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    await testQuestionAPI();
    
    console.log('\n🏁 所有测试完成!');
}

runTests(); 