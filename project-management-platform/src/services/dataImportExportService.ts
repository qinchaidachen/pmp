import Papa from 'papaparse';
import { 
  Member, 
  Task, 
  Project, 
  Team, 
  Resource, 
  ResourceBooking, 
  ImportData, 
  ExportOptions,
  TaskStatus,
  TaskPriority,
  ResourceType
} from '../types';
import { DataValidator } from '../utils/dataValidation';
import { memberService } from './memberService';
import { taskService } from './taskService';
import { projectService } from './projectService';
import { teamService } from './teamService';
import { resourceService } from './resourceService';

export interface ImportResult {
  success: boolean;
  imported: {
    members: number;
    tasks: number;
    projects: number;
    teams: number;
    resources: number;
    resourceBookings: number;
  };
  errors: {
    type: 'validation' | 'processing';
    entity: string;
    row?: number;
    message: string;
  }[];
  warnings: string[];
}

export interface ExportResult {
  success: boolean;
  data: string;
  filename: string;
  mimeType: string;
}

class DataImportExportService {
  // 导入数据
  async importData(file: File, options: { skipErrors?: boolean } = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: {
        members: 0,
        tasks: 0,
        projects: 0,
        teams: 0,
        resources: 0,
        resourceBookings: 0,
      },
      errors: [],
      warnings: [],
    };

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'json') {
        const jsonData = await this.parseJsonFile(file);
        return await this.processImportData(jsonData, options);
      } else if (fileExtension === 'csv') {
        const csvData = await this.parseCsvFile(file);
        return await this.processImportData(csvData, options);
      } else {
        result.errors.push({
          type: 'processing',
          entity: 'file',
          message: '不支持的文件格式，请使用JSON或CSV文件',
        });
        return result;
      }
    } catch (error) {
      result.errors.push({
        type: 'processing',
        entity: 'file',
        message: `文件解析失败: ${error instanceof Error ? error.message : String(error)}`,
      });
      return result;
    }
  }

  // 解析JSON文件
  private async parseJsonFile(file: File): Promise<ImportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // 验证数据结构
          if (!this.validateImportDataStructure(data)) {
            reject(new Error('JSON文件结构不正确'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error instanceof Error ? error.message : String(error)}`));
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 解析CSV文件
  private async parseCsvFile(file: File): Promise<ImportData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = this.convertCsvToImportData(results.data as any[]);
            resolve(data);
          } catch (error) {
            reject(new Error(`CSV转换失败: ${error instanceof Error ? error.message : String(error)}`));
          }
        },
        error: (error) => {
          reject(new Error(`CSV解析失败: ${error.message}`));
        },
      });
    });
  }

  // 验证导入数据结构
  private validateImportDataStructure(data: any): boolean {
    const requiredFields = ['members', 'tasks', 'projects', 'teams'];
    
    for (const field of requiredFields) {
      if (!Array.isArray(data[field])) {
        return false;
      }
    }
    
    return true;
  }

  // 将CSV数据转换为导入数据格式
  private convertCsvToImportData(csvData: any[]): ImportData {
    const importData: ImportData = {
      members: [],
      tasks: [],
      projects: [],
      teams: [],
      resources: [],
      resourceBookings: [],
    };

    // 假设CSV包含所有实体的数据，用type字段区分
    csvData.forEach((row, index) => {
      try {
        switch (row.type?.toLowerCase()) {
          case 'member':
            importData.members.push(this.parseMemberFromCsv(row));
            break;
          case 'task':
            importData.tasks.push(this.parseTaskFromCsv(row));
            break;
          case 'project':
            importData.projects.push(this.parseProjectFromCsv(row));
            break;
          case 'team':
            importData.teams.push(this.parseTeamFromCsv(row));
            break;
          case 'resource':
            importData.resources?.push(this.parseResourceFromCsv(row));
            break;
          case 'booking':
            importData.resourceBookings?.push(this.parseBookingFromCsv(row));
            break;
        }
      } catch (error) {
        console.warn(`CSV第${index + 1}行解析失败:`, error);
      }
    });

    return importData;
  }

  // CSV解析辅助方法
  private parseMemberFromCsv(row: any): Omit<Member, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: row.name || row['姓名'] || '',
      role: row.role || row['角色'] || '',
      email: row.email || row['邮箱'] || undefined,
      teamId: row.teamId || row['团队ID'] || undefined,
      isActive: this.parseBoolean(row.isActive || row['是否活跃'] || 'true'),
    };
  }

  private parseTaskFromCsv(row: any): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: row.title || row['标题'] || '',
      description: row.description || row['描述'] || undefined,
      memberId: row.memberId || row['负责人ID'] || '',
      projectId: row.projectId || row['项目ID'] || undefined,
      teamId: row.teamId || row['团队ID'] || undefined,
      startDate: new Date(row.startDate || row['开始日期'] || Date.now()),
      endDate: new Date(row.endDate || row['结束日期'] || Date.now()),
      status: this.parseTaskStatus(row.status || row['状态'] || 'pending'),
      priority: this.parseTaskPriority(row.priority || row['优先级'] || 'medium'),
      storyPoints: this.parseNumber(row.storyPoints || row['故事点']),
      actualPersonDays: this.parseNumber(row.actualPersonDays || row['实际人天']),
      estimatedPersonDays: this.parseNumber(row.estimatedPersonDays || row['预估人天']),
      tags: this.parseArray(row.tags || row['标签']),
      completedAt: row.completedAt || row['完成时间'] ? new Date(row.completedAt || row['完成时间']) : undefined,
    };
  }

  private parseProjectFromCsv(row: any): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: row.name || row['名称'] || '',
      description: row.description || row['描述'] || undefined,
      startDate: new Date(row.startDate || row['开始日期'] || Date.now()),
      endDate: new Date(row.endDate || row['结束日期'] || Date.now()),
      status: this.parseProjectStatus(row.status || row['状态'] || 'planning'),
      taskIds: this.parseArray(row.taskIds || row['任务ID列表']),
      teamIds: this.parseArray(row.teamIds || row['团队ID列表']),
      businessLineId: row.businessLineId || row['业务线ID'] || undefined,
    };
  }

  private parseTeamFromCsv(row: any): Omit<Team, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: row.name || row['名称'] || '',
      description: row.description || row['描述'] || undefined,
      memberIds: this.parseArray(row.memberIds || row['成员ID列表']),
      projectIds: this.parseArray(row.projectIds || row['项目ID列表']),
      businessLineId: row.businessLineId || row['业务线ID'] || undefined,
    };
  }

  private parseResourceFromCsv(row: any): Omit<Resource, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: row.name || row['名称'] || '',
      type: this.parseResourceType(row.type || row['类型'] || 'other'),
      description: row.description || row['描述'] || undefined,
      location: row.location || row['位置'] || undefined,
      capacity: this.parseNumber(row.capacity || row['容量']),
      isAvailable: this.parseBoolean(row.isAvailable || row['是否可用'] || 'true'),
    };
  }

  private parseBookingFromCsv(row: any): Omit<ResourceBooking, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      resourceId: row.resourceId || row['资源ID'] || '',
      memberId: row.memberId || row['预定人ID'] || '',
      title: row.title || row['标题'] || '',
      description: row.description || row['描述'] || undefined,
      startDate: new Date(row.startDate || row['开始时间'] || Date.now()),
      endDate: new Date(row.endDate || row['结束时间'] || Date.now()),
      attendees: this.parseArray(row.attendees || row['参与者']),
      status: this.parseBookingStatus(row.status || row['状态'] || 'pending'),
    };
  }

  // 辅助解析方法
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'yes', '是'].includes(value.toLowerCase());
    }
    return Boolean(value);
  }

  private parseNumber(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  private parseArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }

  private parseTaskStatus(value: string): TaskStatus {
    const statusMap: { [key: string]: TaskStatus } = {
      'pending': TaskStatus.PENDING,
      'inprogress': TaskStatus.IN_PROGRESS,
      'in_progress': TaskStatus.IN_PROGRESS,
      'review': TaskStatus.REVIEW,
      'completed': TaskStatus.COMPLETED,
      'blocked': TaskStatus.BLOCKED,
    };
    return statusMap[value.toLowerCase()] || TaskStatus.PENDING;
  }

  private parseTaskPriority(value: string): TaskPriority {
    const priorityMap: { [key: string]: TaskPriority } = {
      'low': TaskPriority.LOW,
      'medium': TaskPriority.MEDIUM,
      'high': TaskPriority.HIGH,
      'urgent': TaskPriority.URGENT,
    };
    return priorityMap[value.toLowerCase()] || TaskPriority.MEDIUM;
  }

  private parseProjectStatus(value: string): Project['status'] {
    const statusMap: { [key: string]: Project['status'] } = {
      'planning': 'planning',
      'active': 'active',
      'onhold': 'onHold',
      'on_hold': 'onHold',
      'completed': 'completed',
      'cancelled': 'cancelled',
    };
    return statusMap[value.toLowerCase()] || 'planning';
  }

  private parseResourceType(value: string): ResourceType {
    const typeMap: { [key: string]: ResourceType } = {
      'meetingroom': ResourceType.MEETING_ROOM,
      'meeting_room': ResourceType.MEETING_ROOM,
      'testdevice': ResourceType.TEST_DEVICE,
      'test_device': ResourceType.TEST_DEVICE,
      'other': ResourceType.OTHER,
    };
    return typeMap[value.toLowerCase()] || ResourceType.OTHER;
  }

  private parseBookingStatus(value: string): ResourceBooking['status'] {
    const statusMap: { [key: string]: ResourceBooking['status'] } = {
      'confirmed': 'confirmed',
      'pending': 'pending',
      'cancelled': 'cancelled',
    };
    return statusMap[value.toLowerCase()] || 'pending';
  }

  // 处理导入数据
  private async processImportData(data: ImportData, options: { skipErrors?: boolean }): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: {
        members: 0,
        tasks: 0,
        projects: 0,
        teams: 0,
        resources: 0,
        resourceBookings: 0,
      },
      errors: [],
      warnings: [],
    };

    try {
      // 按依赖顺序导入数据
      await this.importInDependencyOrder(data, result, options);
      
      result.success = result.errors.length === 0 || options.skipErrors;
    } catch (error) {
      result.errors.push({
        type: 'processing',
        entity: 'system',
        message: `导入过程中发生错误: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return result;
  }

  // 按依赖顺序导入数据
  private async importInDependencyOrder(
    data: ImportData, 
    result: ImportResult, 
    options: { skipErrors?: boolean }
  ): Promise<void> {
    // 1. 导入业务线和角色（无依赖）
    // 2. 导入团队（无依赖）
    // 3. 导入成员（依赖团队）
    // 4. 导入项目（依赖团队）
    // 5. 导入任务（依赖成员、项目、团队）
    // 6. 导入资源（无依赖）
    // 7. 导入资源预定（依赖资源和成员）

    await this.importTeams(data.teams, result, options);
    await this.importMembers(data.members, result, options);
    await this.importProjects(data.projects, result, options);
    await this.importTasks(data.tasks, result, options);
    await this.importResources(data.resources || [], result, options);
    await this.importResourceBookings(data.resourceBookings || [], result, options);
  }

  // 导入团队
  private async importTeams(teams: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < teams.length; i++) {
      try {
        const validation = DataValidator.validateTeam(teams[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'team',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await teamService.create(validation.data);
        result.imported.teams++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'team',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导入成员
  private async importMembers(members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < members.length; i++) {
      try {
        const validation = DataValidator.validateMember(members[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'member',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await memberService.create(validation.data);
        result.imported.members++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'member',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导入项目
  private async importProjects(projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < projects.length; i++) {
      try {
        const validation = DataValidator.validateProject(projects[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'project',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await projectService.create(validation.data);
        result.imported.projects++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'project',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导入任务
  private async importTasks(tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < tasks.length; i++) {
      try {
        const validation = DataValidator.validateTask(tasks[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'task',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await taskService.create(validation.data);
        result.imported.tasks++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'task',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导入资源
  private async importResources(resources: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < resources.length; i++) {
      try {
        const validation = DataValidator.validateResource(resources[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'resource',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await resourceService.create(validation.data);
        result.imported.resources++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'resource',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导入资源预定
  private async importResourceBookings(bookings: Omit<ResourceBooking, 'id' | 'createdAt' | 'updatedAt'>[], result: ImportResult, options: { skipErrors?: boolean }): Promise<void> {
    for (let i = 0; i < bookings.length; i++) {
      try {
        const validation = DataValidator.validateResourceBooking(bookings[i]);
        if (!validation.success) {
          result.errors.push({
            type: 'validation',
            entity: 'booking',
            row: i + 1,
            message: validation.errors.join(', '),
          });
          if (!options.skipErrors) continue;
        }

        await resourceService.createBooking(validation.data);
        result.imported.resourceBookings++;
      } catch (error) {
        result.errors.push({
          type: 'processing',
          entity: 'booking',
          row: i + 1,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 导出数据
  async exportData(options: ExportOptions = { format: 'json', includeComputedData: false }): Promise<ExportResult> {
    try {
      // 获取所有数据
      const [members, tasks, projects, teams, resources, resourceBookings] = await Promise.all([
        memberService.getAll(),
        taskService.getAll(),
        projectService.getAll(),
        teamService.getAll(),
        resourceService.getAll(),
        resourceService.getBookings(),
      ]);

      const exportData: ImportData = {
        members,
        tasks,
        projects,
        teams,
        resources,
        resourceBookings,
      };

      if (options.format === 'json') {
        return this.exportAsJson(exportData, options);
      } else {
        return this.exportAsCsv(exportData, options);
      }
    } catch (error) {
      throw new Error(`导出失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 导出为JSON
  private exportAsJson(data: ImportData, options: ExportOptions): ExportResult {
    const jsonData = JSON.stringify(data, null, 2);
    const filename = `project_data_${new Date().toISOString().split('T')[0]}.json`;
    
    return {
      success: true,
      data: jsonData,
      filename,
      mimeType: 'application/json',
    };
  }

  // 导出为CSV（合并所有实体到一个CSV）
  private exportAsCsv(data: ImportData, options: ExportOptions): ExportResult {
    const csvRows: string[] = [];
    
    // 添加CSV头部
    csvRows.push('type,name,description,startDate,endDate,status,priority,storyPoints,memberId,projectId,teamId,role,email,location,capacity,isAvailable,attendees,tags');
    
    // 导出成员
    data.members.forEach(member => {
      csvRows.push([
        'member',
        member.name,
        member.description || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        member.role,
        member.email || '',
        '',
        '',
        member.isActive,
        '',
        ''
      ].join(','));
    });

    // 导出任务
    data.tasks.forEach(task => {
      csvRows.push([
        'task',
        task.title,
        task.description || '',
        task.startDate.toISOString().split('T')[0],
        task.endDate.toISOString().split('T')[0],
        task.status,
        task.priority || '',
        task.storyPoints || '',
        task.memberId,
        task.projectId || '',
        task.teamId || '',
        '',
        '',
        '',
        '',
        '',
        '',
        (task.tags || []).join(';')
      ].join(','));
    });

    // 导出项目
    data.projects.forEach(project => {
      csvRows.push([
        'project',
        project.name,
        project.description || '',
        project.startDate.toISOString().split('T')[0],
        project.endDate.toISOString().split('T')[0],
        project.status,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ].join(','));
    });

    // 导出团队
    data.teams.forEach(team => {
      csvRows.push([
        'team',
        team.name,
        team.description || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ].join(','));
    });

    // 导出资源
    data.resources.forEach(resource => {
      csvRows.push([
        'resource',
        resource.name,
        resource.description || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        resource.location || '',
        resource.capacity || '',
        resource.isAvailable,
        '',
        ''
      ].join(','));
    });

    // 导出资源预定
    data.resourceBookings.forEach(booking => {
      csvRows.push([
        'booking',
        booking.title,
        booking.description || '',
        booking.startDate.toISOString(),
        booking.endDate.toISOString(),
        booking.status,
        '',
        '',
        booking.memberId,
        '',
        booking.resourceId,
        '',
        '',
        '',
        '',
        '',
        (booking.attendees || []).join(';'),
        ''
      ].join(','));
    });

    const csvData = csvRows.join('\n');
    const filename = `project_data_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
      success: true,
      data: csvData,
      filename,
      mimeType: 'text/csv',
    };
  }

  // 生成导入模板
  generateImportTemplate(format: 'json' | 'csv'): { data: string; filename: string; mimeType: string } {
    const template: ImportData = {
      members: [
        {
          name: '示例成员',
          role: '前端工程师',
          email: 'example@example.com',
          isActive: true,
        } as Omit<Member, 'id' | 'createdAt' | 'updatedAt'>,
      ],
      tasks: [
        {
          title: '示例任务',
          description: '这是一个示例任务',
          memberId: 'member_id_here',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          storyPoints: 3,
          estimatedPersonDays: 2,
        } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
      ],
      projects: [
        {
          name: '示例项目',
          description: '这是一个示例项目',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'planning' as const,
          taskIds: [],
          teamIds: [],
        } as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
      ],
      teams: [
        {
          name: '示例团队',
          description: '这是一个示例团队',
          memberIds: [],
          projectIds: [],
        } as Omit<Team, 'id' | 'createdAt' | 'updatedAt'>,
      ],
      resources: [],
      resourceBookings: [],
    };

    if (format === 'json') {
      return {
        data: JSON.stringify(template, null, 2),
        filename: 'import_template.json',
        mimeType: 'application/json',
      };
    } else {
      // 生成CSV模板
      const csvRows = [
        'type,name,description,startDate,endDate,status,priority,storyPoints,memberId,projectId,teamId,role,email,location,capacity,isAvailable,attendees,tags',
        'member,示例成员,,,"","","","","","","","前端工程师,example@example.com,""",true,""",""',
        'task,示例任务,这是一个示例任务,2024-01-01,2024-01-08,pending,medium,3,member_id_here,project_id_here,team_id_here,"","","","","""",""',
        'project,示例项目,这是一个示例项目,2024-01-01,2024-01-31,planning,"","","","","","","","","","","""",""',
        'team,示例团队,这是一个示例团队,"","","","","","","","","","","","","","""",""',
      ];
      
      return {
        data: csvRows.join('\n'),
        filename: 'import_template.csv',
        mimeType: 'text/csv',
      };
    }
  }

  // 下载文件
  downloadFile(result: ExportResult): void {
    const blob = new Blob([result.data], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dataImportExportService = new DataImportExportService();