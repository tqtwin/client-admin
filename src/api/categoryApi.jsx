import axios from 'axios';

const API_URL = "https://server-project-hew7.onrender.com/api/v1";
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("adtoken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());
export const getCategoryById = (id) => axios.get(`${API_URL}/categories/${id}`, getAuthHeaders());
export const createCategory = (data) => axios.post(`${API_URL}/categories`, data, getAuthHeaders());
export const updateCategory = (id, data) => axios.put(`${API_URL}/categories/${id}`, data, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${API_URL}/categories/${id}`, getAuthHeaders());
