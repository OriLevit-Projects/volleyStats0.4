import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${API_URL}/teams`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching teams';
  }
}; 