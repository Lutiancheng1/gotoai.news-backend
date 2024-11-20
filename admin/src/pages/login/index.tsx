import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import axiosInstance from '../../utils/axios';
import styles from './login.module.css';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', values);
      
      if (response.data.user.role !== 'admin') {
        message.error('只有管理员账号可以登录后台');
        return;
      }

      dispatch(setCredentials({
        token: response.data.token,
        user: response.data.user
      }));
      
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(
        error.response?.data?.message || 
        '登录失败，请检查网络连接'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="管理员登录" className={styles.loginCard}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="邮箱" 
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage; 