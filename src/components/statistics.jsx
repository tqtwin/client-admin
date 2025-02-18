import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Statistics = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotalProduct] = useState();
  const [employees, setEmployees] = useState([]);
  const [statisticsData, setStatisticsData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [filterType, setFilterType] = useState("month"); // "month", "quarter", or "year"
  const [serverStatistics, setServerStatistics] = useState({});
  const fetchData = async () => {
    try {
      const [productsRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:8083/api/v1/products'),
        axios.get('http://localhost:8083/api/v1/users'),
      ]);
      setTotalProduct(productsRes.data.total)
      setProducts(productsRes.data.data);
      setEmployees(employeesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
    }
  };
  const fetchAllStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:8083/api/v1/statistics`);
      const data = response.data.data;
      setStatisticsData(data);
      setServerStatistics({});
      // setShowStatistics(true); // Hiển thị bảng sau khi gọi API
      toast.success('Tất cả thống kê đã được tải!');
    } catch (error) {
      console.error('Error fetching all statistics:', error);
      toast.error('Đã xảy ra lỗi khi tải tất cả thống kê!');
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);
  const fetchStatisticsFromServer = async () => {
    try {
      let url = 'http://localhost:8083/api/v1/statistics';
      const params = {};

      if (filterType === 'month') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (filterType === 'quarter') {
        params.quarter = selectedQuarter;
        params.year = selectedYear;
      } else if (filterType === 'year') {
        params.year = selectedYear;
      }

      const response = await axios.get(url, { params });
      let data = response.data.data;

      if (Array.isArray(data) && data.length === 0) {
        toast.success('Chưa có bảng thống kê cho thời gian này');
        setStatisticsData([]);
        setServerStatistics({});
      } else {
        // Sắp xếp theo thứ tự tháng hoặc năm
        data.sort((a, b) => {
          if (a.type === 'monthly' && b.type === 'monthly') {
            return a.value.year !== b.value.year
              ? a.value.year - b.value.year
              : a.value.month - b.value.month;
          } else if (a.type === 'quarterly' && b.type === 'quarterly') {
            return a.value.year !== b.value.year
              ? a.value.year - b.value.year
              : a.value.quarter - b.value.quarter;
          } else {
            return a.value.year - b.value.year;
          }
        });

        setStatisticsData(data);
        setServerStatistics(data[0]?.value || {});
        toast.success('Thống kê thành công!');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Đã xảy ra lỗi khi thống kê!');
    }
  };


  useEffect(() => {
    fetchData();
  }, []);



  const totalEmployees = employees.filter(emp => emp.roleId.name === 'employee' || emp.roleId.name === 'admin').length;
  const bannedEmployees = employees.filter(emp => emp.status === 'banned').length;
  const totalProducts = total;
  const outOfStockProducts = products.filter(prod => prod.inventory === null || prod.inventory.quantity === 0).length;
  const handleFilter = () => {
    const params = {};
    if (filterType === 'month') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (filterType === 'quarter') {
      params.year = selectedYear;
      params.quarter = selectedQuarter;
    } else if (filterType === 'year') {
      params.year = selectedYear;
    }
    fetchStatisticsFromServer(params);
    setFilterType(null); // Đóng modal sau khi áp dụng lọc
  };
  return (
    <div>
      <main className="app-content">
        {/* Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="app-title">
              <ul className="app-breadcrumb breadcrumb">
                <li className="breadcrumb-item"><a href="#"><b>Báo cáo doanh thu</b></a></li>
              </ul>
              <div id="clock" />
            </div>
          </div>
        </div>

        {/* Summary Widgets */}
        <div className="row">
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-user fa-3x" />
              <div className="info">
                <h4>Tổng Nhân viên</h4>
                <p><b>{totalEmployees} nhân viên</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small danger coloured-icon">
              <i className="icon bx bxs-info-circle fa-3x" />
              <div className="info">
                <h4>Bị cấm</h4>
                <p><b>{bannedEmployees} nhân viên</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small info coloured-icon">
              <i className="icon bx bxs-purchase-tag-alt fa-3x" />
              <div className="info">
                <h4>Tổng sản phẩm</h4>
                <p><b>{totalProducts} sản phẩm</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small warning coloured-icon">
              <i className="icon bx bxs-tag-x fa-3x" />
              <div className="info">
                <h4>Hết hàng</h4>
                <p><b>{outOfStockProducts} sản phẩm</b></p>
              </div>
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-12">
            <button
              className={`btn btn-primary ${filterType === 'month' ? 'active' : ''}`}
              onClick={() => setFilterType('month')}
            >
              Theo Tháng
            </button>
            <button
              className={`btn btn-primary mx-2 ${filterType === 'quarter' ? 'active' : ''}`}
              onClick={() => setFilterType('quarter')}
            >
              Theo Quý
            </button>
            <button
              className={`btn btn-primary ${filterType === 'year' ? 'active' : ''}`}
              onClick={() => setFilterType('year')}
            >
              Theo Năm
            </button>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="row mb-3">
          {filterType === 'month' && (
            <>
              <div className="col-md-3">
                <label htmlFor="monthSelect">Chọn tháng:</label>
                <select
                  id="monthSelect"
                  className="form-control"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="yearSelect">Chọn năm:</label>
                <select
                  id="yearSelect"
                  className="form-control"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filterType === 'quarter' && (
            <>
              <div className="col-md-3">
                <label htmlFor="quarterSelect">Chọn quý:</label>
                <select
                  id="quarterSelect"
                  className="form-control"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((quarter) => (
                    <option key={quarter} value={quarter}>{`Quý ${quarter}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="yearSelect">Chọn năm:</label>
                <select
                  id="yearSelect"
                  className="form-control"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filterType === 'year' && (
            <div className="col-md-3">
              <label htmlFor="yearSelect">Chọn năm:</label>
              <select
                id="yearSelect"
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="row mb-3">
          <div className="col-md-6 d-flex align-items-end">
            <button
              className="btn btn-primary"
              onClick={fetchStatisticsFromServer}
            >
              Lọc
            </button>
          </div>
        </div>
        {/* Statistics Widgets */}
        <div className="row">
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng tiền đã thu</h4>
                <p><b>{serverStatistics.initialAmount?.toLocaleString() || 0} đ</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small danger coloured-icon">
              <i className="icon bx bxs-wallet fa-3x" />
              <div className="info">
                <h4>Tiền đã giảm</h4>
                <p><b>{serverStatistics.totalDiscount?.toLocaleString() || 0} đ</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng thu thực tế</h4>
                <p><b>{serverStatistics.totalRevenue?.toLocaleString() || 0} đ</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small primary coloured-icon">
              <i className="icon bx bxs-chart fa-3x" />
              <div className="info">
                <h4>Tổng tiền nhập hàng</h4>
                <p><b>{serverStatistics.totalCapitalPrice?.toLocaleString() || 0} đ</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small warning coloured-icon">
              <i className="icon bx bxs-receipt fa-3x" />
              <div className="info">
                <h4>Đơn hàng hủy</h4>
                <p><b>{serverStatistics.cancelledOrders || 0} đơn hàng</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="widget-small info coloured-icon">
              <i className="icon bx bxs-shopping-bag-alt fa-3x" />
              <div className="info">
                <h4>Tổng đơn hàng</h4>
                <p><b>{serverStatistics.totalOrders || 0} đơn hàng</b></p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="tile">
          <h3 className="tile-title">Dữ Liệu Thống Kê</h3>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tổng Đơn Hàng</th>
                  <th>Đơn Hàng Hủy</th>
                  <th>Tổng Tiền</th>
                  <th>Doanh Thu Thực tế</th>
                  <th>Giảm Giá</th>
                  <th>Số Tiền Nhập Hàng</th>
                  <th>Ngày thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {statisticsData.map((stat, index) => (
                  <tr key={index}>

                    <td>
              {/* Kiểm tra type và hiển thị thời gian tương ứng */}
              {stat.type === 'monthly' ? (
                `Tháng ${stat.value.month}/${stat.value.year}`
              ) : stat.type === 'quarterly' ? (
                `Quý ${stat.value.quarter}/${stat.value.year}`
              ) : (
                `Năm ${stat.value.year}`
              )}
            </td>
                    <td>{stat.value.totalOrders}</td>
                    <td>{stat.value.cancelledOrders}</td>

                    <td>{stat.value.initialAmount.toLocaleString()} đ</td>
                    <td>{stat.value.totalRevenue.toLocaleString()} đ</td>
                    <td>{stat.value.totalDiscount.toLocaleString()} đ</td>
                    <td>{stat.value.totalCapitalPrice.toLocaleString()} đ</td>
                    <td>{new Date(stat.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
