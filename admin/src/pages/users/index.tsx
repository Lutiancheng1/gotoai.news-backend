import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Space, Button, Modal, message, Form, Input, Select, Card, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AppDispatch, RootState } from '@/store'
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '@/store/slices/usersSlice'
import type { User } from '@/types'

const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, total, loading } = useSelector((state: RootState) => state.users)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })

  // 添加初始化检查
  useEffect(() => {
    // 如果没有用户数据，则发起请求
    if (!users.length) {
      dispatch(
        fetchUsers({
          page: pagination.current,
          limit: pagination.pageSize
        })
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理搜索
  const handleSearch = async (values: any) => {
    dispatch(
      fetchUsers({
        page: 1,
        limit: pagination.pageSize,
        ...values
      })
    )
    setPagination({ ...pagination, current: 1 })
  }

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields()
    dispatch(
      fetchUsers({
        page: 1,
        limit: pagination.pageSize
      })
    )
    setPagination({ ...pagination, current: 1 })
  }

  // 处理表格变化
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination)
    dispatch(
      fetchUsers({
        page: newPagination.current,
        limit: newPagination.pageSize,
        ...searchForm.getFieldsValue()
      })
    )
  }

  // 处理创建/编辑用户
  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && currentUser?._id) {
        await dispatch(
          updateUser({
            id: currentUser._id,
            data: values
          })
        ).unwrap()
        message.success('更新用户成功')
      } else {
        await dispatch(createUser(values)).unwrap()
        message.success('创建用户成功')
      }
      setIsModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  // 处理删除用户
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteUser(id)).unwrap()
          message.success('删除成功')
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  // 处理切换用户状态
  const handleToggleStatus = async (id: string) => {
    try {
      await dispatch(toggleUserStatus(id)).unwrap()
      message.success('状态更新成功')
    } catch (error: any) {
      console.log(error)
      message.error(error.message || '状态更新失败')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => <span className={`${role === 'admin' ? 'text-red-600' : 'text-green-600'}`}>{role === 'admin' ? '管理员' : '普通用户'}</span>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '启用' : '停用'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setIsEditing(true)
              setCurrentUser(record)
              form.setFieldsValue({
                username: record.username,
                email: record.email,
                role: record.role
              })
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Button type="link" onClick={() => handleToggleStatus(record._id)}>
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)} className="text-red-600 hover:text-red-800">
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button
          type="primary"
          onClick={() => {
            setIsEditing(false)
            setCurrentUser(null)
            setIsModalVisible(true)
            form.resetFields()
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          添加用户
        </Button>
      </div>

      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch} className="w-full">
          <Form.Item name="username" className="mb-2">
            <Input placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item name="email" className="mb-2">
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item className="mb-2">
            <Space>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="shadow-md">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          className="bg-white rounded-lg"
          onChange={handleTableChange}
          scroll={{
            y: 'calc(100vh - 480px)' // 减去其他元素的高度
          }}
          sticky={{
            offsetHeader: 0
          }}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑用户' : '创建用户'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {isEditing ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage
