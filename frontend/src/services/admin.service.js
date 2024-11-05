import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching users';
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error updating user';
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error deleting user';
  }
};

export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${API_URL}/teams`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching teams';
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await axios.post(`${API_URL}/teams`, teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error creating team';
  }
};

export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await axios.put(`${API_URL}/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error updating team';
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const response = await axios.delete(`${API_URL}/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error deleting team';
  }
}; 