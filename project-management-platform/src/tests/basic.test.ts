describe('Basic Test', () => {
  it('应该通过基本测试', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该正确处理字符串', () => {
    expect('hello').toBe('hello');
  });

  it('应该正确处理数组', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});