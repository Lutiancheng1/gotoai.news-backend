import React, { useEffect, useState } from 'react'
import { Table, Button, Space, message, Modal, Tooltip, Card, Upload, UploadFile } from 'antd'
import { CopyOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { getUserFiles, deleteFile, FileData, uploadFile } from '@/services/fileService'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { fetchNews } from '@/store/slices/newsSlice'
import { fetchTalents } from '@/store/slices/talentSlice'
import copy from 'copy-to-clipboard'
import { RcFile } from 'antd/es/upload'

// 复制URL
export const handleCopy = (url: string) => {
  try {
    copy(url)
    message.success('复制成功')
  } catch (error) {
    message.error('复制失败')
  }
}
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
      // 获取所有文件对象
      const files = fileList.map((file) => file.originFileObj).filter((file): file is RcFile => !!file)

      // 使用 Promise.all 并行上传所有文件
      const uploadPromises = files.map((file) => uploadFile(file))
      const results = await Promise.all(uploadPromises)

      // 检查上传结果
      const successCount = results.filter((result) => result !== null).length
      if (successCount > 0) {
        message.success(`成功上传 ${successCount} 个文件`)
        if (successCount < files.length) {
          message.warning(`${files.length - successCount} 个文件上传失败`)
        }
        fetchFiles() // 刷新文件列表
        setIsModalVisible(false)
        setFileList([])
      }
    } catch (error) {
      message.error('文件上传失败')
    } finally {
      setUploading(false)
    }
  }

  // 修改文件列表变化处理函数,移除单文件限制
  const handleFileChange = (info: any) => {
    setFileList(info.fileList)
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
      sorter: (a: FileData, b: FileData) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      },
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (record: FileData) => (
        <Space size="middle">
          <Tooltip title="复制URL">
            <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopy(record.url)} />
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
          scroll={{
            y: 'calc(100vh - 380px)' // 减去其他元素的高度
          }}
          sticky={{
            offsetHeader: 0
          }}
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
        <Upload
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false}
          multiple={true} // 启用多文件上传
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Modal>
    </div>
  )
}

export default FilesPage
