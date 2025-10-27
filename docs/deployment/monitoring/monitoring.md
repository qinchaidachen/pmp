# 监控配置指南

## 概述

本文档详细介绍了项目管理平台的监控配置方案，包括系统监控、应用监控、日志监控、告警配置等内容，帮助运维团队及时发现和解决系统问题。

## 监控架构

```
监控架构
├── 数据收集层
│   ├── Prometheus (指标收集)
│   ├── Fluentd/Fluent Bit (日志收集)
│   ├── Jaeger (链路追踪)
│   └── Node Exporter (系统指标)
├── 数据存储层
│   ├── Prometheus (时序数据库)
│   ├── Elasticsearch (日志存储)
│   └── Jaeger (链路数据存储)
├── 可视化层
│   ├── Grafana (指标可视化)
│   └── Kibana (日志可视化)
└── 告警层
    ├── AlertManager (告警管理)
    └── 通知渠道 (邮件/Slack/钉钉)
```

## 核心监控指标

### 1. 系统指标

#### 服务器资源监控

```yaml
# prometheus/system-rules.yml
groups:
  - name: system.rules
    rules:
      # CPU使用率告警
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高CPU使用率检测到"
          description: "实例 {{ $labels.instance }} CPU使用率超过80%"

      # 内存使用率告警
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高内存使用率检测到"
          description: "实例 {{ $labels.instance }} 内存使用率超过85%"

      # 磁盘空间告警
      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "磁盘空间不足"
          description: "实例 {{ $labels.instance }} 根分区可用空间少于10%"

      # 服务离线告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务离线"
          description: "服务 {{ $labels.job }} 在实例 {{ $labels.instance }} 上已离线"
```

#### 网络监控

```yaml
# prometheus/network-rules.yml
groups:
  - name: network.rules
    rules:
      # 网络延迟告警
      - alert: HighNetworkLatency
        expr: avg(rate(node_network_receive_bytes_total[5m])) > 100000000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "网络延迟过高"
          description: "实例 {{ $labels.instance }} 网络接收速率过高"

      # 连接数告警
      - alert: HighConnectionCount
        expr: node_netstat_Tcp_CurrEstab > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "连接数过高"
          description: "实例 {{ $labels.instance }} 当前建立连接数超过1000"
```

### 2. 应用指标

#### HTTP服务监控

```yaml
# prometheus/app-rules.yml
groups:
  - name: app.rules
    rules:
      # HTTP错误率告警
      - alert: HighHTTPErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "HTTP错误率过高"
          description: "应用 {{ $labels.instance }} HTTP 5xx错误率超过5%"

      # 响应时间告警
      - alert: HighHTTPResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "HTTP响应时间过长"
          description: "应用 {{ $labels.instance }} 95%请求响应时间超过1秒"

      # 请求量异常告警
      - alert: LowRequestRate
        expr: rate(http_requests_total[5m]) < 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "请求量过低"
          description: "应用 {{ $labels.instance }} 请求量异常低"
```

#### 业务指标监控

```typescript
// src/middleware/businessMetrics.ts
import { Counter, Histogram, Gauge } from 'prom-client'

// 业务指标
export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
})

export const projectCreations = new Counter({
  name: 'project_creations_total',
  help: 'Total number of projects created',
  labelNames: ['user_type'],
})

export const projectCreationDuration = new Histogram({
  name: 'project_creation_duration_seconds',
  help: 'Time spent creating projects',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
})

export const loginAttempts = new Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['result'], // 'success' or 'failure'
})

// 业务监控中间件
export function businessMetricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now()
  
  // 记录请求
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    
    // 记录API调用指标
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    })
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
      },
      duration
    )
    
    // 特殊业务指标
    if (req.path === '/api/projects' && req.method === 'POST') {
      projectCreations.inc({ user_type: req.user?.type || 'unknown' })
      projectCreationDuration.observe(duration)
    }
    
    if (req.path === '/api/auth/login') {
      loginAttempts.inc({ result: res.statusCode === 200 ? 'success' : 'failure' })
    }
  })
  
  next()
}
```

