// UserApi.js
import axios from 'axios';

const API_URL = "https://server-project-hew7.onrender.com/api/v1";

export const UserApi = {
  getUsers: () => axios.get(`${API_URL}/users`),
  getUserById: (id) => axios.get(`${API_URL}/users/${id}`),
  createUser: (data) => axios.post(`${API_URL}/users`, data),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`),
  getRoles: () => axios.get(`${API_URL}/role`),
};
