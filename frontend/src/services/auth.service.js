import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const signup = async (userData) => {
  try {
    console.log('Making signup request to:', `${API_URL}/signup`);
    console.log('With data:', userData);
    const response = await axios.post(`${API_URL}/signup`, userData);
    console.log('Received response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Error in signup service:', error);
    throw error.response?.data?.message || 'An error occurred during signup';
  }
};

export const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email });
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log('Server response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error response:', error.response?.data);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred during login');
  }
}; 