import React from 'react';
import ReactDOM from 'react-dom/client';
import DeveloperTaskBoardDemo from './examples/DeveloperTaskBoardDemo';

// 简单的测试页面
const TestApp: React.FC = () => {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: 0, 
      padding: 0,
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#001529', 
        color: 'white',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          🚀 Developer Task Board 集成测试
        </h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.8 }}>
          验证甘特图组件在项目管理平台中的集成效果
        </p>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <DeveloperTaskBoardDemo />
      </div>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fafafa', 
        borderTop: '1px solid #d9d9d9',
        marginTop: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>集成测试页面 | Developer Task Board v1.1.0</p>
      </div>
    </div>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<TestApp />);