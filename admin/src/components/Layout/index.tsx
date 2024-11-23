import React from 'react'
import { Layout, Menu, Dropdown, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { LogoutOutlined, UserOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, UserSwitchOutlined, SettingOutlined } from '@ant-design/icons'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  const selectedKey = location.pathname.split('/')[1] || 'dashboard'

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
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
      label: '新闻'
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
          label: '新闻分类'
        },
        {
          key: 'files',
          label: '文件管理'
        }
      ]
    }
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout className="min-h-screen">
      <Sider>
        <div className="h-16 px-4 text-white text-lg font-bold flex items-center justify-center">Admin System</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} onClick={handleMenuClick} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex justify-end items-center">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="link" icon={<UserOutlined />} className="h-16 flex items-center">
              {user?.username || 'User'}
            </Button>
          </Dropdown>
        </Header>
        <Content className="m-4 p-6 bg-white h-[calc(100vh-96px)] overflow-hidden no-scrollbar rounded-lg min-h-[280px]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
