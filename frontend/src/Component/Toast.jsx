import React, { useEffect } from 'react';

// Simple styles for the toast
const toastStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#333',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 9999,
  animation: 'slideIn 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: '200px'
};

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Disappear after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? '#EF4444' : '#10B981';

  return (
    <div style={{ ...toastStyle, backgroundColor: bgColor }}>
      <span>{type === 'error' ? '⚠️' : '✅'}</span>
      <span>{message}</span>
    </div>
  );
}