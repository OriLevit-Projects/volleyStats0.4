import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ProfilePage() {
  const { user, login } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Get the correct ID regardless of data structure
  const getUserId = (userData) => {
    return userData?.id || userData?._id;
  };

  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    position: user?.position || '',
    jerseyNumber: user?.jerseyNumber || '',
    team: user?.team || ''
  });

  // Update userData when user data changes
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        position: user.position || '',
        jerseyNumber: user.jerseyNumber || '',
        team: user.team || ''
      });
    }
  }, [user]);

  // Add email validation function
  const validateEmail = async (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setIsEmailValid(false);
      return false;
    }

    try {
      // Only check database if email is different from current user's email
      if (email !== user.email) {
        const response = await axios.post('/api/auth/check-email', { email });
        if (response.data.exists) {
          setEmailError('Email already registered');
          setIsEmailValid(false);
          return false;
        }
      }
      
      setEmailError('');
      setIsEmailValid(true);
      return true;
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailError('Error checking email availability');
      setIsEmailValid(false);
      return false;
    }
  };

  // Add debounced email check
  const debouncedEmailCheck = useCallback(
    debounce((email) => validateEmail(email), 500),
    []
  );

  // Handle email change
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setUserData(prev => ({ ...prev, email: newEmail }));
    debouncedEmailCheck(newEmail);
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId(user);
      
      // Validate email before updating
      const isValid = await validateEmail(userData.email);
      if (!isValid) {
        return;
      }

      if (!userId) {
        console.error('No user ID available:', user);
        setMessage({ 
          text: 'User ID not found', 
          type: 'error' 
        });
        return;
      }

      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        position: userData.position,
        jerseyNumber: parseInt(userData.jerseyNumber, 10),
        team: userData.team
      };

      const response = await axios({
        method: 'put',
        url: `/api/users/${userId}`,
        data: updateData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update both local state and global auth context
      setUserData(response.data);
      login({
        ...response.data,
        id: getUserId(response.data) // Ensure ID is preserved
      });
      
      setEditMode(false);
      setMessage({ 
        text: 'Profile updated successfully', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Update error:', {
        error: error.message,
        userData: user,
        userId: getUserId(user)
      });
      
      setMessage({ 
        text: error.response?.data?.message || 'Error updating profile', 
        type: 'error' 
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Personal Information" />
          <Tab label="Statistics" />
        </Tabs>

        {currentTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userData.email}
                  onChange={handleEmailChange}
                  disabled={!editMode}
                  margin="normal"
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    endAdornment: editMode && (
                      <InputAdornment position="end">
                        {userData.email !== user.email && (
                          isEmailValid ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Error color="error" />
                          )
                        )}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={userData.position}
                  onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Jersey Number"
                  value={userData.jerseyNumber}
                  onChange={(e) => setUserData({ ...userData, jerseyNumber: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              {editMode ? (
                <>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdateProfile}
                    sx={{ mr: 2 }}
                    disabled={!!emailError}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setEditMode(false);
                      setEmailError('');
                      setUserData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        position: user.position || '',
                        jerseyNumber: user.jerseyNumber || '',
                        team: user.team || ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        )}

        {currentTab === 1 && (
          <Typography>Statistics coming soon...</Typography>
        )}

        <Snackbar
          open={!!message.text}
          autoHideDuration={6000}
          onClose={() => setMessage({ text: '', type: '' })}
        >
          <Alert 
            severity={message.type} 
            onClose={() => setMessage({ text: '', type: '' })}
          >
            {message.text}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default ProfilePage;