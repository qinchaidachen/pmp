import React, { useState, useEffect } from 'react';
import { Card, Button, List, Badge, Space, Typography, Modal, Tabs, Empty } from 'antd';
import { 
  BugOutlined, 
  DeleteOutlined, 
  ExportOutlined, 
  ImportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useErrorStore } from '../../stores/errorStore';
import { errorLogger } from '../../utils/errorLogger';
import { ErrorLog } from '../../hooks/useErrorHandler';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const ErrorMonitor: React.FC = () => {
  const { errors, clearErrors, removeError, resolveError, exportErrors, importErrors } = useErrorStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const errorStats = errorLogger.getStats();

  const filteredErrors = errors.filter(error => {
    switch (activeTab) {
      case 'unresolved':
        return !error.resolved;
      case 'resolved':
        return error.resolved;
      default:
        return true;
    }
  });

  const handleExportLogs = () => {
    const logs = errorLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportLogs = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            errorLogger.importLogs(content);
            importErrors(content);
            Modal.success({
              title: '导入成功',
              content: '错误日志已成功导入',
            });
          } catch (error) {
            Modal.error({
              title: '导入失败',
              content: '文件格式不正确，请检查后重试',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getErrorIcon = (error: ErrorLog) => {
    if (error.resolved) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getErrorLevelBadge = (context: any) => {
    const level = context?.level || 'component';
    const colors = {
      global: 'red',
      page: 'orange',
      component: 'blue',
    };
    return <Badge color={colors[level as keyof typeof colors]} text={level} />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>
            <BugOutlined className="mr-2" />
            错误监控中心
          </Title>
          <Space>
            <Button 
              icon={<ExportOutlined />} 
              onClick={handleExportLogs}
              disabled={errors.length === 0}
            >
              导出日志
            </Button>
            <Button 
              icon={<ImportOutlined />} 
              onClick={handleImportLogs}
            >
              导入日志
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => {
                Modal.confirm({
                  title: '确认清除',
                  content: '确定要清除所有错误日志吗？此操作不可恢复。',
                  onOk: clearErrors,
                });
              }}
              disabled={errors.length === 0}
            >
              清除全部
            </Button>
          </Space>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{errorStats.errorCount}</div>
              <div className="text-sm text-gray-500">总错误数</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{errorStats.warnCount}</div>
              <div className="text-sm text-gray-500">警告数</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{errors.filter(e => !e.resolved).length}</div>
              <div className="text-sm text-gray-500">未解决</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{errors.filter(e => e.resolved).length}</div>
              <div className="text-sm text-gray-500">已解决</div>
            </div>
          </Card>
        </div>

        {/* 错误列表 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`全部 (${errors.length})`} key="all" />
          <TabPane tab={`未解决 (${errors.filter(e => !e.resolved).length})`} key="unresolved" />
          <TabPane tab={`已解决 (${errors.filter(e => e.resolved).length})`} key="resolved" />
        </Tabs>

        <div className="mt-4">
          {filteredErrors.length === 0 ? (
            <Empty 
              description="暂无错误日志" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={filteredErrors}
              renderItem={(error) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedError(error)}
                    >
                      查看
                    </Button>,
                    !error.resolved && (
                      <Button
                        key="resolve"
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => resolveError(error.id)}
                      >
                        标记已解决
                      </Button>
                    ),
                    <Button
                      key="delete"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeError(error.id)}
                    >
                      删除
                    </Button>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={getErrorIcon(error)}
                    title={
                      <Space>
                        <Text strong>{error.error.message}</Text>
                        {getErrorLevelBadge(error.context)}
                        {!error.resolved && <Badge status="processing" text="未解决" />}
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">{formatTimestamp(error.timestamp)}</Text>
                        {error.context?.componentStack && (
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            className="mt-1 text-xs bg-gray-100 p-2 rounded"
                          >
                            {error.context.componentStack}
                          </Paragraph>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Card>

      {/* 错误详情模态框 */}
      <Modal
        title="错误详情"
        open={!!selectedError}
        onCancel={() => setSelectedError(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedError(null)}>
            关闭
          </Button>,
          selectedError && !selectedError.resolved && (
            <Button 
              key="resolve" 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                resolveError(selectedError.id);
                setSelectedError(null);
              }}
            >
              标记已解决
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedError && (
          <div className="space-y-4">
            <div>
              <Title level={5}>错误信息</Title>
              <Paragraph>
                <Text strong>消息:</Text> {selectedError.error.message}
              </Paragraph>
              <Paragraph>
                <Text strong>时间:</Text> {formatTimestamp(selectedError.timestamp)}
              </Paragraph>
              <Paragraph>
                <Text strong>级别:</Text> {getErrorLevelBadge(selectedError.context)}
              </Paragraph>
            </div>

            {selectedError.error.stack && (
              <div>
                <Title level={5}>堆栈跟踪</Title>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {selectedError.error.stack}
                </pre>
              </div>
            )}

            {selectedError.context?.componentStack && (
              <div>
                <Title level={5}>组件堆栈</Title>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {selectedError.context.componentStack}
                </pre>
              </div>
            )}

            <div>
              <Title level={5}>上下文信息</Title>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedError.context, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};