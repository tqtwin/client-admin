import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';
import Menu from './menu';
const RevenueChart = () => {
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0)); // Khởi tạo dữ liệu doanh thu rỗng cho 12 tháng
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Mặc định là năm hiện tại

  // Hàm lấy dữ liệu từ API theo năm
  const fetchMonthlyRevenue = async (year) => {
    try {
      const response = await axios.get(`http://localhost:8083/api/v1/statistics`, {
        params: { year }
      });

      const revenueData = Array(12).fill(0);

      response.data.data.forEach((item) => {
        const month = item.value.month - 1; // Tháng trong JavaScript bắt đầu từ 0
        revenueData[month] = item.value.totalRevenue;
      });

      setMonthlyData(revenueData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
    }
  };

  // Lấy dữ liệu khi component mount hoặc khi năm được thay đổi
  useEffect(() => {
    fetchMonthlyRevenue(selectedYear);
  }, [selectedYear]);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: monthlyData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toLocaleString()} đ`, // Format số thành tiền
        },
      },
    },
  };

  return (
  <div>
    <Menu />
    <main className="app-content">
    <div className="app-title">
      <ul className="app-breadcrumb breadcrumb side">
        <li className="breadcrumb-item active"><a href="#"><b></b>Dashboard</a></li>
      </ul>
      <div id="clock" />
    </div>
    <div style={{ maxWidth:'900px',backgroundColor:'white', padding:'10px'}}>

      <form style={{ textAlign: 'center', marginBottom: '20px'}}>
        <label htmlFor="yearSelect">Chọn năm: </label>
        <select
          id="yearSelect"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[2025, 2024, 2023, 2022, 2021].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </form>
      <div>
        <Bar data={chartData} options={options} />
      </div>
    </div>
    </main>    </div>
  );
};

export default RevenueChart;
