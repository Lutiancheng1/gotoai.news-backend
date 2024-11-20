import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axiosInstance from '../../utils/axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/users/${id}`);
          message.success('删除成功');
          fetchUsers();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
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
          <Button type="link" onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>用户管理</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default UsersPage; 