import { db } from './database';
import { Resource, ResourceBooking, ResourceType } from '../types';

class ResourceService {
  // 资源管理
  // 获取所有资源
  async getAll(): Promise<Resource[]> {
    return await db.resources.orderBy('name').toArray();
  }

  // 根据ID获取资源
  async getById(id: string): Promise<Resource | undefined> {
    return await db.resources.get(id);
  }

  // 根据类型获取资源
  async getByType(type: ResourceType): Promise<Resource[]> {
    return await db.resources.where('type').equals(type).toArray();
  }

  // 获取可用资源
  async getAvailable(): Promise<Resource[]> {
    return await db.resources.where('isAvailable').equals(true).toArray();
  }

  // 创建资源
  async create(resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    const resource: Resource = {
      ...resourceData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.resources.add(resource);
    return resource;
  }

  // 更新资源
  async update(id: string, updates: Partial<Resource>): Promise<Resource> {
    const existingResource = await db.resources.get(id);
    if (!existingResource) {
      throw new Error(`资源ID ${id} 不存在`);
    }

    const updatedResource = {
      ...existingResource,
      ...updates,
      updatedAt: new Date(),
    };

    await db.resources.put(updatedResource);
    return updatedResource;
  }

  // 删除资源
  async delete(id: string): Promise<void> {
    const resource = await db.resources.get(id);
    if (!resource) {
      throw new Error(`资源ID ${id} 不存在`);
    }

    // 检查是否有相关预定
    const relatedBookings = await db.resourceBookings.where('resourceId').equals(id).count();
    if (relatedBookings > 0) {
      throw new Error(`无法删除资源，该资源还有 ${relatedBookings} 个相关预定`);
    }

    await db.resources.delete(id);
  }

  // 资源预定管理
  // 获取所有预定
  async getBookings(resourceId?: string): Promise<ResourceBooking[]> {
    let query = db.resourceBookings.orderBy('startDate');
    
    if (resourceId) {
      query = query.filter(booking => booking.resourceId === resourceId);
    }

    return await query.toArray();
  }

  // 根据ID获取预定
  async getBookingById(id: string): Promise<ResourceBooking | undefined> {
    return await db.resourceBookings.get(id);
  }

  // 获取资源在指定时间段的预定
  async getResourceBookingsInRange(resourceId: string, startDate: Date, endDate: Date): Promise<ResourceBooking[]> {
    return await db.resourceBookings
      .where('[resourceId+startDate]')
      .between([resourceId, startDate], [resourceId, endDate])
      .toArray();
  }

  // 获取成员的预定
  async getMemberBookings(memberId: string): Promise<ResourceBooking[]> {
    return await db.resourceBookings.where('memberId').equals(memberId).toArray();
  }

  // 创建预定
  async createBooking(bookingData: Omit<ResourceBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResourceBooking> {
    // 检查时间冲突
    const conflicts = await this.checkBookingConflicts(
      bookingData.resourceId,
      bookingData.startDate,
      bookingData.endDate,
      bookingData.id
    );

    if (conflicts.length > 0) {
      throw new Error('预定时间与现有预定冲突');
    }

    const booking: ResourceBooking = {
      ...bookingData,
      id: this.generateBookingId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.resourceBookings.add(booking);
    return booking;
  }

  // 更新预定
  async updateBooking(id: string, updates: Partial<ResourceBooking>): Promise<ResourceBooking> {
    const existingBooking = await db.resourceBookings.get(id);
    if (!existingBooking) {
      throw new Error(`预定ID ${id} 不存在`);
    }

    const updatedBooking = {
      ...existingBooking,
      ...updates,
      updatedAt: new Date(),
    };

    // 如果更新时间或资源，检查冲突
    if (updates.startDate || updates.endDate || updates.resourceId) {
      const conflicts = await this.checkBookingConflicts(
        updatedBooking.resourceId,
        updatedBooking.startDate,
        updatedBooking.endDate,
        updatedBooking.id
      );

      if (conflicts.length > 0) {
        throw new Error('预定时间与现有预定冲突');
      }
    }

    await db.resourceBookings.put(updatedBooking);
    return updatedBooking;
  }

  // 删除预定
  async deleteBooking(id: string): Promise<void> {
    const booking = await db.resourceBookings.get(id);
    if (!booking) {
      throw new Error(`预定ID ${id} 不存在`);
    }

    await db.resourceBookings.delete(id);
  }

  // 检查预定冲突
  async checkBookingConflicts(
    resourceId: string, 
    startDate: Date, 
    endDate: Date, 
    excludeBookingId?: string
  ): Promise<ResourceBooking[]> {
    let query = db.resourceBookings
      .where('resourceId')
      .equals(resourceId)
      .filter(booking => {
        // 排除自己的预定（更新时）
        if (excludeBookingId && booking.id === excludeBookingId) {
          return false;
        }
        
        // 检查时间重叠
        return !(booking.endDate <= startDate || booking.startDate >= endDate);
      });

    return await query.toArray();
  }

  // 获取资源利用率统计
  async getResourceUtilization(resourceId: string, startDate: Date, endDate: Date) {
    const bookings = await this.getResourceBookingsInRange(resourceId, startDate, endDate);
    
    const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const bookedHours = bookings.reduce((sum, booking) => {
      const duration = (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const utilizationRate = totalHours > 0 ? bookedHours / totalHours : 0;

    return {
      totalHours,
      bookedHours,
      utilizationRate,
      bookingCount: bookings.length,
    };
  }

  // 获取预定统计信息
  async getBookingStats(startDate?: Date, endDate?: Date) {
    let query = db.resourceBookings.toCollection();
    
    if (startDate && endDate) {
      query = query.filter(booking => 
        booking.startDate >= startDate && booking.endDate <= endDate
      );
    }

    const bookings = await query.toArray();
    
    const total = bookings.length;
    const byStatus = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<ResourceBooking['status'], number>);

    const byResourceType = bookings.reduce((acc, booking) => {
      // 需要联表查询资源类型
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      byResourceType,
    };
  }

  // 搜索资源
  async searchResources(query: string): Promise<Resource[]> {
    const lowerQuery = query.toLowerCase();
    return await db.resources
      .filter(resource => 
        resource.name.toLowerCase().includes(lowerQuery) ||
        (resource.description && resource.description.toLowerCase().includes(lowerQuery)) ||
        (resource.location && resource.location.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  // 生成唯一ID
  private generateId(): string {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBookingId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const resourceService = new ResourceService();