### 3. 数据库监控

#### PostgreSQL监控

```yaml
# prometheus/postgres-rules.yml
groups:
  - name: postgres.rules
    rules:
      # 数据库连接数告警
      - alert: PostgreSQLTooManyConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL连接数过多"
          description: "数据库 {{ $labels.datname }} 连接数使用率超过80%"

      # 慢查询告警
      - alert: PostgreSQLSlowQueries
        expr: rate(pg_stat_database_blk_read_time[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL慢查询检测到"
          description: "数据库 {{ $labels.datname }} 存在慢查询"

      # 数据库大小告警
      - alert: PostgreSQLDatabaseSize
        expr: pg_database_size_bytes > 10737418240  # 10GB
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL数据库过大"
          description: "数据库 {{ $labels.datname }} 大小超过10GB"
```

#### Redis监控

```yaml
# prometheus/redis-rules.yml
groups:
  - name: redis.rules
    rules:
      # Redis内存使用率告警
      - alert: RedisHighMemoryUsage
        expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis内存使用率过高"
          description: "Redis实例内存使用率超过80%"

      # Redis连接数告警
      - alert: RedisHighConnections
        expr: redis_connected_clients > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis连接数过多"
          description: "Redis连接数超过1000"

      # Redis键过期率告警
      - alert: RedisHighEvictionRate
        expr: rate(redis_evicted_keys_total[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis键过期率过高"
          description: "Redis键过期率过高，可能存在内存压力"
```

## 告警配置

### 1. AlertManager配置

```yaml
# alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourcompany.com'
  smtp_auth_username: 'alerts@yourcompany.com'
  smtp_auth_password: 'your-app-password'

# 告警路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

# 告警接收器配置
receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'

  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@yourcompany.com'
        subject: '【严重告警】{{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          告警名称: {{ .Annotations.summary }}
          告警详情: {{ .Annotations.description }}
          告警时间: {{ .StartsAt }}
          告警级别: {{ .Labels.severity }}
          {{ end }}
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-critical'
        title: '严重告警'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'warning-alerts'
    email_configs:
      - to: 'team@yourcompany.com'
        subject: '【警告】{{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          告警名称: {{ .Annotations.summary }}
          告警详情: {{ .Annotations.description }}
          告警时间: {{ .StartsAt }}
          {{ end }}
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-warning'
        title: '警告告警'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

# 告警抑制规则
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

### 2. 告警规则模板

```yaml
# prometheus/templates.yml
groups:
  - name: custom.templates
    rules:
      # 自定义告警模板
      - alert: CustomAlert
        expr: custom_metric > threshold
        for: 5m
        labels:
          severity: "{{ .CommonLabels.severity }}"
          team: "{{ .CommonLabels.team }}"
          service: "{{ .CommonLabels.service }}"
        annotations:
          summary: "{{ .CommonLabels.alertname }} 检测到"
          description: "{{ .CommonLabels.service }} 服务 {{ .Labels.instance }} 发生问题"
          runbook_url: "https://wiki.company.com/runbooks/{{ .CommonLabels.alertname }}"
          dashboard_url: "https://grafana.company.com/d/your-dashboard"
