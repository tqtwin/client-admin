import axios from 'axios';

const API_URL = "https://server-project-hew7.onrender.com/api/v1"; // Your backend URL

export const getOrders = () => axios.get(`${API_URL}/orders`);
export const getOrderById = (id) => axios.get(`${API_URL}/orders/${id}`);
export const createOrder = (data) => axios.post(`${API_URL}/orders`, data);
export const updateOrder = (id, data) => axios.put(`${API_URL}/orders/${id}`, data);
export const deleteOrder = (id) => axios.delete(`${API_URL}/orders/${id}`);
