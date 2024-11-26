import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Space, Button, Modal, message, Tag, Card, Form, Input, Select, Row, Col, Avatar, Upload, Switch, UploadFile, Tooltip } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import type { AppDispatch, RootState } from '@/store'
import { fetchTalents, createTalent, updateTalent, deleteTalent, toggleFeatured } from '@/store/slices/talentSlice'
import type { Talent } from '@/types'
import { RcFile } from 'antd/es/upload'
import axios from '@/utils/axios'
import axiosInstance from '@/utils/axios'
import { uploadFile, deleteFile, UploadResponse, FileData } from '@/services/fileService'

const { TextArea } = Input

const TalentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { talents, total, loading } = useSelector((state: RootState) => state.talent)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const currentTalent = useRef<Talent | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const [fileList, setFileList] = useState<any[]>([])

  // 初始化数据
  useEffect(() => {
    // 如果没有人才数据，则初始化数据
    if (!talents.length) {
      dispatch(
        fetchTalents({
          page: pagination.current,
          limit: pagination.pageSize
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理搜索
  const handleSearch = (values: any) => {
    dispatch(
      fetchTalents({
        page: 1,
        limit: pagination.pageSize,
        ...values
      })
    )
    setPagination({ ...pagination, current: 1 })
  }

  // 处理表格变化
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination)
    dispatch(
      fetchTalents({
        page: newPagination.current,
        limit: newPagination.pageSize,
        ...searchForm.getFieldsValue()
      })
    )
  }

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条人才信息吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteTalent(id)).unwrap()
          message.success('删除成功')
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  // 处理推荐状态切换
  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await dispatch(toggleFeatured({ id, featured: !featured })).unwrap()
      message.success(featured ? '取消推荐成功' : '推荐成功')
      // 刷新列表数据
      dispatch(
        fetchTalents({
          page: pagination.current,
          limit: pagination.pageSize,
          ...searchForm.getFieldsValue()
        })
      )
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  // 处理文件列表变化
  const handleFileChange = (info: any) => {
    setFileList(info.fileList.slice(-1)) // 只保留最后上传的一个文件
  }

  // 修改文件上传函数
  const handleUpload = async (file: RcFile) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sourceType', 'talent_avatar')

    if (currentTalent.current) {
      formData.append('talentId', currentTalent.current._id)
      formData.append('title', currentTalent.current.name)
    } else {
      formData.append('title', form.getFieldValue('name'))
    }

    const response = await uploadFile(formData)
    if (response) {
      return response.data
    }
    return ''
  }

  // 修改文件删除函数
  const handleRemove = async (file: UploadFile) => {
    console.log(file)
    if (file.response) {
      const { _id } = file.response as FileData

      const success = await deleteFile(_id)
      if (success) {
        setFileList([]) // 清空文件列表
        // 此时更新一下人才数据
        if (currentTalent.current) {
          await dispatch(
            updateTalent({
              id: currentTalent.current?._id || '',
              params: {
                ...currentTalent.current,
                avatar: null
              }
            })
          ).unwrap()
        }
      }
      return success
    }
    return true
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    console.log(fileList, values)
    try {
      const requestData = {
        ...values,
        // 使用上传后的URL
        avatar: (fileList[0]?.response as FileData) || null
      }

      if (isEditing && currentTalent.current) {
        await dispatch(
          updateTalent({
            id: currentTalent.current?._id,
            params: requestData
          })
        ).unwrap()
        message.success('更新成功')
      } else {
        await dispatch(createTalent(requestData)).unwrap()
        message.success('创建成功')
      }

      setIsModalVisible(false)
      form.resetFields()
      setFileList([])

      // 刷新列表
      dispatch(
        fetchTalents({
          page: pagination.current,
          limit: pagination.pageSize,
          ...searchForm.getFieldsValue()
        })
      )
    } catch (error: any) {
      // 优化错误提示
      if (error.errors) {
        const errorMessages = error.errors.map((err: any) => `${err.field}: ${err.message}`).join('\n')
        message.error(errorMessages)
      } else {
        message.error(error.message || (isEditing ? '更新失败' : '创建失败'))
      }
    }
  }

  // 添加处理编辑的函数
  const handleEdit = (record: Talent) => {
    setIsEditing(true)
    // 设置当前编辑的人才信息，但移除 avatar 字段
    const { avatar, ...restRecord } = record
    currentTalent.current = restRecord
    form.resetFields() // 先重置表单
    form.setFieldsValue(restRecord) // 再设置新值

    // 如果有头像，初始化文件列表
    if (avatar && avatar.url !== '') {
      setFileList([
        {
          uid: avatar._id,
          name: avatar.originalName || 'avatar.png',
          status: 'done',
          response: avatar,
          url: avatar.url
        }
      ])
    } else {
      setFileList([])
    }
    setIsModalVisible(true)
  }

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields()
    dispatch(
      fetchTalents({
        page: 1,
        limit: pagination.pageSize
      })
    )
    setPagination({ ...pagination, current: 1 })
  }

  // 添加新增按钮的处理函数
  const handleAdd = () => {
    setIsEditing(false)
    currentTalent.current = null
    setFileList([])
    form.resetFields() // 确保表单被完全重置
    setIsModalVisible(true)
  }
  // 添加处理取消的函数
  const handleCancel = () => {
    setIsEditing(false)
    currentTalent.current = null
    setFileList([])
    form.resetFields()
    setIsModalVisible(false)
  }
  // 修改表格列配置，添加编辑按钮
  const columns: ColumnsType<Talent> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => <Avatar src={avatar?.url || ''} />
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => {
        const MAX_TAGS = 2
        const displayTags = skills.slice(0, MAX_TAGS)
        const remainingTags = skills.slice(MAX_TAGS)
        return (
          <Space>
            {displayTags.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
            {remainingTags.length > 0 && (
              <Tooltip
                title={
                  <div className="space-y-1">
                    {remainingTags.map((skill) => (
                      <div key={skill}>{skill}</div>
                    ))}
                  </div>
                }
              >
                <Tag>+{remainingTags.length}</Tag>
              </Tooltip>
            )}
          </Space>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'available' ? 'green' : 'red'}>{status === 'available' ? '在职' : '离职'}</Tag>
    },
    {
      title: '推荐',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean, record) => <Switch checked={featured} onChange={() => handleToggleFeatured(record._id, featured)} />
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
      width: 100,
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

  return (
    <div className="space-y-6">
      {/* 标题和添加按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">人才管理</h2>
        <Button type="primary" className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
          添加人才
        </Button>
      </div>

      {/* 搜索表单 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch} className="w-full">
          <Form.Item name="keyword" className="mb-2">
            <Input placeholder="搜索姓名/职位" allowClear />
          </Form.Item>
          <Form.Item name="status" className="mb-2">
            <Select placeholder="选择状态" allowClear style={{ width: 120 }}>
              <Select.Option value="available">在职</Select.Option>
              <Select.Option value="not-available">离职</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="featured" className="mb-2">
            <Select placeholder="推荐状态" allowClear style={{ width: 120 }}>
              <Select.Option value="true">已推荐</Select.Option>
              <Select.Option value="false">未推荐</Select.Option>
            </Select>
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

      {/* 表格 */}
      <Card className="shadow-md">
        <Table
          columns={columns}
          dataSource={talents}
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

      {/* 弹窗表单 */}
      <Modal title={isEditing ? '编辑人才' : '添加人才'} open={isModalVisible} onCancel={() => handleCancel()} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={currentTalent || {}} className="h-full">
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                  <Input placeholder="请输入姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="position" label="职位" rules={[{ required: true, message: '请输入职位' }]}>
                  <Input placeholder="请输入职位" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="skills" label="技能" rules={[{ required: true, message: '请选择技能' }]}>
                  <Select mode="tags" placeholder="请输入技能，按回车分隔" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contact" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
                  <Input placeholder="请输入联系方式" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="头像">
                  <Upload
                    maxCount={1}
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleFileChange}
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        const data = await handleUpload(file as RcFile)
                        if (data) {
                          onSuccess?.(data)
                        } else {
                          onError?.(new Error('上传失败'))
                        }
                      } catch (error) {
                        onError?.(error as Error)
                      }
                    }}
                    onRemove={handleRemove}
                    showUploadList={{
                      showPreviewIcon: false, // 如果你想要自定义预览，可以显示预览按钮
                      showRemoveIcon: true
                    }}
                  >
                    {fileList.length < 1 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                {isEditing && (
                  <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                    <Select>
                      <Select.Option value="available">在职</Select.Option>
                      <Select.Option value="not-available">离职</Select.Option>
                    </Select>
                  </Form.Item>
                )}
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="workExperience" label="工作经验" rules={[{ required: true, message: '请输入工作经验' }]}>
                  <TextArea placeholder="请输入工作经验" rows={4} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="education" label="教育背景" rules={[{ required: true, message: '请输入教育背景' }]}>
                  <TextArea placeholder="请输入教育背景" rows={4} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="summary" label="简介" rules={[{ required: true, message: '请输入简介' }]}>
              <TextArea placeholder="请输入简介" rows={4} />
            </Form.Item>
            <Form.Item className="sticky bottom-0 bg-white pt-4 mb-0 flex justify-end z-10">
              <Space>
                <Button onClick={handleCancel}>取消</Button>
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

export default TalentsPage
