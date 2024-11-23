import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, message, Form, Input, Card } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { fetchCategoriesWithPagination, createCategory, updateCategory, deleteCategory, fetchNews } from '@/store/slices/newsSlice'
import type { Category } from '@/types'

const CategoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { categories, loading } = useSelector((state: RootState) => state.news)
  const { user } = useSelector((state: RootState) => state.auth)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })

  // 操作权限控制
  const canControl = (category: Category) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return category.createdBy._id === user.id
  }
  // 初始化数据
  useEffect(() => {
    dispatch(
      fetchCategoriesWithPagination({
        page: pagination.current,
        limit: pagination.pageSize
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理表格变化
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination)
    dispatch(
      fetchCategoriesWithPagination({
        page: newPagination.current,
        limit: newPagination.pageSize
      })
    )
  }

  // 处理提交
  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && currentCategory?._id) {
        await dispatch(
          updateCategory({
            id: currentCategory._id,
            name: values.name
          })
        ).unwrap()
        dispatch(fetchNews({ page: 1, limit: 10 }))
        message.success('编辑分类成功')
      } else {
        await dispatch(
          createCategory({
            name: values.name
          })
        ).unwrap()
        message.success('创建分类成功')
      }
      setIsModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      console.log(error)

      message.error(error.message || '操作失败')
    }
  }

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？删除后无法恢复，如果该分类下有新闻将无法删除。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteCategory(id)).unwrap()
          message.success('删除成功')
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '创建者',
      dataIndex: ['createdBy', 'username'],
      key: 'createdBy'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
        // canControl(record) && (
        <Button.Group>
          <Button
            type="link"
            onClick={() => {
              setCurrentCategory(record)
              form.setFieldsValue(record)
              setIsEditing(true)
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Button.Group>
      )
      // )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">新闻分类管理</h2>
        <Button
          type="primary"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setIsEditing(false)
            setIsModalVisible(true)
            form.resetFields()
          }}
        >
          创建分类
        </Button>
      </div>
      <Card className="shadow-md">
        <Table
          columns={columns}
          dataSource={Array.isArray(categories) ? categories : []}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          className="bg-white rounded-lg"
          scroll={{
            y: 'calc(100vh - 380px)' // 减去其他元素的高度
          }}
          sticky={{
            offsetHeader: 0
          }}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑分类' : '创建分类'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              {isEditing ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryPage
