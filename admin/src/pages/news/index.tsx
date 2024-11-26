import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Space, Button, Modal, message, Tag, Card, Form, Input, Select, Row, Col, Upload, UploadFile } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import type { AppDispatch, RootState } from '@/store'
import { fetchNews, fetchCategories, createNews, updateNews, deleteNews } from '@/store/slices/newsSlice'
import type { News, Category } from '@/types'
import { RcFile } from 'antd/es/upload'
import { deleteFile, uploadFile } from '@/services/fileService'
import TinyMCEEditor from '@/components/TinymceEditor'

const mdParser = new MarkdownIt()

const NewsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const editorRef = useRef<{ setContent: (content: string) => {}; getContent: () => string; getFormatContent: () => string }>(null)
  const { news, categories, total, loading } = useSelector((state: RootState) => state.news)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentNews, setCurrentNews] = useState<News | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // // 操作权限控制
  // const canControl = (newsItem: News) => {
  //   if (!user) return false
  //   if (user.role === 'admin') return true
  //   return newsItem.author._id === user.id
  // }

  // 初始化数据
  useEffect(() => {
    if (!news.length) {
      dispatch(
        fetchNews({
          page: pagination.current,
          limit: pagination.pageSize
        })
      )
    }
    if (!categories.length) {
      dispatch(fetchCategories())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理搜索
  const handleSearch = async (values: any) => {
    dispatch(
      fetchNews({
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
      fetchNews({
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
      fetchNews({
        page: newPagination.current,
        limit: newPagination.pageSize,
        ...searchForm.getFieldsValue()
      })
    )
  }

  // 处理提交
  const handleSubmit = async (values: any) => {
    console.log(values)
    try {
      const requestData = {
        ...values,
        cover: fileList[0]?.response || null
      }

      if (isEditing && currentNews) {
        await dispatch(
          updateNews({
            id: currentNews._id,
            data: requestData
          })
        ).unwrap()
        message.success('更新成功')
      } else {
        await dispatch(createNews(requestData)).unwrap()
        message.success('创建成功')
      }

      handleModalClose()
    } catch (error: any) {
      if (error.errors) {
        const errorMessages = error.errors.map((err: any) => `${err.field}: ${err.message}`).join('\n')
        message.error(errorMessages)
      } else {
        message.error(error.message || (isEditing ? '更新失败' : '创建失败'))
      }
    }
  }

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇新闻吗？',
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        try {
          await dispatch(deleteNews(id)).unwrap()
          message.success('删除成功')
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  // 处理文件上传
  const handleUpload = async (file: RcFile) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sourceType', 'news_cover')
    if (currentNews) {
      formData.append('newsId', currentNews._id)
      formData.append('title', currentNews.title)
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
        if (currentNews) {
          await dispatch(
            updateNews({
              id: currentNews._id,
              data: {
                ...currentNews,
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

  // 处理编辑按钮点击
  const handleEdit = (record: News) => {
    setCurrentNews(record)
    setIsEditing(true)
    form.setFieldsValue(record)
    if (editorRef.current) {
      editorRef.current?.setContent(record.content)
    } else {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current?.setContent(record.content)
        } else {
          message.error('编辑器初始化失败')
        }
      }, 1000)
    }

    // 如果有封面，初始化文件列表进行回显
    if (record.cover) {
      setFileList([
        {
          uid: record.cover._id,
          name: 'cover.png', // 或者可以从cover对象中获取实际文件名
          status: 'done',
          url: record.cover.url,
          response: record.cover // 保存完整的cover对象用于后续操作
        }
      ])
    } else {
      setFileList([])
    }

    setIsModalVisible(true)
  }

  // 处理模态框关闭
  const handleModalClose = () => {
    setIsModalVisible(false)
    setIsEditing(false)
    setCurrentNews(null)
    form.resetFields()
    setFileList([]) // 清空文件列表
  }

  const columns: ColumnsType<News> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <div>{text}</div>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'published' ? 'green' : 'orange'}>{status === 'published' ? '已发布' : '草稿'}</Tag>
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
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: News) => (
        <Space size="middle">
          {/* {canControl(record) && ( */}
          <>
            <Button
              type="link"
              onClick={() => {
                handleEdit(record)
              }}
            >
              编辑
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record._id)}>
              删除
            </Button>
          </>
          {/* )} */}
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">新闻管理</h2>
        <Button
          type="primary"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setIsEditing(false)
            setIsModalVisible(true)
            form.resetFields()
          }}
        >
          创建新闻
        </Button>
      </div>
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch} className="w-full">
          <Form.Item name="title" className="mb-2">
            <Input placeholder="新闻标题" allowClear />
          </Form.Item>
          <Form.Item name="category" className="mb-2">
            <Select placeholder="选择分类" allowClear style={{ width: 200 }}>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <Select.Option key={category._id} value={category.name}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="author" className="mb-2">
            <Input placeholder="作者" allowClear />
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
          dataSource={news}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          className="bg-white rounded-lg"
          scroll={{
            y: 'calc(100vh - 480px)' // 减去其他元素的高度
          }}
          sticky={{
            offsetHeader: 0
          }}
        />
      </Card>
      <Modal title={isEditing ? '编辑新闻' : '创建新闻'} width={800} open={isModalVisible} onCancel={handleModalClose} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="h-full">
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                  <Input placeholder="请输入标题" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                  <Select placeholder="选择状态" allowClear>
                    <Select.Option value="draft">草稿</Select.Option>
                    <Select.Option value="published">已发布</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类, 如无法选择请先创建分类' }]}>
                  <Select placeholder="选择分类" allowClear>
                    {Array.isArray(categories) &&
                      categories.map((category) => (
                        <Select.Option key={category._id} value={category.name}>
                          {category.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
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
                      showPreviewIcon: false, // 如果你想要自定义预览，可以显示预览按钮
                      showRemoveIcon: true
                    }}
                  >
                    {fileList.length < 1 && '+ 上传封面'}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
              <TinyMCEEditor ref={editorRef} />
              {/* <MdEditor style={{ height: '400px' }} renderHTML={(text) => mdParser.render(text)} onChange={({ text }) => form.setFieldsValue({ content: text })} /> */}
            </Form.Item>

            <Form.Item className="sticky bottom-0 bg-white mb-0 flex justify-end z-10">
              <Space>
                <Button
                  onClick={() => {
                    handleModalClose()
                  }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit" className="bg-blue-600">
                  {isEditing ? '更新' : '创建'}
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default NewsPage
