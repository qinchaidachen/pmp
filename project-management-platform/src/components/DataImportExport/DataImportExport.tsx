import React, { useState, useRef } from 'react';
import { 
  Card, 
  Button, 
  Upload, 
  Modal, 
  Progress, 
  Alert, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Divider,
  message,
  Tooltip
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  FileExcelOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { dataImportExportService, ImportResult } from '../../services/dataImportExportService';
import { ExportOptions } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface DataImportExportProps {
  onImportComplete?: (result: ImportResult) => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({ onImportComplete }) => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件导入
  const handleFileImport = async (file: File) => {
    setImporting(true);
    setUploadProgress(0);
    setImportResult(null);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await dataImportExportService.importData(file, { skipErrors: true });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportResult(result);

      if (onImportComplete) {
        onImportComplete(result);
      }

      if (result.success) {
        message.success('数据导入成功！');
      } else {
        message.warning('数据导入完成，但存在一些错误');
      }
    } catch (error) {
      message.error(`导入失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setImporting(false);
    }
  };

  // 处理数据导出
  const handleDataExport = async (options: ExportOptions) => {
    try {
      const result = await dataImportExportService.exportData(options);
      if (result.success) {
        dataImportExportService.downloadFile(result);
        message.success('数据导出成功！');
        setExportModalVisible(false);
      }
    } catch (error) {
      message.error(`导出失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 下载导入模板
  const downloadTemplate = (format: 'json' | 'csv') => {
    const template = dataImportExportService.generateImportTemplate(format);
    const blob = new Blob([template.data], { type: template.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = template.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json,.csv',
    beforeUpload: (file) => {
      const isValidFormat = ['application/json', 'text/csv', 'text/plain'].includes(file.type) ||
                           file.name.endsWith('.json') || 
                           file.name.endsWith('.csv');
      
      if (!isValidFormat) {
        message.error('只能上传 JSON 或 CSV 文件！');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }

      handleFileImport(file);
      return false; // 阻止自动上传
    },
    showUploadList: false,
  };

  // 渲染导入结果表格
  const renderImportResultTable = () => {
    if (!importResult) return null;

    const columns = [
      {
        title: '数据类型',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color="blue">
            {type === 'member' && '成员'}
            {type === 'task' && '任务'}
            {type === 'project' && '项目'}
            {type === 'team' && '团队'}
            {type === 'resource' && '资源'}
            {type === 'booking' && '预定'}
          </Tag>
        ),
      },
      {
        title: '行号',
        dataIndex: 'row',
        key: 'row',
        render: (row: number) => row || '-',
      },
      {
        title: '错误信息',
        dataIndex: 'message',
        key: 'message',
        ellipsis: true,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={importResult.errors}
        rowKey={(record, index) => `${record.type}-${index}`}
        size="small"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: '没有错误信息' }}
      />
    );
  };

  return (
    <div className="data-import-export">
      <Card title="数据管理" className="mb-4">
        <Space size="large" wrap>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            onClick={() => setImportModalVisible(true)}
          >
            导入数据
          </Button>
          
          <Button
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => setExportModalVisible(true)}
          >
            导出数据
          </Button>
        </Space>
      </Card>

      {/* 导入数据模态框 */}
      <Modal
        title="导入数据"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setImportResult(null);
          setUploadProgress(0);
        }}
        footer={null}
        width={800}
      >
        <div className="import-content">
          <Alert
            message="数据导入说明"
            description={
              <div>
                <Paragraph>
                  • 支持 JSON 和 CSV 格式的文件<br/>
                  • 文件大小不能超过 10MB<br/>
                  • 建议先下载模板文件，按照模板格式准备数据<br/>
                  • 导入过程中会自动验证数据格式和完整性
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />

          <Space className="mb-4">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => downloadTemplate('json')}
            >
              下载 JSON 模板
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => downloadTemplate('csv')}
            >
              下载 CSV 模板
            </Button>
          </Space>

          <Divider />

          {importing ? (
            <div className="text-center">
              <Progress
                type="circle"
                percent={uploadProgress}
                status={uploadProgress === 100 ? 'success' : 'active'}
                className="mb-4"
              />
              <div>正在导入数据，请稍候...</div>
            </div>
          ) : (
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 JSON 和 CSV 格式，单个文件不超过 10MB
              </p>
            </Dragger>
          )}

          {importResult && (
            <div className="import-result">
              <Divider />
              
              <Alert
                message={`导入完成: ${importResult.success ? '成功' : '部分成功'}`}
                description={
                  <div>
                    <div className="mb-2">
                      <Text strong>导入统计:</Text>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>成员: {importResult.imported.members}</div>
                      <div>任务: {importResult.imported.tasks}</div>
                      <div>项目: {importResult.imported.projects}</div>
                      <div>团队: {importResult.imported.teams}</div>
                      <div>资源: {importResult.imported.resources}</div>
                      <div>预定: {importResult.imported.resourceBookings}</div>
                    </div>
                  </div>
                }
                type={importResult.success ? 'success' : 'warning'}
                showIcon
                className="mb-4"
              />

              {importResult.errors.length > 0 && (
                <div>
                  <Title level={5}>错误详情 ({importResult.errors.length})</Title>
                  {renderImportResultTable()}
                </div>
              )}

              {importResult.warnings.length > 0 && (
                <Alert
                  message="警告信息"
                  description={
                    <ul className="mb-0">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* 导出数据模态框 */}
      <Modal
        title="导出数据"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="export-content">
          <Alert
            message="数据导出说明"
            description={
              <div>
                <Paragraph>
                  • 导出的数据包含当前数据库中的所有记录<br/>
                  • JSON 格式包含完整的数据结构<br/>
                  • CSV 格式将所有实体合并到一个文件中<br/>
                  • 导出的文件可以用于数据备份或迁移
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />

          <div className="export-options">
            <Title level={5}>选择导出格式</Title>
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card 
                size="small" 
                hoverable
                onClick={() => handleDataExport({ format: 'json', includeComputedData: false })}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <FileTextOutlined className="mr-2 text-blue-500" />
                      <Text strong>JSON 格式</Text>
                    </div>
                    <Text type="secondary" className="text-sm">
                      完整的结构化数据，适合程序处理
                    </Text>
                  </div>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    导出 JSON
                  </Button>
                </div>
              </Card>

              <Card 
                size="small" 
                hoverable
                onClick={() => handleDataExport({ format: 'csv', includeComputedData: false })}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <FileExcelOutlined className="mr-2 text-green-500" />
                      <Text strong>CSV 格式</Text>
                    </div>
                    <Text type="secondary" className="text-sm">
                      表格化数据，适合 Excel 等工具打开
                    </Text>
                  </div>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    导出 CSV
                  </Button>
                </div>
              </Card>
            </Space>
          </div>

          <Divider />

          <div className="export-templates">
            <Title level={5}>下载导入模板</Title>
            <Space>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => downloadTemplate('json')}
              >
                JSON 模板
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => downloadTemplate('csv')}
              >
                CSV 模板
              </Button>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataImportExport;