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
  IconButton,
  Checkbox,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ClearIcon from '@mui/icons-material/Clear';
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
  const [selectedMatch, setSelectedMatch] = useState('all');
  const [expandedAction, setExpandedAction] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

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
        
        console.log('Raw stats response:', response.data);
        console.log('Stats with matches:', response.data.stats.filter(stat => stat.matchId));
        console.log('Unique matches:', new Set(response.data.stats.map(stat => stat.matchId?._id)));
        
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
    return SUCCESS_RESULTS[action]?.includes(result) || false;
  };

  const formatPercentage = (count, total) => {
    return `${((count/total)*100).toFixed(1)}%`;
  };

  // Add this helper function
  const getFormattedResult = (action, result) => {
    return VOLLEYBALL_ACTIONS[action]?.find(r => r.toLowerCase() === result.toLowerCase()) || result;
  };

  // Add this helper function to get all possible results for an action
  const getAllPossibleResults = () => {
    return Object.values(VOLLEYBALL_ACTIONS)
      .flat()
      .reduce((unique, result) => {
        if (!unique.includes(result)) {
          unique.push(result);
        }
        return unique;
      }, [])
      .sort();
  };

  // First, create a filtered stats object based on the selected match
  const getFilteredStats = () => {
    if (!stats?.stats) return null;

    // Filter stats based on selected match
    const filteredStatsArray = stats.stats.filter(stat => 
      selectedMatch === 'all' || stat.matchId?._id === selectedMatch
    );

    // Create summary from filtered stats
    return filteredStatsArray.reduce((acc, stat) => {
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
  };

  const getStatsForMatch = (matchId) => {
    if (!stats?.stats) return null;

    const matchStats = stats.stats.filter(stat => 
      stat.matchId?._id === matchId
    );

    return matchStats.reduce((acc, stat) => {
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
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 300, flexGrow: 1 }}>
                <InputLabel id="match-select-label">Select Matches</InputLabel>
                <Select
                  labelId="match-select-label"
                  multiple
                  value={selectedMatches}
                  onChange={(e) => {
                    setSelectedMatches(e.target.value);
                    if (e.target.value.length === 0) {
                      setSelectedMatch('all');
                    } else if (e.target.value.length === 1) {
                      setSelectedMatch(e.target.value[0]);
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) return 'All Matches';
                    return `${selected.length} match${selected.length > 1 ? 'es' : ''} selected`;
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                  label="Select Matches"
                >
                  {stats?.stats
                    .reduce((matches, stat) => {
                      if (stat.matchId && !matches.find(m => m._id === stat.matchId._id)) {
                        matches.push(stat.matchId);
                      }
                      return matches;
                    }, [])
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(match => (
                      <MenuItem key={match._id} value={match._id}>
                        <Checkbox checked={selectedMatches.indexOf(match._id) > -1} />
                        <ListItemText 
                          primary={`${new Date(match.date).toLocaleDateString()} vs ${match.opponent}`}
                          secondary={match.location}
                        />
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<CompareArrowsIcon />}
                onClick={() => setCompareMode(!compareMode)}
                disabled={selectedMatches.length < 2}
                color={compareMode ? "primary" : "inherit"}
              >
                Compare
              </Button>

              {(selectedMatches.length > 0 || compareMode) && (
                <IconButton 
                  onClick={() => {
                    setSelectedMatches([]);
                    setCompareMode(false);
                    setSelectedMatch('all');
                  }}
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </Box>

            {/* Comparison View */}
            {compareMode && selectedMatches.length >= 2 ? (
              <Grid container spacing={2}>
                {selectedMatches.map(matchId => {
                  const matchStats = getStatsForMatch(matchId);
                  const match = stats.stats.find(s => s.matchId?._id === matchId)?.matchId;
                  
                  return (
                    <Grid item xs={12} md={6} key={matchId}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {new Date(match.date).toLocaleDateString()} vs {match.opponent}
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="right">Success Rate</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(matchStats || {}).map(([action, data]) => (
                                <TableRow key={action}>
                                  <TableCell>{action}</TableCell>
                                  <TableCell align="right">{data.total}</TableCell>
                                  <TableCell align="right">
                                    {formatPercentage(
                                      Object.entries(data.results)
                                        .filter(([result]) => getSuccessRate(action, result))
                                        .reduce((sum, [_, count]) => sum + count, 0),
                                      data.total
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <NoSelectBox>
                {/* Filters - now only showing Match filter */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Match</InputLabel>
                    <Select
                      value={selectedMatch}
                      label="Match"
                      onChange={(e) => setSelectedMatch(e.target.value)}
                    >
                      <MenuItem value="all">All Matches</MenuItem>
                      {stats.stats
                        .filter(stat => stat.matchId && stat.matchId._id)
                        .reduce((matches, stat) => {
                          const matchExists = matches.find(m => m._id === stat.matchId._id);
                          if (!matchExists && stat.matchId) {
                            matches.push(stat.matchId);
                          }
                          return matches;
                        }, [])
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(match => {
                          console.log('Rendering match:', match);
                          return (
                            <MenuItem key={match._id} value={match._id}>
                              {new Date(match.date).toLocaleDateString()} vs {match.opponent}
                            </MenuItem>
                          );
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
                      {Object.entries(getFilteredStats() || {})
                        .map(([action, data]) => {
                          const filteredStats = stats.stats.filter(stat => 
                            stat.action === action &&
                            (selectedMatch === 'all' || stat.matchId?._id === selectedMatch)
                          );

                          const isExpanded = expandedAction === action;

                          return (
                            <React.Fragment key={action}>
                              <TableRow 
                                sx={{ 
                                  '& > *': { borderBottom: 'unset' },
                                  cursor: 'pointer',
                                  backgroundColor: isExpanded ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { 
                                    backgroundColor: isExpanded 
                                      ? 'rgba(25, 118, 210, 0.12)' 
                                      : 'rgba(0, 0, 0, 0.04)' 
                                  },
                                  // Add border and shadow when expanded
                                  border: isExpanded ? '1px solid rgba(25, 118, 210, 0.5)' : 'none',
                                  boxShadow: isExpanded ? '0 2px 4px rgba(25, 118, 210, 0.15)' : 'none',
                                  // Dim other rows when one is expanded
                                  opacity: expandedAction && !isExpanded ? 0.6 : 1,
                                  // Add some spacing between rows
                                  marginTop: isExpanded ? '8px' : '0px',
                                  marginBottom: isExpanded ? '8px' : '0px',
                                  // Round the corners when expanded
                                  borderRadius: isExpanded ? '4px' : '0px',
                                  // Ensure the row stands out
                                  position: isExpanded ? 'relative' : 'static',
                                  zIndex: isExpanded ? 1 : 'auto',
                                }}
                                onClick={() => setExpandedAction(expandedAction === action ? null : action)}
                              >
                                <TableCell style={{ width: '48px', padding: '6px' }}>
                                  <IconButton 
                                    size="small"
                                    sx={{
                                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                      transition: 'transform 0.3s ease',
                                      color: isExpanded ? 'primary.main' : 'action.active'
                                    }}
                                  >
                                    <ExpandMoreIcon />
                                  </IconButton>
                                </TableCell>
                                <TableCell 
                                  align="left"
                                  style={{ paddingLeft: '0px' }}
                                  sx={{
                                    fontWeight: isExpanded ? 600 : 400,
                                    color: isExpanded ? 'primary.main' : 'inherit'
                                  }}
                                >
                                  {action}
                                </TableCell>
                                <TableCell 
                                  align="right"
                                  sx={{
                                    fontWeight: isExpanded ? 600 : 400,
                                    color: isExpanded ? 'primary.main' : 'inherit'
                                  }}
                                >
                                  {filteredStats.length}
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Details Row */}
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 1 }}>
                                      <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        component="div"
                                        sx={{ color: 'primary.main' }}
                                      >
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
                                            .map(([result, count]) => (
                                              <TableRow key={result}>
                                                <TableCell component="th" scope="row">
                                                  {getFormattedResult(action, result)}
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