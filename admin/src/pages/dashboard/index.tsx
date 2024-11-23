import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, FileTextOutlined } from '@ant-design/icons'
import type { AppDispatch, RootState } from '@/store'
import { fetchUsers } from '@/store/slices/usersSlice'
import { fetchNews } from '@/store/slices/newsSlice'
import { fetchTalents } from '@/store/slices/talentSlice'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { users, total: userTotal } = useSelector((state: RootState) => state.users)
  const { news, total: newsTotal } = useSelector((state: RootState) => state.news)
  const { talents, total: talentTotal } = useSelector((state: RootState) => state.talent)

  useEffect(() => {
    // 根据用户角色获取用户数据
    if (!users.length) {
      dispatch(
        fetchUsers({
          page: 1,
          limit: 10,
          role: user?.role === 'admin' ? undefined : 'user' // 普通用户只获取非管理员用户
        })
      )
    }

    // 获取其他数据...
    if (!news.length) {
      dispatch(fetchNews({ page: 1, limit: 10 }))
    }
    if (!talents.length) {
      dispatch(fetchTalents({ page: 1, limit: 10 }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic title={user?.role === 'admin' ? '用户总数' : '普通用户总数'} value={userTotal} prefix={<UserOutlined className="text-blue-500" />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic title="新闻总数" value={newsTotal} prefix={<FileTextOutlined className="text-green-500" />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic title="人才总数" value={talentTotal} prefix={<UserOutlined className="text-purple-500" />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
