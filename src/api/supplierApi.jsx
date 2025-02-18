import axios from 'axios';

const API_URL = "https://server-project-hew7.onrender.com/api/v1"; // Your backend URL

export const getSuppliers = () => axios.get(`${API_URL}/supplier`);
export const getSupplierById = (id) => axios.get(`${API_URL}/supplier/${id}`);
export const createSupplier = (data) => axios.post(`${API_URL}/supplier`, data);
export const updateSupplier= (id, data) => axios.put(`${API_URL}/supplier/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`${API_URL}/supplier/${id}`);
