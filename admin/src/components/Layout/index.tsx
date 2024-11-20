import React from 'react';
import { Layout, Menu, Dropdown, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ height: '64px', padding: '16px', color: 'white' }}>
          Admin System
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          onClick={({ key }) => handleMenuClick(key)}
        >
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="users">Users</Menu.Item>
          <Menu.Item key="news">News</Menu.Item>
          <Menu.Item key="talents">Talents</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Button type="link" icon={<UserOutlined />}>
              {user?.username || 'User'}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 