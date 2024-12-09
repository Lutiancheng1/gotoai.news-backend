import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, message, Upload, Switch, Row, Col } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Employment, EmploymentQueryParams } from '@/types'
import { createEmployment, deleteEmployment, fetchEmployments, updateEmployment } from '@/store/slices/employmentSlice'
import TinyMCEEditor from '@/components/TinymceEditor'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import type { UploadFile } from 'antd/es/upload/interface'
import { RcFile } from 'antd/es/upload'
import { deleteFile, uploadFile } from '@/services/fileService'
import UEditor, { UEditorRef } from '@/components/UEditor/index'

const { confirm } = Modal

const EmploymentManagement: React.FC = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch<AppDispatch>()
  const editorRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [employments, setEmployments] = useState<Employment[]>([])
  const [currentEmployment, setCurrentEmployment] = useState<Employment | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const UeditorRef = useRef<UEditorRef>(null)
  const [editorType, setEditorType] = useState<'tinymce' | 'ueditor'>('tinymce')

  // 获取资讯列表
  const fetchEmploymentList = async (params: EmploymentQueryParams = {}) => {
    setLoading(true)
    try {
      const { current, pageSize } = pagination
      const response = await dispatch(
        fetchEmployments({
          page: current,
          limit: pageSize,
          ...params
        })
      ).unwrap()

      setEmployments(response.data.employments)
      setPagination({
        ...pagination,
        total: response.data.pagination.total
      })
    } catch (error) {
      message.error('获取资讯列表失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmploymentList()
  }, [])

  // 表格列配置
  const columns: ColumnsType<Employment> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color={category === 'employment_news' ? 'blue' : 'green'}>{category === 'employment_news' ? '就业资讯' : '就业政策'}</Tag>
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      render: (tag) => {
        const tagColors: Record<string, string> = {
          important: 'red',
          job: 'blue',
          startup: 'green',
          national_policy: 'purple',
          local_policy: 'orange'
        }
        const tagNames: Record<string, string> = {
          important: '要闻',
          job: '就业',
          startup: '创业',
          national_policy: '国家政策',
          local_policy: '地方政策'
        }
        return <Tag color={tagColors[tag]}>{tagNames[tag]}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'published' ? 'success' : 'default'}>{status === 'published' ? '已发布' : '草稿'}</Tag>
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      key: 'author'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  // 处理表格分页变化
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination(pagination)
    fetchEmploymentList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...searchForm.getFieldsValue()
    })
  }

  // 处理搜索
  const handleSearch = async (values: any) => {
    setPagination({ ...pagination, current: 1 })
    await fetchEmploymentList({ ...values, page: 1, limit: pagination.pageSize })
  }

  // 处理编辑
  const handleEdit = (record: Employment) => {
    setCurrentEmployment(record)
    setEditingId(record._id)
    form.setFieldsValue({
      title: record.title,
      source: record.source,
      category: record.category,
      tag: record.tag,
      status: record.status
    })
    if (record.cover) {
      setFileList([
        {
          uid: record.cover._id,
          name: record.cover.originalName || 'cover.png',
          status: 'done',
          url: record.cover.url,
          response: record.cover
        }
      ])
    } else {
      setFileList([])
    }

    // 根据当前编辑器类型设置内容
    if (editorType === 'tinymce') {
      if (editorRef.current) {
        editorRef.current.setContent(record?.content || '')
      } else {
        setTimeout(() => {
          editorRef.current?.setContent(record?.content || '')
        }, 1000)
      }
    } else {
      UeditorRef.current?.setContent(record.content)
    }

    setModalVisible(true)
  }

  // 处理删除
  const handleDelete = (id: string) => {
    confirm({
      title: '确定要删除这条资讯吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteEmployment(id)).unwrap()
          message.success('删除成功')
          fetchEmploymentList()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      let content = ''
      if (editorType === 'tinymce') {
        content = editorRef.current?.getContent() || ''
      } else {
        content = UeditorRef.current?.getContent() || ''
      }

      if (!content) {
        message.error('请输入内容')
        return
      }

      const data = {
        ...values,
        content,
        cover: fileList[0]?.response
          ? {
              _id: fileList[0].response._id,
              url: fileList[0].response.url,
              originalName: fileList[0].response.originalName,
              size: fileList[0].response.size,
              mimeType: fileList[0].response.mimeType,
              createdAt: fileList[0].response.createdAt
            }
          : null
      }

      if (editingId) {
        await dispatch(updateEmployment({ id: editingId, data })).unwrap()
        message.success('更新成功')
      } else {
        await dispatch(createEmployment(data)).unwrap()
        message.success('创建成功')
      }

      setModalVisible(false)
      form.resetFields()
      setFileList([])
      if (editorRef.current) {
        editorRef.current.setContent('')
      }
      fetchEmploymentList()
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败')
    }
  }

  // 处理文件上传
  const handleUpload = async (file: RcFile) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sourceType', 'employment_cover')
    if (editingId) {
      formData.append('employmentId', editingId)
      formData.append('title', form.getFieldValue('title'))
    } else {
      formData.append('title', form.getFieldValue('title'))
    }

    const response = await uploadFile(formData)
    if (response) {
      return response.data
    }
    return ''
  }

  // 处理文件删除
  const handleRemove = async (file: UploadFile) => {
    if (file.response) {
      const { _id } = file.response
      const success = await deleteFile(_id)
      if (success) {
        setFileList([])
        if (editingId) {
          await dispatch(
            updateEmployment({
              id: editingId,
              data: {
                ...form.getFieldsValue(),
                cover: null
              }
            })
          ).unwrap()
        }
      }
      return success
    }
    return true
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">就业资讯管理</h2>
        <Button
          type="primary"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingId(null)
            setModalVisible(true)
            form.resetFields()
          }}
        >
          创建资讯
        </Button>
      </div>

      {/* 搜索卡片 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch} className="w-full">
          <Form.Item name="title" className="mb-2">
            <Input placeholder="资讯标题" allowClear />
          </Form.Item>
          <Form.Item name="category" className="mb-2">
            <Select placeholder="选择分类" allowClear style={{ width: 200 }}>
              <Select.Option value="employment_news">就业资讯</Select.Option>
              <Select.Option value="employment_policy">就业政策</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tag" className="mb-2">
            <Select placeholder="选择标签" allowClear style={{ width: 200 }}>
              <Select.Option value="important">要闻</Select.Option>
              <Select.Option value="job">就业</Select.Option>
              <Select.Option value="startup">创业</Select.Option>
              <Select.Option value="national_policy">国家政策</Select.Option>
              <Select.Option value="local_policy">地方政策</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" className="mb-2">
            <Select placeholder="选择状态" allowClear style={{ width: 120 }}>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-2">
            <Space>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                搜索
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields()
                  setPagination({ ...pagination, current: 1 })
                  fetchEmploymentList()
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 表格卡片 */}
      <Card className="shadow-md">
        <Table
          columns={columns}
          dataSource={employments}
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
            y: 'calc(100vh - 480px)'
          }}
          sticky={{
            offsetHeader: 0
          }}
        />
      </Card>

      {/* 编辑/创建模态框 */}
      <Modal
        title={editingId ? '编辑资讯' : '创建资讯'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setFileList([])
          if (editorRef.current) {
            editorRef.current.setContent('')
          }
        }}
        width={1200}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="h-full">
          <div className="flex gap-6">
            {/* 左侧表单区域 */}
            <div className="w-1/3 flex flex-col gap-4">
              <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                <Input placeholder="请输入标题" />
              </Form.Item>
              <Form.Item name="source" label="来源" rules={[{ required: true, message: '请输入来源' }]}>
                <Input placeholder="请输入来源" />
              </Form.Item>
              <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder="选择分类">
                  <Select.Option value="employment_news">就业资讯</Select.Option>
                  <Select.Option value="employment_policy">就业政策</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="tag" label="标签" rules={[{ required: true, message: '请选择标签' }]}>
                <Select placeholder="选择标签">
                  <Select.Option value="important">要闻</Select.Option>
                  <Select.Option value="job">就业</Select.Option>
                  <Select.Option value="startup">创业</Select.Option>
                  <Select.Option value="national_policy">国家政策</Select.Option>
                  <Select.Option value="local_policy">地方政策</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                <Select placeholder="选择状态">
                  <Select.Option value="published">发布</Select.Option>
                  <Select.Option value="draft">草稿</Select.Option>
                </Select>
              </Form.Item>
              <Row>
                <Col span={12}>
                  <Form.Item label="封面图片">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={({ fileList }) => setFileList(fileList)}
                      customRequest={async ({ file, onSuccess, onError }) => {
                        try {
                          const result = await handleUpload(file as RcFile)
                          onSuccess?.(result)
                        } catch (err) {
                          onError?.(err as Error)
                        }
                      }}
                      onRemove={handleRemove}
                      maxCount={1}
                      showUploadList={{
                        showPreviewIcon: false,
                        showRemoveIcon: true
                      }}
                    >
                      {fileList.length < 1 && '+ 上传封面'}
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Switch
                    checkedChildren="UEditor"
                    unCheckedChildren="TinyMCE"
                    checked={editorType === 'ueditor'}
                    onChange={(checked) => {
                      setEditorType(checked ? 'ueditor' : 'tinymce')
                      setTimeout(() => {
                        if (checked) {
                          UeditorRef.current?.setContent(currentEmployment?.content || '')
                        } else {
                          editorRef.current?.setContent(currentEmployment?.content || '')
                          document.querySelectorAll('textarea[name="editorValue"]').forEach((textarea) => {
                            textarea.remove()
                          })
                        }
                      }, 1000)
                    }}
                  />
                </Col>
              </Row>
            </div>

            {/* 右侧内容区域 */}
            <div className="w-2/3 flex flex-col gap-4">
              <Form.Item label="内容" rules={[{ required: true, message: '请输入内容' }]}>
                {editorType === 'tinymce' ? <TinyMCEEditor ref={editorRef} /> : <UEditor ref={UeditorRef} />}
              </Form.Item>
            </div>
          </div>

          {/* 底部按钮 */}
          <Form.Item className="sticky bottom-0 bg-white mb-0 flex justify-end z-10">
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                  setFileList([])
                  if (editorRef.current) {
                    editorRef.current.setContent('')
                  }
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingId ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EmploymentManagement
