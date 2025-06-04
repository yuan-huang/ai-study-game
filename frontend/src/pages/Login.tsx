import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grade, Gender, UserInfo } from '../types/user';
import { useUserStore } from '../stores/userStore';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

// 年级映射表
const gradeMap = {
  '小学一年级': 1, '小学二年级': 2, '小学三年级': 3,
  '小学四年级': 4, '小学五年级': 5, '小学六年级': 6,
  '初一': 7, '初二': 8, '初三': 9,
  '高一': 10, '高二': 11, '高三': 12
};

const grades: Grade[] = [
  '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
  '初一', '初二', '初三',
  '高一', '高二', '高三'
];

const genders: Gender[] = ['男孩', '女孩'];

// 默认科目
const defaultSubjects = ['语文', '数学', '英语'];

// 游戏窗口配置
const GAME_CONFIG = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600
};

interface LoginResponse {
  user: UserInfo;
  token: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);
  const [formData, setFormData] = useState<Partial<UserInfo>>({
    school: '',
    className: '',
    name: '',
    gender: '男孩' as Gender,
    grade: '小学一年级' as Grade
  });

  // 调整窗口大小
  const resizeWindow = () => {
    const { innerWidth, innerHeight } = window;
    const { width, height, minWidth, minHeight } = GAME_CONFIG;
    
    // 计算缩放比例
    const scaleX = innerWidth / width;
    const scaleY = innerHeight / height;
    const scale = Math.min(scaleX, scaleY);
    
    // 确保不小于最小尺寸
    const targetWidth = Math.max(width * scale, minWidth);
    const targetHeight = Math.max(height * scale, minHeight);
    
    // 调整窗口大小
    window.resizeTo(targetWidth, targetHeight);
    
    // 居中窗口
    const left = (screen.width - targetWidth) / 2;
    const top = (screen.height - targetHeight) / 2;
    window.moveTo(left, top);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('请输入姓名');
      return;
    }

    if (!formData.gender) {
      toast.error('请选择性别');
      return;
    }

    try {
      // 转换数据格式以匹配后端要求
      const requestData = {
        username: formData.name,
        grade: gradeMap[formData.grade as keyof typeof gradeMap],
        subjects: defaultSubjects,
        // 附加信息
        profile: {
          school: formData.school || '',
          className: formData.className || '',
          gender: formData.gender
        }
      };

      const response = await userApi.login(requestData);
      
      if (response.success) {
        // 保存token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setUser(response.data.user);
        toast.success('登录成功');
        
        // 调整窗口大小
        resizeWindow();
        
        // 延迟跳转以确保窗口调整完成
        setTimeout(() => {
          navigate('/game');
        }, 500);
      } else {
        toast.error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast.error(error instanceof Error ? error.message : '网络错误，请稍后重试');
    }
  };

  // 组件挂载时检查并调整窗口大小
  useEffect(() => {
    const checkAndResizeWindow = () => {
      const { innerWidth, innerHeight } = window;
      if (innerWidth < GAME_CONFIG.minWidth || innerHeight < GAME_CONFIG.minHeight) {
        resizeWindow();
      }
    };

    checkAndResizeWindow();
    window.addEventListener('resize', checkAndResizeWindow);

    return () => {
      window.removeEventListener('resize', checkAndResizeWindow);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            欢迎来到知识花园
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            开启你的学习冒险
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="school" className="label">
                学校（选填）
              </label>
              <input
                id="school"
                type="text"
                className="input"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="className" className="label">
                班级（选填）
              </label>
              <input
                id="className"
                type="text"
                className="input"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="name" className="label">
                姓名（必填）
              </label>
              <input
                id="name"
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                minLength={2}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="gender" className="label">
                性别
              </label>
              <select
                id="gender"
                className="input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              >
                {genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grade" className="label">
                年级
              </label>
              <select
                id="grade"
                className="input"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as Grade })}
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary w-full">
              开始游戏
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 