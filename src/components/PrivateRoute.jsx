import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('adtoken');
// Kiểm tra token trong localStorage
  if (!token) {
    sessionStorage.setItem('loginMessage', 'Vui lòng đăng nhập để tiếp tục'); // Lưu thông báo
    return <Navigate to="/" />;
  }
  // Nếu có token, hiển thị nội dung trang
  return children;
};

export default PrivateRoute;
