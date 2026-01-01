// File: frontend/src/hooks/useAuth.js
// Mục đích: Custom hook để sử dụng AuthContext dễ dàng hơn
// Thành viên 1 - Auth Hook

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook để truy cập AuthContext
 * @returns {Object} - Auth context value
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  // Kiểm tra hook có được dùng trong AuthProvider không
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }

  return context;
};

export default useAuth;