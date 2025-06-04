import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        欢迎来到知识花园
      </h1>
      <div className="max-w-2xl mx-auto">
        <p className="text-lg text-gray-600 text-center mb-8">
          在这里，每一颗知识的种子都能成长为智慧之花
        </p>
        <div className="grid gap-4">
          <Link
            to="/login"
            className="bg-blue-500 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            开始探索
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home 