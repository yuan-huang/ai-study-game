// 关卡API服务
import { getWithParams, ApiResponse } from '../utils/request';

// 关卡数据接口定义
export interface LevelData {
    category: string;           // 题目分类 (如：古诗词、文学常识)
    count: number;             // 该关卡题目数量
    difficulty_score: number;  // 平均难度分数 (0-5)
}

export interface LevelResponse {
    subject: string;           // 学科代码
    grade: number;            // 年级
    categories: LevelData[];   // 关卡分类数组
}

export interface LevelStatsResponse {
    subject: string;          // 学科代码
    grade: number;           // 年级
    category: string;        // 分类名称
    totalQuestions: number;  // 总题目数
    avgDifficulty: number;   // 平均难度
    avgCorrectRate: number;  // 平均正确率
    allTags: string[];       // 所有标签
}

// 学科映射
export const SUBJECT_MAP = {
    'chinese': '语文塔',
    'math': '数学塔',
    'english': '英语塔',
    'curious': '好奇树',
    'knowledge': '知识花园'
} as const;

export type SubjectCode = keyof typeof SUBJECT_MAP;

// 关卡API服务类
export class LevelApiService {
    /**
     * 获取关卡列表
     * @param subject 学科代码
     * @param grade 年级
     * @returns 关卡列表响应
     */
    async getLevels(subject: SubjectCode, grade: number): Promise<ApiResponse<LevelResponse>> {
        if (!this.isValidSubject(subject)) {
            return {
                success: false,
                message: `无效的学科代码: ${subject}`
            };
        }

        if (!this.isValidGrade(grade)) {
            return {
                success: false,
                message: `无效的年级: ${grade}，应为1-12之间的数字`
            };
        }

        return getWithParams<LevelResponse>('/levels', { subject, grade });
    }

    /**
     * 获取特定关卡的统计信息
     * @param subject 学科代码
     * @param grade 年级
     * @param category 分类名称
     * @returns 关卡统计响应
     */
    async getLevelStats(
        subject: SubjectCode, 
        grade: number, 
        category: string
    ): Promise<ApiResponse<LevelStatsResponse>> {
        if (!this.isValidSubject(subject)) {
            return {
                success: false,
                message: `无效的学科代码: ${subject}`
            };
        }

        if (!this.isValidGrade(grade)) {
            return {
                success: false,
                message: `无效的年级: ${grade}`
            };
        }

        if (!category.trim()) {
            return {
                success: false,
                message: '分类名称不能为空'
            };
        }

        return getWithParams<LevelStatsResponse>('/levels/stats', {
            subject,
            grade,
            category
        });
    }

    /**
     * 验证学科代码是否有效
     * @param subject 学科代码
     * @returns 是否有效
     */
    private isValidSubject(subject: string): subject is SubjectCode {
        return Object.keys(SUBJECT_MAP).includes(subject);
    }

    /**
     * 验证年级是否有效
     * @param grade 年级
     * @returns 是否有效
     */
    private isValidGrade(grade: number): boolean {
        return Number.isInteger(grade) && grade >= 1 && grade <= 12;
    }

    /**
     * 获取学科名称
     * @param subject 学科代码
     * @returns 学科名称
     */
    getSubjectName(subject: SubjectCode): string {
        return SUBJECT_MAP[subject] || '未知学科';
    }

    /**
     * 根据难度分数获取颜色
     * @param difficultyScore 难度分数
     * @returns 颜色值
     */
    getDifficultyColor(difficultyScore: number): number {
        if (difficultyScore <= 1.5) return 0x4CAF50; // 绿色 - 简单
        if (difficultyScore <= 2.5) return 0x2196F3; // 蓝色 - 中等
        if (difficultyScore <= 3.5) return 0xFF9800; // 橙色 - 困难
        return 0xF44336; // 红色 - 专家
    }

    /**
     * 格式化关卡数据用于显示
     * @param levelData 关卡数据
     * @returns 格式化后的显示信息
     */
    formatLevelDisplay(levelData: LevelData) {
        const color = this.getDifficultyColor(levelData.difficulty_score);
        const difficultyText = levelData.difficulty_score.toFixed(1);
        
        return {
            title: levelData.category,
            info: `${levelData.count}题 | 难度: ${difficultyText}`,
            color
        };
    }

    /**
     * 对关卡数据进行排序
     * @param categories 关卡数据数组
     * @returns 排序后的关卡数据
     */
    sortLevels(categories: LevelData[]): LevelData[] {
        return [...categories].sort((a, b) => {
            // 按分类名称排序
            return a.category.localeCompare(b.category);
        });
    }
}

// 创建单例实例
export const levelApi = new LevelApiService();

// 导出类型
export type { ApiResponse };

// 默认导出
export default levelApi; 