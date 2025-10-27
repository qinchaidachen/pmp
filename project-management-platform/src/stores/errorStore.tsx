import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ErrorLog, ErrorContext, type ErrorContextType } from '../hooks/useErrorHandler';
import { errorLogger } from '../utils/errorLogger';

interface ErrorState {
  errors: ErrorLog[];
  errorCount: number;
  unresolvedCount: number;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: { error: Error; context: ErrorContext } }
  | { type: 'REMOVE_ERROR'; payload: { id: string } }
  | { type: 'RESOLVE_ERROR'; payload: { id: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'LOAD_ERRORS'; payload: ErrorLog[] };

const initialState: ErrorState = {
  errors: [],
  errorCount: 0,
  unresolvedCount: 0,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const { error, context } = action.payload;
      const newError: ErrorLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        error,
        context,
        timestamp: new Date(),
        resolved: false,
      };

      const newErrors = [newError, ...state.errors].slice(0, 100);
      
      return {
        ...state,
        errors: newErrors,
        errorCount: state.errorCount + 1,
        unresolvedCount: state.unresolvedCount + 1,
      };
    }

    case 'REMOVE_ERROR': {
      const { id } = action.payload;
      const errorToRemove = state.errors.find(e => e.id === id);
      const newErrors = state.errors.filter(e => e.id !== id);
      
      return {
        ...state,
        errors: newErrors,
        unresolvedCount: errorToRemove?.resolved ? state.unresolvedCount : Math.max(0, state.unresolvedCount - 1),
      };
    }

    case 'RESOLVE_ERROR': {
      const { id } = action.payload;
      const newErrors = state.errors.map(e =>
        e.id === id ? { ...e, resolved: true } : e
      );
      
      return {
        ...state,
        errors: newErrors,
        unresolvedCount: Math.max(0, state.unresolvedCount - 1),
      };
    }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        unresolvedCount: 0,
      };

    case 'LOAD_ERRORS': {
      const errors = action.payload;
      const unresolvedCount = errors.filter(e => !e.resolved).length;
      
      return {
        ...state,
        errors,
        unresolvedCount,
        errorCount: errors.length,
      };
    }

    default:
      return state;
  }
}

interface ErrorContextValue extends ErrorState {
  addError: (error: Error, context?: ErrorContext) => void;
  removeError: (id: string) => void;
  resolveError: (id: string) => void;
  clearErrors: () => void;
  getErrorById: (id: string) => ErrorLog | undefined;
  exportErrors: () => string;
  importErrors: (errorLog: string) => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: Error, context: ErrorContext = {}) => {
    dispatch({ type: 'ADD_ERROR', payload: { error, context } });
    errorLogger.log(error, context);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('error-added', {
        detail: { error, context }
      }));
    }
  }, []);

  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { id } });
  }, []);

  const resolveError = useCallback((id: string) => {
    dispatch({ type: 'RESOLVE_ERROR', payload: { id } });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const getErrorById = useCallback((id: string) => {
    return state.errors.find(error => error.id === id);
  }, [state.errors]);

  const exportErrors = useCallback(() => {
    const exportData = {
      errors: state.errors,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(exportData, null, 2);
  }, [state.errors]);

  const importErrors = useCallback((errorLog: string) => {
    try {
      const data = JSON.parse(errorLog);
      if (data.errors && Array.isArray(data.errors)) {
        dispatch({ type: 'LOAD_ERRORS', payload: data.errors });
      }
    } catch (error) {
      console.error('Failed to import error log:', error);
    }
  }, []);

  useEffect(() => {
    const savedErrors = localStorage.getItem('error-logs');
    if (savedErrors) {
      try {
        const data = JSON.parse(savedErrors);
        if (data.errors && Array.isArray(data.errors)) {
          dispatch({ type: 'LOAD_ERRORS', payload: data.errors });
        }
      } catch (error) {
        console.error('Failed to load saved errors:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (state.errors.length > 0) {
      localStorage.setItem('error-logs', JSON.stringify({
        errors: state.errors,
        lastSaved: new Date().toISOString(),
      }));
    }
  }, [state.errors]);

  const value: ErrorContextValue = {
    ...state,
    addError,
    removeError,
    resolveError,
    clearErrors,
    getErrorById,
    exportErrors,
    importErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorStore = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorStore must be used within an ErrorProvider');
  }
  return context;
};