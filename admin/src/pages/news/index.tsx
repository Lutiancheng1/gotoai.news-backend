import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

interface News {
  _id: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  author: {
    username: string;
  };
  createdAt: string;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/news');
      setNews(response.data.news);
    } catch (error) {
      message.error('获取新闻列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇新闻吗？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/news/${id}`);
          message.success('删除成功');
          fetchNews();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<News> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <Link to={`/news/edit/${record._id}`}>{text}</Link>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      key: 'author',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/news/edit/${record._id}`}>
            <Button type="link">编辑</Button>
          </Link>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>新闻管理</h2>
        <Link to="/news/create">
          <Button type="primary">创建新闻</Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={news}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default NewsPage; 