```

## 日志监控

### 1. ELK Stack配置

#### Elasticsearch配置

```yaml
# elasticsearch/elasticsearch.yml
cluster.name: project-management
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
xpack.security.enabled: false
xpack.monitoring.collection.enabled: true
```

#### Logstash配置

```ruby
# logstash/logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  # 解析应用日志
  if [fields][service] == "project-management" {
    grok {
      match => { 
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:logger} %{GREEDYDATA:message}" 
      }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    # 提取用户ID
    if [message] =~ /user_id=(\w+)/ {
      grok {
        match => { "message" => "user_id=(?<user_id>\w+)" }
      }
    }
    
    # 提取API路径
    if [fields][request_path] {
      mutate {
        add_field => { "api_path" => "%{fields.request_path}" }
      }
    }
  }
  
  # 解析Nginx日志
  if [fields][log_type] == "nginx" {
    grok {
      match => { 
        "message" => "%{NGINXACCESS}" 
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "project-management-%{+YYYY.MM.dd}"
  }
  
  # 错误日志单独输出
  if [level] == "ERROR" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "project-management-errors-%{+YYYY.MM.dd}"
    }
  }
}
```

#### Kibana配置

```json
{
  "version": "7.10.0",
  "objects": [
    {
      "attributes": {
        "title": "Project Management Dashboard",
        "type": "dashboard",
        "hits": 0,
        "description": "项目管理平台监控仪表板",
        "panelsJSON": "[...]",
        "version": 1
      }
    }
  ]
}
```

### 2. 日志分析规则

```yaml
# logstash/rules/application.yml
rules:
  # 错误日志检测
  - name: "Error Detection"
    condition: "level == ERROR"
    actions:
      - type: "alert"
        channel: "errors"
        template: "error_alert"
  
  # 性能异常检测
  - name: "Performance Anomaly"
    condition: "response_time > 5000"
    actions:
      - type: "alert"
        channel: "performance"
        template: "performance_alert"
  
  # 安全事件检测
  - name: "Security Event"
    condition: "message =~ /(?i)(unauthorized|forbidden|attack|injection)/"
    actions:
      - type: "alert"
        channel: "security"
        template: "security_alert"
```

## 链路追踪

### 1. Jaeger配置

```yaml
# jaeger/jaeger.yml
version: '3.8'

services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
      - "14268:14268"  # HTTP collector
      - "14250:14250"  # gRPC collector
    environment:
      COLLECTOR_OTLP_ENABLED: true
      SPAN_STORAGE_TYPE: elasticsearch
      ES_SERVER_URLS: http://elasticsearch:9200
      ES_NUM_SHARDS: 1
      ES_NUM_REPLICAS: 0
    depends_on:
      - elasticsearch
```

### 2. 链路追踪集成

```typescript
// src/utils/tracing.ts
import { init, trace } from '@opentelemetry/api'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'

export function initializeTracing() {
  const jaegerExporter = new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces',
  })

  init({
    traceExporter: jaegerExporter,
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'project-management',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
    spanProcessor: new SimpleSpanProcessor(jaegerExporter),
    instrumentations: [
      new ExpressInstrumentation(),
      new HttpInstrumentation(),
    ],
  })
}

// 手动创建span
export function createSpan(name: string, fn: (span: any) => Promise<any>) {
  const tracer = trace.getTracer('project-management')
  
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span)
      span.setStatus({ code: 1 }) // Status.OK
      return result
    } catch (error) {
      span.setStatus({ code: 2, message: error.message }) // Status.ERROR
      span.recordException(error)
      throw error
    } finally {
      span.end()
    }
  })
}
```

## 监控仪表板

### 1. Grafana仪表板配置

```json
{
  "dashboard": {
    "id": null,
    "title": "项目管理平台监控",
    "tags": ["project-management", "monitoring"],
    "timezone": "Asia/Shanghai",
    "panels": [
      {
        "id": 1,
        "title": "系统概览",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"project-management\"}",
            "legendFormat": "服务状态"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "请求量",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95%分位数"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50%分位数"
          }
        ],
        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8}
      }
    ]
  }
}
```

### 2. 关键指标面板

```yaml
# grafana/dashboards/system-overview.yml
dashboard:
  title: "系统概览"
  panels:
    - title: "服务状态"
      type: "stat"
      targets:
        - expr: "up{job=\"project-management\"}"
          legendFormat: "{{instance}}"
      
    - title: "CPU使用率"
      type: "graph"
      targets:
        - expr: "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
          legendFormat: "{{instance}}"
      
    - title: "内存使用率"
      type: "graph"
      targets:
        - expr: "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100"
          legendFormat: "{{instance}}"
      
    - title: "磁盘使用率"
      type: "graph"
      targets:
        - expr: "(node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100"
          legendFormat: "{{instance}} {{mountpoint}}"
