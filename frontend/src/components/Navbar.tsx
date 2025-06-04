import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();

  const handleLogout = async () => {
    try {
      // 清除本地存储的token
      localStorage.removeItem('token');
      // 清除用户状态
      clearUser();
      // 提示成功
      toast.success('退出成功');
      // 跳转到登录页
      navigate('/login');
    } catch (error) {
      console.error('退出错误:', error);
      toast.error('退出失败，请重试');
    }
  };

  return (
    <nav className="fixed top-0 right-0 p-4 z-50">
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">
            欢迎，{user.name}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm11.707 4.707a1 1 0 0 0-1.414-1.414L10 9.586 6.707 6.293a1 1 0 0 0-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 12.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 11l3.293-3.293z" clipRule="evenodd" />
            </svg>
            <span>退出</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 