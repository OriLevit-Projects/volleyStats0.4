import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { VOLLEYBALL_ACTIONS, SUCCESS_RESULTS } from '../utils/statConstants';
import { styled } from '@mui/material/styles';

const NoSelectBox = styled(Box)({
  userSelect: 'none',
  cursor: 'default',
  '& *': {
    userSelect: 'none'
  }
});

function ProfilePage() {
  const { user, login } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState('all');
  const [expandedAction, setExpandedAction] = useState(null);

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

  // Update the useEffect to use the correct endpoint
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoadingStats(true);
      setStatsError('');
      
      try {
        const token = localStorage.getItem('token');
        const userId = getUserId(user);
        const response = await axios.get(`/api/stats/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsError('Failed to load statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  const calculateStats = (statsData) => {
    if (!statsData?.stats) return null;

    const allStats = statsData.stats.reduce((acc, stat) => {
      if (!acc[stat.action]) {
        acc[stat.action] = {
          total: 0,
          results: {}
        };
      }
      
      acc[stat.action].total++;
      if (!acc[stat.action].results[stat.result]) {
        acc[stat.action].results[stat.result] = 0;
      }
      acc[stat.action].results[stat.result]++;
      
      return acc;
    }, {});

    return allStats;
  };

  // Update the success results mapping
  const getSuccessRate = (action, result) => {
    const successMapping = {
      'Serve': ['ace', 'in play'],
      'Serve Recieve': ['perfect', 'decent'],
      'Set': ['perfect', 'decent', 'setter dump'],
      'Spike': ['Kill', 'block out'],
      'Block': ['Kill block', 'soft block']
    };

    return successMapping[action]?.includes(result) || false;
  };

  const formatPercentage = (count, total) => {
    return `${((count/total)*100).toFixed(1)}%`;
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
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
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
          <NoSelectBox>
            {loadingStats ? (
              <Typography>Loading statistics...</Typography>
            ) : statsError ? (
              <Alert severity="error">{statsError}</Alert>
            ) : !stats?.stats?.length ? (
              <Typography>No statistics available</Typography>
            ) : (
              <NoSelectBox>
                {/* Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={selectedAction}
                      label="Action"
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <MenuItem value="all">All Actions</MenuItem>
                      {Object.keys(stats.summary).map((action) => (
                        <MenuItem key={action} value={action}>{action}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Result</InputLabel>
                    <Select
                      value={selectedResult}
                      label="Result"
                      onChange={(e) => setSelectedResult(e.target.value)}
                    >
                      <MenuItem value="all">All Results</MenuItem>
                      {Array.from(new Set(stats.stats.map(stat => stat.result))).map((result) => (
                        <MenuItem key={result} value={result}>{result}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Match</InputLabel>
                    <Select
                      value={selectedMatch}
                      label="Match"
                      onChange={(e) => setSelectedMatch(e.target.value)}
                    >
                      <MenuItem value="all">All Matches</MenuItem>
                      {Array.from(new Set(stats.stats.map(stat => stat.matchId?._id))).map((matchId) => {
                        const match = stats.stats.find(s => s.matchId?._id === matchId)?.matchId;
                        return match ? (
                          <MenuItem key={matchId} value={matchId}>
                            {new Date(match.date).toLocaleDateString()} vs {match.opponent}
                          </MenuItem>
                        ) : null;
                      })}
                    </Select>
                  </FormControl>
                </Box>

                {/* Statistics Table */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '48px', padding: '6px' }} />
                        <TableCell 
                          align="left"
                          style={{ paddingLeft: '0px' }}
                        >
                          Action
                        </TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(stats.summary)
                        .filter(([action]) => selectedAction === 'all' || selectedAction === action)
                        .map(([action, data]) => {
                          const filteredStats = stats.stats.filter(stat => 
                            stat.action === action &&
                            (selectedResult === 'all' || stat.result === selectedResult) &&
                            (selectedMatch === 'all' || stat.matchId?._id === selectedMatch)
                          );

                          return (
                            <React.Fragment key={action}>
                              <TableRow 
                                sx={{ 
                                  '& > *': { borderBottom: 'unset' },
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                }}
                                onClick={() => setExpandedAction(expandedAction === action ? null : action)}
                              >
                                <TableCell style={{ width: '48px', padding: '6px' }}>
                                  <IconButton size="small">
                                    {expandedAction === action ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                </TableCell>
                                <TableCell 
                                  align="left"
                                  style={{ paddingLeft: '0px' }}
                                >
                                  {action}
                                </TableCell>
                                <TableCell align="right">{filteredStats.length}</TableCell>
                              </TableRow>
                              
                              {/* Expanded Details Row */}
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                  <Collapse in={expandedAction === action} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 2 }}>
                                      <Typography variant="h6" gutterBottom component="div">
                                        Detailed Results
                                      </Typography>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Result</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                            <TableCell align="right">Percentage</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {Object.entries(data.results)
                                            .filter(([result]) => selectedResult === 'all' || selectedResult === result)
                                            .map(([result, count]) => (
                                              <TableRow key={result}>
                                                <TableCell component="th" scope="row">
                                                  {result}
                                                </TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                                <TableCell align="right">
                                                  {formatPercentage(count, data.total)}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                        </TableBody>
                                      </Table>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </NoSelectBox>
            )}
          </NoSelectBox>
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