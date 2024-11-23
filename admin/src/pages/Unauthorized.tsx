import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/') // 返回首页
    }, 3000) // 3秒后

    return () => clearTimeout(timer) // 清除定时器
  }, [navigate])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">无权限访问</h1>
        <p className="text-lg">3秒后返回首页...</p>
      </div>
    </div>
  )
}

export default Unauthorized
