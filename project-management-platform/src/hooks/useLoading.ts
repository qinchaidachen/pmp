import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores';
import {
  setGlobalLoading,
  setModuleLoading,
  setOperationLoading,
  clearAllLoading,
  clearModuleLoading,
  clearOperationLoading,
  setLoadingMessage,
  selectGlobalLoading,
  selectModuleLoading,
  selectOperationLoading,
  selectAnyLoading,
  selectLoadingMessage,
} from '@/stores/slices/loadingSlice';

/**
 * 自定义Hook，用于管理加载状态
 */
export const useLoading = () => {
  const dispatch = useAppDispatch();
  
  // 选择器
  const globalLoading = useAppSelector(selectGlobalLoading);
  const anyLoading = useAppSelector(selectAnyLoading);
  const loadingMessage = useAppSelector(selectLoadingMessage);
  
  // 全局加载状态管理
  const setGlobal = useCallback((loading: boolean, message?: string) => {
    dispatch(setGlobalLoading({ loading, message }));
  }, [dispatch]);
  
  // 模块加载状态管理
  const setModule = useCallback((module: string, loading: boolean) => {
    dispatch(setModuleLoading({ module: module as any, loading }));
  }, [dispatch]);
  
  // 操作加载状态管理
  const setOperation = useCallback((operation: string, loading: boolean, message?: string) => {
    dispatch(setOperationLoading({ operation, loading }));
    if (message) {
      dispatch(setLoadingMessage(message));
    }
  }, [dispatch]);
  
  // 清除所有加载状态
  const clearAll = useCallback(() => {
    dispatch(clearAllLoading());
  }, [dispatch]);
  
  // 清除模块加载状态
  const clearModule = useCallback((module: string) => {
    dispatch(clearModuleLoading(module as any));
  }, [dispatch]);
  
  // 清除操作加载状态
  const clearOperation = useCallback((operation: string) => {
    dispatch(clearOperationLoading(operation));
  }, [dispatch]);
  
  // 设置加载消息
  const setMessage = useCallback((message: string | undefined) => {
    dispatch(setLoadingMessage(message));
  }, [dispatch]);
  
  // 获取模块加载状态的选择器
  const getModuleSelector = useCallback((module: string) => {
    return selectModuleLoading(module as any);
  }, []);
  
  // 获取操作加载状态的选择器
  const getOperationSelector = useCallback((operation: string) => {
    return selectOperationLoading(operation);
  }, []);
  
  return {
    // 状态
    globalLoading,
    anyLoading,
    loadingMessage,
    
    // 方法
    setGlobal,
    setModule,
    setOperation,
    clearAll,
    clearModule,
    clearOperation,
    setMessage,
    
    // 选择器工厂
    getModuleSelector,
    getOperationSelector,
  };
};

/**
 * 异步操作包装器，自动管理加载状态
 */
export const withLoading = async <T extends any[], R>(
  operation: string,
  asyncFn: (...args: T) => Promise<R>,
  setLoading: (loading: boolean, message?: string) => void,
  ...args: T
): Promise<R> => {
  try {
    setLoading(true, '处理中...');
    const result = await asyncFn(...args);
    return result;
  } finally {
    setLoading(false);
  }
};

/**
 * 包装异步函数，自动管理加载状态
 */
export const createAsyncAction = <T extends any[], R>(
  operation: string,
  asyncFn: (...args: T) => Promise<R>,
  setLoading: (loading: boolean, message?: string) => void
) => {
  return (...args: T): Promise<R> => {
    return withLoading(operation, asyncFn, setLoading, ...args);
  };
};