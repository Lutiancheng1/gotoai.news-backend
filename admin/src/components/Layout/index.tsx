import React from 'react'
import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DashboardOutlined, TeamOutlined, FileTextOutlined, UserSwitchOutlined, SettingOutlined } from '@ant-design/icons'
import { RootState } from '@/store'
import type { MenuProps } from 'antd'
import HeaderComponent from '../Header'

const { Sider, Content } = Layout

const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)

  const selectedKey = location.pathname.split('/')[1] || 'dashboard'

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: '用户',
      disabled: user?.role !== 'admin'
    },
    {
      key: 'news',
      icon: <FileTextOutlined />,
      label: '新闻/招聘'
    },
    {
      key: 'employment',
      icon: <FileTextOutlined />,
      label: '就业资讯'
    },
    {
      key: 'talents',
      icon: <UserSwitchOutlined />,
      label: '人才'
    },
    {
      key: 'systemSettings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'category',
          label: '分类管理'
        },
        {
          key: 'files',
          label: '文件管理'
        }
      ]
    }
  ]

  return (
    <Layout className="min-h-screen">
      <Sider>
        <div className="h-16 px-4 text-white text-lg font-bold flex items-center justify-center">Admin System</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} onClick={handleMenuClick} items={menuItems} />
      </Sider>
      <Layout>
        <HeaderComponent />
        <Content className="m-4 p-6 bg-white h-[calc(100vh-96px)] overflow-hidden no-scrollbar rounded-lg min-h-[280px]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
