import axios from 'axios';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAllUsers = async () => {
  try {
    console.log('Fetching all users...');
    const response = await axios.get('/api/users', getAuthHeader());
    console.log('Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data?.message || 'Error fetching users';
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log('Sending update request for user:', userId);
    console.log('Update data:', userData);
    
    const response = await axios.put(`/api/users/${userId}`, userData, getAuthHeader());
    console.log('Update response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Update error in service:', error.response?.data || error);
    throw error.response?.data?.message || 'Error updating user';
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error deleting user';
  }
};

export const getAllTeams = async () => {
  try {
    const response = await axios.get('/api/teams', getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching teams';
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await axios.post('/api/teams', teamData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error creating team';
  }
};

export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await axios.put(`/api/teams/${teamId}`, teamData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error updating team';
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const response = await axios.delete(`/api/teams/${teamId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error deleting team';
  }
}; 