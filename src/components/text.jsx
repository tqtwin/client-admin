import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Statistics = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalCapitalPrice, setTotalCapitalPrice] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8083/api/v1/statistics/preview?month=${selectedMonth}&year=${selectedYear}`
        );

        if (response.data.success) {
          const data = response.data.data;
          setTotalOrders(data.totalOrders);
          setCancelledOrders(data.cancelledOrders);
          setTotalRevenue(data.totalRevenue);
          setTotalDiscount(data.totalDiscount);
          setTotalCapitalPrice(data.totalCapitalPrice);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [selectedYear, selectedMonth]);

  const totalEmployees = employees.filter(
    (emp) => emp.roleId.name === 'employee' || emp.roleId.name === 'admin'
  ).length;
  const bannedEmployees = employees.filter((emp) => emp.status === 'banned').length;
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(
    (prod) => prod.inventory === null || prod.inventory.quantity === 0
  ).length;

  return (
    <div>
      <main className="app-content">
        <div className="row">
          <div className="col-md-12">
            <div className="app-title">
              <ul className="app-breadcrumb breadcrumb">
                <li className="breadcrumb-item">
                  <a href="#">
                    <b>Báo cáo doanh thu</b>
                  </a>
                </li>
              </ul>
              <div id="clock" />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-user fa-3x" />
              <div className="info">
                <h4>Tổng Nhân viên</h4>
                <p>
                  <b>{totalEmployees} nhân viên</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small danger coloured-icon">
              <i className="icon bx bxs-info-circle fa-3x" />
              <div className="info">
                <h4>Bị cấm</h4>
                <p>
                  <b>{bannedEmployees} nhân viên</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small info coloured-icon">
              <i className="icon bx bxs-purchase-tag-alt fa-3x" />
              <div className="info">
                <h4>Tổng sản phẩm</h4>
                <p>
                  <b>{totalProducts} sản phẩm</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small warning coloured-icon">
              <i className="icon bx bxs-tag-x fa-3x" />
              <div className="info">
                <h4>Hết hàng</h4>
                <p>
                  <b>{outOfStockProducts} sản phẩm</b>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown chọn năm và tháng */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label htmlFor="yearSelect">Chọn năm:</label>
            <select
  id="yearSelect"
  className="form-control"
  value={selectedYear}
  onChange={(e) => setSelectedYear(Number(e.target.value))}
>
  {[2024, 2023, 2022, 2021, 2020].map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</select>

          </div>
          <div className="col-md-3">
            <label htmlFor="monthSelect">Chọn tháng:</label>
            <select
              id="monthSelect"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doanh thu và đơn hàng */}
        <div className="row">
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng tiền</h4>
                <p>
                  <b>{totalRevenue.toLocaleString()} đ</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small danger coloured-icon">
              <i className="icon bx bxs-wallet fa-3x" />
              <div className="info">
                <h4>Tiền đã giảm</h4>
                <p>
                  <b>{totalDiscount.toLocaleString()} đ</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng thu thực tế</h4>
                <p>
                  <b>{totalRevenue.toLocaleString()} đ</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng tiền nhập hàng</h4>
                <p>
                  <b>{totalCapitalPrice.toLocaleString()} đ</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small warning coloured-icon">
              <i className="icon bx bxs-receipt fa-3x" />
              <div className="info">
                <h4>Đơn hàng hủy</h4>
                <p>
                  <b>{cancelledOrders} đơn hàng</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small info coloured-icon">
              <i className="icon bx bxs-shopping-bag-alt fa-3x" />
              <div className="info">
                <h4>Tổng đơn hàng</h4>
                <p>
                  <b>{totalOrders} đơn hàng</b>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
