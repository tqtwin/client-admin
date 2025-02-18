import axios from 'axios';

const API_URL = "https://server-project-hew7.onrender.com/api/v1"; // Your backend URL

export const getCoupons = () => axios.get(`${API_URL}/coupons`);
export const getCouponById = (id) => axios.get(`${API_URL}/coupons/${id}`);
export const createCoupon = (data) => axios.post(`${API_URL}/coupons`, data);
export const updateCoupon = (id, data) => axios.put(`${API_URL}/coupons/${id}`, data);
export const deleteCoupon = (id) => axios.delete(`${API_URL}/coupons/${id}`);
