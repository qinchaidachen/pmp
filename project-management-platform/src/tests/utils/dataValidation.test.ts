import { 
  validateMember,
  validateTask,
  validateProject,
  validateEmail,
  validateUrl,
  validateDateRange,
  sanitizeInput,
  validateFormData
} from '../../utils/dataValidation';
import { mockMembers, mockTasks, mockProjects } from '../mocks/data';

describe('DataValidation Utils', () => {
  describe('validateEmail', () => {
    it('应该验证正确的邮箱', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('应该拒绝无效的邮箱', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('应该验证正确的URL', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('应该拒绝无效的URL', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('应该验证有效的日期范围', () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-12-31');
      expect(validateDateRange(startDate, endDate)).toBe(true);
    });

    it('应该拒绝无效的日期范围', () => {
      const startDate = new Date('2025-12-31');
      const endDate = new Date('2025-10-01');
      expect(validateDateRange(startDate, endDate)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('应该清理输入内容', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello');
      expect(sanitizeInput('  test input  ')).toBe('test input');
    });
  });

  describe('validateFormData', () => {
    it('应该验证成员数据', () => {
      const result = validateFormData('member', mockMembers[0]);
      expect(result.isValid).toBe(true);
    });

    it('应该验证任务数据', () => {
      const result = validateFormData('task', mockTasks[0]);
      expect(result.isValid).toBe(true);
    });

    it('应该验证项目数据', () => {
      const result = validateFormData('project', mockProjects[0]);
      expect(result.isValid).toBe(true);
    });

    it('应该拒绝无效的表单数据', () => {
      const invalidData = { name: '', email: 'invalid-email' };
      const result = validateFormData('member', invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮箱格式不正确');
    });
  });
});