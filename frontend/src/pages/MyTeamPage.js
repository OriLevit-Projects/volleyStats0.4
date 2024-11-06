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
import { VOLLEYBALL_ACTIONS } from '../utils/statConstants';
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
                  {showGrouped ? (
                    // Existing grouped view
                    <>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '48px', padding: '6px' }} />
                          <TableCell>Action</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(getFilteredStats()).map(([action, data]) => {
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
                                  {data.total}
                                </TableCell>
                              </TableRow>

                              {/* Expanded Details Row */}
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ 
                                      margin: 2,
                                      backgroundColor: '#fff',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(25, 118, 210, 0.3)',
                                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}>
                                      {/* Blue accent bar at the top */}
                                      <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        backgroundColor: 'primary.main',
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px'
                                      }} />

                                      <Box sx={{ p: 3 }}>
                                        <Typography 
                                          variant="h6" 
                                          gutterBottom 
                                          component="div"
                                          sx={{ 
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            mb: 2
                                          }}
                                        >
                                          Detailed Results
                                        </Typography>
                                        
                                        <TableContainer sx={{ 
                                          backgroundColor: 'background.paper',
                                          borderRadius: '4px',
                                          border: '1px solid rgba(224, 224, 224, 1)'
                                        }}>
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>Player</TableCell>
                                                <TableCell>Result</TableCell>
                                                <TableCell align="right">Count</TableCell>
                                                <TableCell align="right">Percentage</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {Object.entries(data.players).map(([playerName, playerData]) => (
                                                Object.entries(playerData.results).map(([result, count]) => (
                                                  <TableRow 
                                                    key={`${playerName}-${result}`}
                                                    sx={{
                                                      '&:last-child td, &:last-child th': { border: 0 },
                                                      '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                      }
                                                    }}
                                                  >
                                                    <TableCell 
                                                      component="th" 
                                                      scope="row"
                                                      sx={{ fontWeight: 500 }}
                                                    >
                                                      {playerName}
                                                    </TableCell>
                                                    <TableCell>{getFormattedResult(action, result)}</TableCell>
                                                    <TableCell align="right">{count}</TableCell>
                                                    <TableCell 
                                                      align="right"
                                                      sx={{ 
                                                        color: 'text.secondary',
                                                        fontWeight: 500
                                                      }}
                                                    >
                                                      {formatPercentage(count, playerData.total)}
                                                    </TableCell>
                                                  </TableRow>
                                                ))
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      </Box>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </>
                  ) : (
                    // New ungrouped view
                    <>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            onClick={() => handleSort('date')}
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              borderBottom: '2px solid rgba(224, 224, 224, 1)',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableCell>
                          <TableCell 
                            onClick={() => handleSort('match')}
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              borderBottom: '2px solid rgba(224, 224, 224, 1)',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            Match {sortField === 'match' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableCell>
                          <TableCell 
                            onClick={() => handleSort('playerName')}
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              borderBottom: '2px solid rgba(224, 224, 224, 1)',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            Player {sortField === 'playerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableCell>
                          <TableCell 
                            onClick={() => handleSort('action')}
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              borderBottom: '2px solid rgba(224, 224, 224, 1)',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            Action {sortField === 'action' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableCell>
                          <TableCell 
                            onClick={() => handleSort('result')}
                            sx={{ 
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              borderBottom: '2px solid rgba(224, 224, 224, 1)',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            Result {sortField === 'result' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getUngroupedStats().map((stat, index) => (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <TableCell>
                              {new Date(stat.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              {`${stat.matchDisplay.teamName} vs ${stat.matchDisplay.opponent}`}
                              {stat.matchDisplay.location && ` (${stat.matchDisplay.location})`}
                            </TableCell>
                            <TableCell>{stat.playerName || 'Unknown Player'}</TableCell>
                            <TableCell>{stat.action}</TableCell>
                            <TableCell>{getFormattedResult(stat.action, stat.result)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}
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