```

## 告警策略

### 1. 告警分级

#### P0 - 紧急告警
- 服务完全不可用
- 数据库连接失败
- 大量用户无法访问系统

#### P1 - 高优先级告警
- 响应时间超过阈值
- 错误率超过阈值
- 资源使用率过高

#### P2 - 中优先级告警
- 单个功能异常
- 性能轻微下降
- 容量接近上限

#### P3 - 低优先级告警
- 警告性指标
- 预防性维护
- 非关键告警

### 2. 告警通知策略

```yaml
# alertmanager/notification-rules.yml
rules:
  # 紧急告警 - 立即通知
  - name: "critical-alerts"
    condition: "severity == 'critical'"
    channels:
      - type: "sms"
        recipients: ["+1234567890", "+0987654321"]
      - type: "call"
        recipients: ["+1234567890"]
      - type: "email"
        recipients: ["admin@company.com"]
      - type: "slack"
        channel: "#alerts-critical"
    
  # 高优先级告警 - 5分钟内通知
  - name: "high-priority-alerts"
    condition: "severity == 'warning'"
    delay: "5m"
    channels:
      - type: "email"
        recipients: ["team@company.com"]
      - type: "slack"
        channel: "#alerts-warning"
    
  # 中优先级告警 - 30分钟内汇总
  - name: "medium-priority-alerts"
    condition: "severity == 'info'"
    delay: "30m"
    group: true
    channels:
      - type: "email"
        recipients: ["monitoring@company.com"]
```

## 监控最佳实践

### 1. 监控设计原则

1. **可观测性三要素**
   - 指标（Metrics）
   - 日志（Logs）
   - 链路追踪（Traces）

2. **黄金信号**
   - 延迟（Latency）
   - 流量（Traffic）
   - 错误（Errors）
   - 饱和度（Saturation）

3. **监控覆盖**
   - 基础设施层
   - 应用层
   - 业务层

### 2. 告警最佳实践

1. **告警质量**
   - 避免误报
   - 及时告警
   - 准确描述

2. **告警收敛**
   - 告警聚合
   - 告警抑制
   - 告警升级

3. **值班制度**
   - 明确责任
   - 响应流程
   - 升级机制

### 3. 监控运维

1. **数据保留**
   - 短期高频数据：15天
   - 中期中频数据：90天
   - 长期低频数据：1年

2. **性能优化**
   - 采样策略
   - 数据压缩
   - 存储优化

3. **成本控制**
   - 监控资源预算
   - 告警成本优化
   - 存储成本管理

## 故障响应流程

### 1. 故障检测
- 自动化监控检测
- 告警触发
- 初步评估

### 2. 故障响应
- 值班人员接收告警
- 快速诊断
- 应急处理

### 3. 故障恢复
- 问题修复
- 服务恢复
- 验证确认

### 4. 事后分析
- 故障复盘
- 根因分析
- 改进措施

## 监控工具推荐

### 1. 开源方案
- **Prometheus + Grafana**: 指标监控和可视化
- **ELK Stack**: 日志收集和分析
- **Jaeger**: 链路追踪
- **AlertManager**: 告警管理

### 2. 商业方案
- **DataDog**: 全栈监控
- **New Relic**: 应用性能监控
- **Splunk**: 日志分析
- **PagerDuty**: 事件响应

### 3. 云原生方案
- **AWS CloudWatch**: AWS原生监控
- **Azure Monitor**: Azure原生监控
- **Google Cloud Monitoring**: GCP原生监控

## 总结

完善的监控体系是保障系统稳定运行的重要基础。通过合理的监控配置、及时的告警响应和有效的故障处理，可以最大程度地减少系统故障对业务的影响，提升用户体验和系统可靠性。