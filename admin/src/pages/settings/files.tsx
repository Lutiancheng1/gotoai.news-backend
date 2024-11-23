import React, { useEffect, useState } from 'react'
import { Table, Button, Space, message, Modal, Image, Tooltip, Card, Tag, Upload, UploadFile } from 'antd'
import { CopyOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { getUserFiles, deleteFile, FileData, uploadFile } from '@/services/fileService'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { fetchNews } from '@/store/slices/newsSlice'
import { fetchTalents } from '@/store/slices/talentSlice'
import copy from 'copy-to-clipboard'

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  // 获取文件列表
  const fetchFiles = async () => {
    setLoading(true)
    const response = await getUserFiles()
    if (response && Array.isArray(response.data)) {
      setFiles(response.data)
    } else {
      setFiles([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // 复制URL
  const handleCopyUrl = (url: string) => {
    copy(url)
    message.success('URL已复制到剪贴板')
  }

  // 处理删除
  const handleDelete = (file: FileData) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文件吗？如果文件已被引用，删除可能会影响相关内容的显示。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const success = await deleteFile(file._id)
        if (success) {
          fetchFiles()
          // 刷新可能引用此文件的列表
          dispatch(fetchNews({ page: 1, limit: 10 }))
          dispatch(fetchTalents({ page: 1, limit: 10 }))
        }
      }
    })
  }

  // 处理文件上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件')
      return
    }

    setUploading(true)
    try {
      const file = fileList[0].originFileObj
      if (file) {
        const response = await uploadFile(file)
        if (response) {
          message.success('上传成功')
          fetchFiles() // 刷新文件列表
          setIsModalVisible(false)
          setFileList([])
        }
      }
    } finally {
      setUploading(false)
    }
  }

  // 处理文件列表变化
  const handleFileChange = (info: any) => {
    setFileList(info.fileList.slice(-1))
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName'
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'mimeType'
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (record: FileData) => (
        <Space size="middle">
          <Tooltip title="复制URL">
            <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyUrl(record.url)} />
          </Tooltip>
          <Tooltip title="预览">
            <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(record.url, '_blank')} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">我的文件</h1>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            上传文件
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={files}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title="上传文件"
        open={isModalVisible}
        styles={{
          body: {
            paddingTop: 10
          }
        }}
        onCancel={() => {
          setIsModalVisible(false)
          setFileList([])
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false)
              setFileList([])
            }}
          >
            取消
          </Button>,
          <Button key="upload" type="primary" loading={uploading} onClick={handleUpload}>
            上传
          </Button>
        ]}
      >
        <Upload fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Modal>
    </div>
  )
}

export default FilesPage
