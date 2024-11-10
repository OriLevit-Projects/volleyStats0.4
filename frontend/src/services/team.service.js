import axios from 'axios';

export const getAllTeams = async () => {
  try {
    const response = await axios.get('/api/teams/public');
    console.log('Teams fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', {
      message: error.message,
      response: error.response?.data
    });
    throw error.response?.data?.message || 'Error fetching teams';
  }
};

export const getAllTeamsAuthenticated = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/teams', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching teams';
  }
}; 