import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setCredentials } from '@/store/slices/authSlice'
import axiosInstance from '@/utils/axios'
import { useNavigate } from 'react-router-dom'

interface ProfileForm {
  username: string
  email: string
  currentPassword: string
  newPassword?: string
  confirmPassword?: string
}
interface UpdateProfileSuccess {
  status: string
  message: string
  data: {
    user: {
      id: string
      username: string
      email: string
      role: 'admin' | 'user'
      status: 'active' | 'inactive'
    }
    token: string
  }
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const onFinish = async (values: ProfileForm) => {
    try {
      if (values.newPassword && values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }

      const response: UpdateProfileSuccess = await axiosInstance.put('/auth/update-profile', values)

      dispatch(setCredentials({ token: response.data.token, user: response.data.user }))

      message.success('个人信息更新成功')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response.data.message || '更新失败，请检查当前密码是否正确')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">个人设置</h2>
      <Card className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: user?.username,
            email: user?.email
          }}
          onFinish={onFinish}
          className="space-y-4"
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
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

          <Form.Item name="currentPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
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
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" className="w-full">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SettingsPage
