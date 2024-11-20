import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import axiosInstance from '../../utils/axios';

interface ProfileForm {
  username: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();

  const onFinish = async (values: ProfileForm) => {
    try {
      if (values.newPassword && values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      const response = await axiosInstance.put('/auth/profile', values);
      dispatch(setCredentials(response.data));
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败，请检查当前密码是否正确');
    }
  };

  return (
    <div>
      <h2>个人设置</h2>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: user?.username,
            email: user?.email,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage; 