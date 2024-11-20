import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户总数"
              value={11}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="新闻数量"
              value={93}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="人才推荐"
              value={25}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 