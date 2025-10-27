import { ErrorContext } from '../hooks/useErrorHandler';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogConfig {
  maxEntries: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  filterLevels: ('error' | 'warn' | 'info' | 'debug')[];
}

class ErrorLogger {
  private config: LogConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      maxEntries: 1000,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      filterLevels: ['error', 'warn', 'info', 'debug'],
      ...config,
    };
    
    this.sessionId = this.generateSessionId();
    this.loadPersistedLogs();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPersistedLogs(): void {
    if (this.config.enableStorage) {
      try {
        const saved = localStorage.getItem('error-logs');
        if (saved) {
          const data = JSON.parse(saved);
          this.logs = (data.logs || []).map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
        }
      } catch (error) {
        console.warn('Failed to load persisted error logs:', error);
      }
    }
  }

  private persistLogs(): void {
    if (this.config.enableStorage) {
      try {
        const data = {
          logs: this.logs.slice(-this.config.maxEntries),
          lastUpdated: new Date().toISOString(),
          sessionId: this.sessionId,
        };
        localStorage.setItem('error-logs', JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to persist error logs:', error);
      }
    }
  }

  private shouldLog(level: string): boolean {
    return this.config.filterLevels.includes(level as any);
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    error?: Error,
    context?: ErrorContext,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      error,
      context,
      stack: error?.stack,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.sessionId,
      metadata,
    };

    return entry;
  }

  private outputLog(entry: LogEntry): void {
    // 控制台输出
    if (this.config.enableConsole) {
      const { level, message, error, context, timestamp } = entry;
      const formattedTime = timestamp.toISOString();
      
      switch (level) {
        case 'error':
          console.error(`[${formattedTime}] ERROR:`, message, error, context);
          break;
        case 'warn':
          console.warn(`[${formattedTime}] WARN:`, message, context);
          break;
        case 'info':
          console.info(`[${formattedTime}] INFO:`, message, context);
          break;
        case 'debug':
          console.debug(`[${formattedTime}] DEBUG:`, message, context);
          break;
      }
    }

    // 远程发送
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  // 公共方法
  public log(error: Error, context?: ErrorContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;

    const entry = this.createLogEntry('error', error.message, error, context, metadata);
    this.logs.push(entry);
    
    // 限制日志数量
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    this.outputLog(entry);
    this.persistLogs();
  }

  public warn(message: string, context?: ErrorContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;

    const entry = this.createLogEntry('warn', message, undefined, context, metadata);
    this.logs.push(entry);
    
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    this.outputLog(entry);
    this.persistLogs();
  }

  public info(message: string, context?: ErrorContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;

    const entry = this.createLogEntry('info', message, undefined, context, metadata);
    this.logs.push(entry);
    
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    this.outputLog(entry);
    this.persistLogs();
  }

  public debug(message: string, context?: ErrorContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;

    const entry = this.createLogEntry('debug', message, undefined, context, metadata);
    this.logs.push(entry);
    
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    this.outputLog(entry);
    this.persistLogs();
  }

  public getLogs(level?: LogEntry['level']): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  public getErrorLogs(): LogEntry[] {
    return this.getLogs('error');
  }

  public clearLogs(): void {
    this.logs = [];
    if (this.config.enableStorage) {
      localStorage.removeItem('error-logs');
    }
  }

  public exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  }

  public importLogs(logData: string): void {
    try {
      const data = JSON.parse(logData);
      if (data.logs && Array.isArray(data.logs)) {
        this.logs = data.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        this.persistLogs();
      }
    } catch (error) {
      throw new Error('Invalid log data format');
    }
  }

  public getStats(): {
    total: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    debugCount: number;
    sessionId: string;
  } {
    const stats = {
      total: this.logs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      warnCount: this.logs.filter(log => log.level === 'warn').length,
      infoCount: this.logs.filter(log => log.level === 'info').length,
      debugCount: this.logs.filter(log => log.level === 'debug').length,
      sessionId: this.sessionId,
    };

    return stats;
  }

  public updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建全局实例
export const errorLogger = new ErrorLogger({
  maxEntries: 1000,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  filterLevels: ['error', 'warn'],
});

// 便捷方法
export const logError = (error: Error, context?: ErrorContext, metadata?: Record<string, any>) => {
  errorLogger.log(error, context, metadata);
};

export const logWarn = (message: string, context?: ErrorContext, metadata?: Record<string, any>) => {
  errorLogger.warn(message, context, metadata);
};

export const logInfo = (message: string, context?: ErrorContext, metadata?: Record<string, any>) => {
  errorLogger.info(message, context, metadata);
};

export const logDebug = (message: string, context?: ErrorContext, metadata?: Record<string, any>) => {
  errorLogger.debug(message, context, metadata);
};