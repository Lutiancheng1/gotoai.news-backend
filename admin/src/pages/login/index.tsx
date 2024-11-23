import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, message, Checkbox, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import axiosInstance from '@/utils/axios'
import { saveCredentials, getStoredCredentials } from '@/utils/storage'
import { LoginResponse } from '@/types'

const { Text } = Typography

interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

interface AdminCredentials {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = React.useState(false)
  const [form] = Form.useForm()
  const [devCredentials, setDevCredentials] = useState<AdminCredentials | null>(null)

  // 获取开发环境默认账号
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      axiosInstance
        .get('/auth/dev-credentials')
        .then((response) => {
          setDevCredentials(response.data)
        })
        .catch((error) => {
          console.error('Failed to fetch dev credentials:', error)
        })
    }
  }, [])

  // 加载保存的凭证或开发环境默认值
  useEffect(() => {
    const credentials = getStoredCredentials()
    if (credentials) {
      form.setFieldsValue({
        email: credentials.email,
        password: credentials.password,
        remember: true
      })
    } else if (process.env.NODE_ENV === 'development' && devCredentials) {
      form.setFieldsValue({
        email: devCredentials.email,
        password: devCredentials.password,
        remember: true
      })
    }
  }, [form, devCredentials])

  const onFinish = async (values: LoginForm) => {
    const { email, password, remember } = values
    setLoading(true)

    try {
      const { data } = await axiosInstance.post<LoginResponse>('/auth/login', { email, password })

      console.log(data)

      // 如果勾选了记住密码，保存到本地
      if (remember) {
        saveCredentials({ email, password })
      }

      dispatch(
        setCredentials({
          token: data.data.token,
          user: data.data.user
        })
      )

      message.success('登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      message.error(error.response?.data?.message || '登录失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="管理员登录" className="w-full max-w-md shadow-lg">
        <Form form={form} name="login" onFinish={onFinish} className="space-y-4">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" disabled={loading} className="rounded-md" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" disabled={loading} className="rounded-md" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">记住账号密码</Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} className="rounded-md">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
