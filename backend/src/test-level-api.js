// 简单的API测试脚本
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

async function testLevelAPI() {
  console.log('🧪 开始测试关卡API...\n');

  try {
    // 测试获取关卡列表
    console.log('📋 测试获取关卡列表 - 语文4年级');
    const response = await fetch(`${API_BASE_URL}/levels?subject=chinese&grade=4`);
    const result = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data.categories.length > 0) {
      console.log('✅ 关卡列表获取成功');
      
      // 测试获取特定关卡统计信息
      const firstCategory = result.data.categories[0];
      console.log(`\n📊 测试获取关卡统计信息 - ${firstCategory.category} ${firstCategory.level}`);
      
      const statsResponse = await fetch(
        `${API_BASE_URL}/levels/stats?subject=chinese&grade=4&category=${encodeURIComponent(firstCategory.category)}&level=${encodeURIComponent(firstCategory.level)}`
      );
      const statsResult = await statsResponse.json();
      
      console.log('统计信息响应状态:', statsResponse.status);
      console.log('统计信息数据:', JSON.stringify(statsResult, null, 2));
      
      if (statsResult.success) {
        console.log('✅ 关卡统计信息获取成功');
      } else {
        console.log('❌ 关卡统计信息获取失败');
      }
    } else {
      console.log('❌ 关卡列表获取失败或无数据');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/../health`);
    const result = await response.json();
    if (result.status === 'OK') {
      console.log('✅ 服务器运行正常');
      return true;
    }
  } catch (error) {
    console.log('❌ 服务器未运行，请先启动后端服务');
    console.log('   运行命令: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🔍 检查服务器状态...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    console.log('');
    await testLevelAPI();
  }
  
  console.log('\n�� 测试完成');
}

main(); 