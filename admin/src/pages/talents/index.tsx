import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, message, Tag, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

interface Talent {
  _id: string;
  name: string;
  title: string;
  avatar: string;
  status: 'available' | 'not-available';
  featured: boolean;
  skills: string[];
  createdAt: string;
}

const TalentsPage: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/talents');
      setTalents(response.data.talents);
    } catch (error) {
      message.error('获取人才列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条人才信息吗？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/talents/${id}`);
          message.success('删除成功');
          fetchTalents();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await axiosInstance.patch(`/talents/${id}/featured`, { featured: !featured });
      message.success(featured ? '取消推荐成功' : '推荐成功');
      fetchTalents();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<Talent> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <Link to={`/talents/edit/${record._id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <>
          {skills.map(skill => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
          {status === 'available' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '推荐',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured) => (
        <Tag color={featured ? 'gold' : 'default'}>
          {featured ? '已推荐' : '未推荐'}
        </Tag>
      ),
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
          <Link to={`/talents/edit/${record._id}`}>
            <Button type="link">编辑</Button>
          </Link>
          <Button
            type="link"
            onClick={() => handleToggleFeatured(record._id, record.featured)}
          >
            {record.featured ? '取消推荐' : '推荐'}
          </Button>
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
        <h2>人才管理</h2>
        <Link to="/talents/create">
          <Button type="primary">添加人才</Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={talents}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default TalentsPage; 