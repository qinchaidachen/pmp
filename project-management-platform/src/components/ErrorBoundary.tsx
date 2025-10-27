import React, { createContext, useContext } from 'react';

const searilizeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

// 简单的错误上下文
const ErrorContext = createContext<{
  handleError: (error: any) => void;
}>({
  handleError: (error) => console.error(error),
});

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleError = (error: any) => {
    console.error('Error caught by ErrorProvider:', error);
  };

  return (
    <ErrorContext.Provider value={{ handleError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorHandlerHook = () => {
  return useContext(ErrorContext);
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded">
          <h2 className="text-red-500">Something went wrong.</h2>
          <pre className="mt-2 text-sm">{searilizeError(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}