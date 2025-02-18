// Import thư viện bên ngoài trước
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Import module nội bộ
import Menu from './menu';

// Import file CSS
import '../pages/order.css';

const API_URL = "http://localhost:8083/api/v1"; // Your backend URL

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('Tất Cả');

  const statusMapping = {
    Pending: 'Đang xử lý',
    Confirmed: 'Đã xác nhận',
    Shipping: 'Đang giao',
    Delivered: 'Đã giao',
    Canceled: 'Đã hủy',
  };

  const translateStatus = (status) => statusMapping[status] || status;

  const filteredOrders = orders.filter((order) =>
    order._id.includes(searchQuery) || order.userId.includes(searchQuery)
  );

  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders`, {
        params: {
          status: status === 'Tất Cả' ? '' : status,
        },
      });

      if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        throw new Error('Invalid response format.');
      }
    } catch (error) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, { statusName: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, currentStatus: newStatus } : order
        )
      );
    } catch (error) {
      setError('Failed to update status.');
    }
  };

  const statuses = ['Tất Cả', 'Pending', 'Confirmed', 'Shipping', 'Delivered', 'Canceled'];

  return (
    <div>
      <Menu />
      <main className="app-content">
        <div>
          <div className="app-title">
            <ul className="app-breadcrumb breadcrumb side">
              <li className="breadcrumb-item active">
                <a href="#"><b>Quản lý đơn hàng</b></a>
              </li>
            </ul>
            <div id="clock" />
          </div>

          <div className="status-filter">
            <ul className="status-menu">
              {statuses.map((status) => (
                <li
                  key={status}
                  className={`status-item ${activeStatus === status ? 'active' : ''}`}
                  onClick={() => setActiveStatus(status)}
                >
                  {translateStatus(status)}
                </li>
              ))}
            </ul>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn hàng hoặc khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="tile">
                <div className="tile-body">
                  <table className="table table-hover table-bordered" id="ordersTable">
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Người dùng</th>
                        <th>Tổng số tiền</th>
                        <th>Ngày tạo</th>
                        <th>Chi tiết sản phẩm</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">Đang tải...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="7" className="text-center text-danger">{error}</td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">Không tìm thấy đơn hàng.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order._id}>
                            <td className="order-id" title={order._id}>{order._id}</td>
                            <td className="user-id" title={order.userId}>{order.userId}</td>
                            <td>
                              {order.totalAmount.toLocaleString()} đ<br />
                              {order.paymentStatus === "Success" && <span>(Đã thanh toán)</span>}
                            </td>
                            <td>{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                              <ul>
                                {order.orderDetails.map((detail) => (
                                  <li key={detail._id} className="product">
                                    <img
                                      src={detail.image}
                                      alt={detail.productName}
                                      width="50"
                                      style={{ marginRight: '10px' }}
                                    />
                                    {detail.productName} - Số lượng: {detail.quantity} - Giá: {detail.price.toLocaleString()} đ
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td>
                              {translateStatus(order.currentStatus)} <br />
                              {order.orderStatus
                                .filter(status => status.name === order.currentStatus)
                                .map(status => (
                                  <span key={status._id}>{new Date(status.update).toLocaleString()}</span>
                                ))
                              }
                            </td>
                            <td>
                              {order.currentStatus === 'Pending' && (
                                <button className="btn btn-primary" onClick={() => handleChangeStatus(order._id, 'Confirmed')}>
                                  Xác nhận
                                </button>
                              )}
                              {order.currentStatus === 'Confirmed' && (
                                <button className="btn btn-warning" onClick={() => handleChangeStatus(order._id, 'Shipping')}>
                                  Đang giao
                                </button>
                              )}
                              {order.currentStatus === 'Shipping' && (
                                <button className="btn btn-success" onClick={() => handleChangeStatus(order._id, 'Delivered')}>
                                  Đã giao
                                </button>
                              )}
                              {order.currentStatus !== 'Canceled' && order.currentStatus !== 'Delivered' && (
                                <button className="btn btn-danger" onClick={() => handleChangeStatus(order._id, 'Canceled')}>
                                  Hủy
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Orders;
