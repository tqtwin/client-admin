import React, { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaSearch, FaPhone } from 'react-icons/fa';
import { getOrders, getOrderById } from '../api/orderApi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages/menu.css'

function Menu() {
  const user = JSON.parse(sessionStorage.getItem('admin') || '{}');
  const navigate = useNavigate();
  const [isBlurred, setIsBlurred] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState();
  const handleLogout = () => {
    sessionStorage.removeItem('adtoken');
    sessionStorage.removeItem('admin');
    navigate('/admin/login');
    setIsBlurred(false);
  };
  const isTokenExpired = (token) => {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã phần payload của token
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (Unix timestamp)

    return payload.exp < currentTime; // Trả về true nếu token đã hết hạn
  };

  useEffect(() => {
    const token = sessionStorage.getItem('adtoken');
    if (!token || isTokenExpired(token)) {
      setIsBlurred(true);

      toast.warn(
        <div style={{ textAlign: 'center' }}>
          <p>Phiên đăng nhập của bạn đã hết hạn.</p>
          <p>Bạn sẽ được tự động đăng xuất sau 3 giây.</p>
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,  // Thời gian tự động đóng toast (3 giây)
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        }
      );

      // Tự động logout sau 3 giây
      setTimeout(() => {
        handleLogout();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/v1/orders', {
          params: { status: 'Pending' },
        });
        if (response.data.total !== undefined) {
          setPendingOrdersCount(response.data.total);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    fetchPendingOrders();
  }, []);

  return (
    <div>
      <header className="app-header">
        <a className="app-sidebar__toggle" href="#" data-toggle="sidebar" aria-label="Hide Sidebar" />
        <ul className="app-nav">
          <li>
            <a className="app-nav__item-bell" href="/admin/orders">
              <i className={`bx bx-bell `} />
              {pendingOrdersCount !== null && (
                <span className="notification-badge">{pendingOrdersCount}</span>
              )}
            </a>
          </li>

          <li>
            <a className="app-nav__item" href="#" onClick={handleLogout}>
              <i className="bx bx-log-out bx-rotate-180" />
            </a>
          </li>
        </ul>
      </header>
      <div className="app-sidebar__overlay" data-toggle="sidebar" />
      <aside className="app-sidebar">
        <div className="app-sidebar__user">
          <img className="app-sidebar__user-avatar" src={user.avatar} width="50px" alt="User Image" />
          <div>
            <p className="app-sidebar__user-name"><b>{user.name || 'Guest'}</b></p>
            {user.role === "admin" ? "Admin" : user.role === "employee" ? "nhân viên" : user.role === "warehouse" ? "Nhân viên kho" : ""}
          </div>
        </div>
        <hr />
        <ul className="app-menu">
          {/* <li><Link className="app-menu__item" to="/admin/pos"><i className="app-menu__icon bx bx-cart-alt" /><span className="app-menu__label">POS Bán Hàng</span></Link></li> */}
          <li><Link className="app-menu__item" to="/admin/dashboard"><i className="app-menu__icon bx bx-tachometer" /><span className="app-menu__label">Bảng điều khiển</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/employees"><i className="app-menu__icon bx bx-id-card" /> <span className="app-menu__label">Quản lý nhân viên</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/customers"><i className="app-menu__icon bx bx-user-voice" /><span className="app-menu__label">Quản lý khách hàng</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/product"><i className="app-menu__icon bx bx-purchase-tag-alt" /><span className="app-menu__label">Quản lý sản phẩm</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/category"><i className="app-menu__icon bx bx-purchase-tag-alt" /><span className="app-menu__label">Quản lý danh mục</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/suppliers"><i className="app-menu__icon bx bx-purchase-tag-alt" /><span className="app-menu__label">Quản lý nhà cung cấp</span></Link></li>
          <li> <Link className="app-menu__item" to="/admin/orders"><i className="app-menu__icon bx bx-task" /><span className="app-menu__label">Quản lý đơn hàng</span> </Link></li>
          <li><Link className="app-menu__item" to="/admin/reviews"><i className="app-menu__icon bx bx-comment-check" /><span className="app-menu__label">Quản lý bình luận</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/news"><i className="app-menu__icon bx bx-task" /><span className="app-menu__label">Quản lý tin tức</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/coupons"><i className="app-menu__icon bx bxs-discount" /><span className="app-menu__label">Quản lý ưu đãi</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/chats"><i className="app-menu__icon bx bx-message-square-add" /><span className="app-menu__label">Chăm sóc khách hàng</span></Link></li>
          {/* <li><Link className="app-menu__item" to="/admin/internal"><i className="app-menu__icon bx bx-run" /><span className="app-menu__label">Quản lý nội bộ</span></Link></li> */}
          {/* <li><Link className="app-menu__item" to="/admin/salary"><i className="app-menu__icon bx bx-dollar" /><span className="app-menu__label">Bảng kê lương</span></Link></li> */}
          <li><Link className="app-menu__item" to="/admin/statistics"><i className="app-menu__icon bx bx-pie-chart-alt-2" /><span className="app-menu__label">Báo cáo doanh thu</span></Link></li>
          {/* <li><Link className="app-menu__item" to="/admin/calendar"><i className="app-menu__icon bx bx-calendar-check" /><span className="app-menu__label">Lịch công tác</span></Link></li>
          <li><Link className="app-menu__item" to="/admin/settings"><i className="app-menu__icon bx bx-cog" /><span className="app-menu__label">Cài đặt hệ thống</span></Link></li> */}
        </ul>
      </aside>
    </div>
  );
}

export default Menu;
