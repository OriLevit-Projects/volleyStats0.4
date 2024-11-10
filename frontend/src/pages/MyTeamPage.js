import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
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
  TextField,
  Checkbox,
  ListItemText,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { VOLLEYBALL_ACTIONS, SUCCESS_RESULTS } from '../utils/statConstants';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const NoSelectBox = styled(Box)({
  userSelect: 'none',
  cursor: 'default',
  '& *': {
    userSelect: 'none'
  }
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MyTeamPage() {
  const [value, setValue] = useState(0);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [detailedStats, setDetailedStats] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [expandedAction, setExpandedAction] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrouped, setShowGrouped] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchTeamData();
  }, []);

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/teams/my-team/detailed-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDetailedStats(response.data);
      } catch (error) {
        console.error('Error fetching detailed stats:', error);
      }
    };

    fetchDetailedStats();
  }, []);

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teams/my-team', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTeamData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching team data');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatPercentage = (count, total) => {
    return `${((count/total)*100).toFixed(1)}%`;
  };

  const getFormattedResult = (action, result) => {
    return VOLLEYBALL_ACTIONS[action]?.find(r => r.toLowerCase() === result.toLowerCase()) || result;
  };

  // Add this function to filter stats based on selected match
  const getFilteredStats = () => {
    if (!detailedStats?.stats) return {};

    const filteredStats = detailedStats.stats.filter(stat => {
      // Filter by selected matches
      const matchFilter = selectedMatches.length === 0 || selectedMatches.includes(stat.matchId);
      
      // Search filter
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        stat.action.toLowerCase().includes(search) ||
        stat.result.toLowerCase().includes(search) ||
        stat.playerName.toLowerCase().includes(search);

      return matchFilter && matchesSearch;
    });

    return filteredStats.reduce((acc, stat) => {
      if (!acc[stat.action]) {
        acc[stat.action] = {
          total: 0,
          results: {},
          players: {} // Add players tracking
        };
      }
      
      acc[stat.action].total++;

      // Track results
      if (!acc[stat.action].results[stat.result]) {
        acc[stat.action].results[stat.result] = 0;
      }
      acc[stat.action].results[stat.result]++;

      // Track players
      if (!acc[stat.action].players[stat.playerName]) {
        acc[stat.action].players[stat.playerName] = {
          total: 0,
          results: {}
        };
      }
      acc[stat.action].players[stat.playerName].total++;
      
      if (!acc[stat.action].players[stat.playerName].results[stat.result]) {
        acc[stat.action].players[stat.playerName].results[stat.result] = 0;
      }
      acc[stat.action].players[stat.playerName].results[stat.result]++;
      
      return acc;
    }, {});
  };

  // Add this helper function to get stats for a specific match
  const getMatchStats = (matchId) => {
    if (!detailedStats?.stats) return {};
    
    const matchStats = detailedStats.stats.filter(stat => stat.matchId === matchId);
    
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getUngroupedStats = () => {
    if (!detailedStats?.stats) return [];
    
    const filteredStats = detailedStats.stats
      .filter(stat => 
        (selectedMatches.length === 0 || selectedMatches.includes(stat.matchId)) &&
        (!searchTerm || 
          stat.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .map(stat => {
        const matchData = teamData?.matches?.find(m => m._id === stat.matchId);
        return {
          ...stat,
          date: matchData?.date || stat.date || new Date(),
          matchDisplay: {
            teamName: teamData?.name || 'Blich',
            opponent: matchData?.opponent || '',
            location: matchData?.location || ''
          }
        };
      });

    // Sort the filtered stats
    return filteredStats.sort((a, b) => {
      switch(sortField) {
        case 'date':
          return sortDirection === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        case 'match':
          const matchA = `${a.matchDisplay.teamName} vs ${a.matchDisplay.opponent}`.toLowerCase();
          const matchB = `${b.matchDisplay.teamName} vs ${b.matchDisplay.opponent}`.toLowerCase();
          return sortDirection === 'asc' 
            ? matchA.localeCompare(matchB)
            : matchB.localeCompare(matchA);
        default:
          const valueA = (a[sortField] || '').toLowerCase();
          const valueB = (b[sortField] || '').toLowerCase();
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
      }
    });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!teamData) return <Typography>No team data found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Players" />
          <Tab label="Matches" />
          <Tab label="Statistics" />
        </Tabs>

        {/* Players Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            {teamData.players.map((player) => (
              <Grid item xs={12} sm={6} md={4} key={player._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{player.firstName[0]}</Avatar>
                      <Typography variant="h6">
                        {player.firstName} {player.lastName}
                      </Typography>
                    </Box>
                    <Typography>Position: {player.position}</Typography>
                    <Typography>Jersey: #{player.jerseyNumber}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Matches Tab */}
        <TabPanel value={value} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.matches.map((match) => (
                  <TableRow key={match._id}>
                    <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell>{match.location}</TableCell>
                    <TableCell>{match.score.us} - {match.score.them}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={value} index={2}>
          <NoSelectBox>
            <Typography variant="h6" gutterBottom>Team Statistics</Typography>
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Matches
                    </Typography>
                    <Typography variant="h5">
                      {teamData?.matches?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Wins
                    </Typography>
                    <Typography variant="h5">
                      {teamData?.wins || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Losses
                    </Typography>
                    <Typography variant="h5">
                      {teamData?.losses || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Win Rate
                    </Typography>
                    <Typography variant="h5">
                      {((teamData?.wins / (teamData?.wins + teamData?.losses)) * 100 || 0).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Match Selection and Compare */}
            <NoSelectBox sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Matches</InputLabel>
                <Select
                  multiple
                  value={selectedMatches}
                  onChange={(e) => {
                    setSelectedMatches(e.target.value);
                    if (e.target.value.length === 0) {
                      setSelectedMatch('all');
                      setCompareMode(false);
                    } else if (e.target.value.length === 1) {
                      setSelectedMatch(e.target.value[0]);
                      setCompareMode(false);
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) return 'All Matches';
                    return `${selected.length} match${selected.length > 1 ? 'es' : ''} selected`;
                  }}
                  label="Select Matches"
                >
                  {teamData?.matches?.map(match => (
                    <MenuItem key={match._id} value={match._id}>
                      <Checkbox checked={selectedMatches.indexOf(match._id) > -1} />
                      <ListItemText 
                        primary={`${new Date(match.date).toLocaleDateString()} vs ${match.opponent}`}
                        secondary={match.location}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedMatches.length >= 2 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CompareArrowsIcon />}
                    onClick={() => setCompareMode(!compareMode)}
                    color={compareMode ? "primary" : "inherit"}
                  >
                    Compare
                  </Button>
                  {compareMode && (
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setCompareMode(false);
                        setSelectedMatches([]);
                        setSelectedMatch('all');
                      }}
                      sx={{ 
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </NoSelectBox>

            {/* Search Bar */}
            <NoSelectBox sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search by action, player, or result..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </NoSelectBox>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setShowGrouped(!showGrouped)}
                startIcon={showGrouped ? <ViewListIcon /> : <ViewModuleIcon />}
                size="small"
              >
                {showGrouped ? 'Show All Stats' : 'Group by Action'}
              </Button>
            </Box>

            {detailedStats && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '48px' }} />
                      <TableCell>Action</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Success Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(getFilteredStats()).map(([action, data]) => (
                      <React.Fragment key={action}>
                        {/* Main Action Row */}
                        <TableRow 
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: expandedAction === action ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                          }}
                          onClick={() => setExpandedAction(expandedAction === action ? null : action)}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {expandedAction === action ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{action}</TableCell>
                          <TableCell align="right">{data.total}</TableCell>
                          <TableCell align="right">
                            {formatPercentage(
                              Object.entries(data.results)
                                .filter(([result]) => SUCCESS_RESULTS[action]?.includes(result))
                                .reduce((sum, [_, count]) => sum + count, 0),
                              data.total
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Results Section */}
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 0 }}>
                            <Collapse in={expandedAction === action}>
                              <Box sx={{ py: 2 }}>
                                {Object.entries(data.results).map(([result, count]) => (
                                  <Paper 
                                    key={result}
                                    elevation={1}
                                    sx={{ 
                                      mb: 2,
                                      p: 2,
                                      backgroundColor: SUCCESS_RESULTS[action]?.includes(result) 
                                        ? 'rgba(76, 175, 80, 0.04)'  // Light green for success
                                        : result === 'Error' 
                                          ? 'rgba(211, 47, 47, 0.04)'  // Light red for errors
                                          : 'rgba(25, 118, 210, 0.04)', // Light blue for others
                                      border: '1px solid',
                                      borderColor: SUCCESS_RESULTS[action]?.includes(result)
                                        ? 'rgba(76, 175, 80, 0.2)'
                                        : result === 'Error'
                                          ? 'rgba(211, 47, 47, 0.2)'
                                          : 'rgba(25, 118, 210, 0.2)',
                                      borderRadius: 1
                                    }}
                                  >
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                                      {result}
                                    </Typography>
                                    <Grid container spacing={2} alignItems="center">
                                      <Grid item xs={12} md={4}>
                                        <Typography variant="body1">
                                          Count: <strong>{count}</strong>
                                        </Typography>
                                        <Typography variant="body1">
                                          Percentage: <strong>{formatPercentage(count, data.total)}</strong>
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} md={8}>
                                        <Typography variant="subtitle2" gutterBottom>Players:</Typography>
                                        <Box sx={{ pl: 2 }}>
                                          {Object.entries(data.players)
                                            .filter(([_, playerData]) => playerData.results[result])
                                            .sort((a, b) => b[1].results[result] - a[1].results[result])
                                            .map(([playerName, playerData]) => (
                                              <Box 
                                                key={playerName} 
                                                sx={{ 
                                                  display: 'flex', 
                                                  justifyContent: 'space-between',
                                                  py: 0.5,
                                                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                                }}
                                              >
                                                <Typography>{playerName}</Typography>
                                                <Typography>
                                                  {playerData.results[result]} ({formatPercentage(playerData.results[result], playerData.total)})
                                                </Typography>
                                              </Box>
                                            ))}
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </NoSelectBox>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default MyTeamPage; 