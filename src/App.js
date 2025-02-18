import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLogin from './components/login';
import Product from './components/product';
import Category from './components/category';

import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import Employee from './components/employee';
import Menu from './components/menu';
import News from './components/news';
import ChatAdmin from './components/chatadmin';
import Customer from './components/customer';
import CouponManagement from './components/coupon';
import { ToastContainer } from 'react-toastify';
import Orders from './components/order';
import ProductPage from './components/product';
import Statistics from './components/statistics';
import Reviews from './components/review';
import Product1 from './components/text';
import ScrollToTopButton from './components/scroll';
import Supplier from './components/supplier';
import RevenueChart from './components/revenueChart';
function App() {
  return (
    <Router>
         <ToastContainer />
      <Routes>

      <Route path="/" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Bảo vệ các route admin bằng PrivateRoute */}
        <Route path="/admin/product" element={<PrivateRoute><Menu/><ProductPage /></PrivateRoute>} />

        <Route path="/admin/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<PrivateRoute><RevenueChart /></PrivateRoute>} />
        <Route path="/admin/category" element={<PrivateRoute><Category /></PrivateRoute>} />
        <Route path="/admin/news" element={<PrivateRoute><News /></PrivateRoute>} />
        <Route path="/admin/chats" element={<PrivateRoute><ChatAdmin/></PrivateRoute>} />
        <Route path="/admin/reviews" element={<PrivateRoute><Reviews/></PrivateRoute>} />
        <Route path="/admin/employees" element={<PrivateRoute><Menu/><Employee /></PrivateRoute>} />
        <Route path="/admin/text" element={<PrivateRoute><Menu/>< Product1/></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute><Menu/><Customer/></PrivateRoute>} />
        <Route path="/admin/statistics" element={<PrivateRoute><Menu/><Statistics/></PrivateRoute>} />
        <Route path="/admin/suppliers" element={<PrivateRoute><Menu/><Supplier/></PrivateRoute>} />
        <Route path="/admin/coupons" element={<PrivateRoute><Menu/><CouponManagement/></PrivateRoute>} />
      </Routes>
      <ScrollToTopButton />
    </Router>
  );
}

export default App;
