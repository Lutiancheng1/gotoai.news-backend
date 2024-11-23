import { Dropdown, Button, MenuProps } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { Modal } from 'antd'
import { RootState } from '@/store'
import { Header } from 'antd/es/layout/layout'

const HeaderComponent = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        dispatch(logout())
        navigate('/login')
      }
    })
  }
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
    <Header className="bg-white px-4 flex justify-end items-center">
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Button type="link" icon={<UserOutlined />} className="h-16 flex items-center">
          {user?.username || 'User'}
        </Button>
      </Dropdown>
    </Header>
  )
}

export default HeaderComponent
