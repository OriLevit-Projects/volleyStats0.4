import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Collapse,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import '../styles/AdminDashboard.css';
import axios from 'axios';

function TeamManagement({ teams, users, onCreateTeam, onUpdateTeam, onDeleteTeam, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    wins: 0,
    losses: 0,
    players: []
  });
  const [matchData, setMatchData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    opponent: '',
    score: { us: 0, them: 0 },
    videoUrl: ''
  });
  const [dialogTab, setDialogTab] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [editMatchDialogOpen, setEditMatchDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    // Initialize filtered players with all users
    setFilteredPlayers(users || []);
  }, [users]);

  const handleOpen = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        wins: team.wins || 0,
        losses: team.losses || 0
      });
      setSelectedPlayers(team.players?.map(player => player._id) || []);
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        wins: 0,
        losses: 0
      });
      setSelectedPlayers([]);
    }
    // Reset search when opening dialog
    setSearchQuery('');
    setFilteredPlayers(users || []);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
    setDialogTab(0); // Reset to first tab
    setSearchQuery(''); // Reset search
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Team name is required');
        return;
      }

      if (selectedTeam) {
        // Update existing team
        await onUpdateTeam(selectedTeam._id, {
          name: formData.name.trim(),
          players: selectedPlayers // Array of selected player IDs
        });
      } else {
        // Create new team
        await onCreateTeam({
          name: formData.name.trim(),
          players: selectedPlayers
        });
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        wins: 0,
        losses: 0
      });
      setSelectedPlayers([]);
      setSelectedTeam(null);
      handleClose();

    } catch (error) {
      console.error('Error submitting team:', error);
      alert(error.message || 'Error submitting team');
    }
  };

  const handleAddMatch = async (team) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/teams/my-team/matches',
        {
          ...matchData,
          date: new Date(matchData.date),
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Reset form and refresh data
      setMatchData({
        date: new Date().toISOString().split('T')[0],
        location: '',
        opponent: '',
        score: { us: 0, them: 0 },
        videoUrl: ''
      });
      setMatchDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding match:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleRowClick = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchQuery(searchTerm);
    
    if (!searchTerm.trim()) {
      setFilteredPlayers(users || []);
    } else {
      setFilteredPlayers(
        users.filter(user => 
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        )
      );
    }
  };

  const handleEditMatch = (match, teamId) => {
    setSelectedMatch({ ...match, teamId });
    setEditMatchDialogOpen(true);
  };

  const handleDeleteMatch = async (matchId, teamId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        const team = teams.find(t => t._id === teamId);
        if (!team) return;

        // Filter out the match to delete
        const updatedMatches = team.matches.filter(match => match._id !== matchId);

        const response = await axios.put(
          `/api/teams/${teamId}`,
          { matches: updatedMatches },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Error deleting match');
      }
    }
  };

  const handleUpdateMatch = async (teamId, matchData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/teams/my-team/matches/${matchData._id}`,
        {
          ...matchData,
          date: new Date(matchData.date)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setEditMatchDialogOpen(false);
      setSelectedMatch(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  return (
    <Box sx={{ mt: 3 }} className="no-select">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Teams</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Team
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-cell">Team Name</TableCell>
              <TableCell className="table-cell" align="center">Wins</TableCell>
              <TableCell className="table-cell" align="center">Losses</TableCell>
              <TableCell className="table-cell">Players</TableCell>
              <TableCell className="table-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <>
                <TableRow 
                  key={team._id}
                  onClick={() => handleRowClick(team._id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    backgroundColor: expandedTeam === team._id ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                  }}
                >
                  <TableCell className="table-cell">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking the icon
                          handleRowClick(team._id);
                        }}
                      >
                        {expandedTeam === team._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      {team.name}
                    </Box>
                  </TableCell>
                  <TableCell className="table-cell" align="center">{team.wins}</TableCell>
                  <TableCell className="table-cell" align="center">{team.losses}</TableCell>
                  <TableCell className="table-cell">{team.players?.length || 0} players</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking edit
                        handleOpen(team);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking delete
                        onDeleteTeam(team._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedTeam === team._id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div" sx={{ mt: 3 }}>
                          Players
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell className="table-cell">Name</TableCell>
                              <TableCell className="table-cell">Position</TableCell>
                              <TableCell className="table-cell">Jersey #</TableCell>
                              <TableCell className="table-cell">Email</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {team.players?.map((player) => (
                              <TableRow key={player._id}>
                                <TableCell className="table-cell">{`${player.firstName} ${player.lastName}`}</TableCell>
                                <TableCell className="table-cell">{player.position}</TableCell>
                                <TableCell className="table-cell">{player.jerseyNumber}</TableCell>
                                <TableCell className="table-cell">{player.email}</TableCell>
                              </TableRow>
                            ))}
                            {(!team.players || team.players.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={4} align="center" className="table-cell">
                                  No players in this team
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>

                        <Typography variant="h6" gutterBottom component="div" sx={{ mt: 3 }}>
                          Match History
                        </Typography>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setMatchDialogOpen(true)}
                          >
                            Add Match
                          </Button>
                        </Box>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Opponent</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {team.matches?.map((match) => (
                              <TableRow key={match._id}>
                                <TableCell>{formatDate(match.date)}</TableCell>
                                <TableCell>{match.location}</TableCell>
                                <TableCell>{match.opponent}</TableCell>
                                <TableCell>{`${match.score.us} - ${match.score.them}`}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMatch(match, team._id);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMatch(match._id, team._id);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(!team.matches || team.matches.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  No matches recorded
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Updated Team Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ cursor: 'default' }}>
          {selectedTeam ? 'Edit Team' : 'Create Team'}
        </DialogTitle>
        
        <Tabs
          value={dialogTab}
          onChange={(e, newValue) => setDialogTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            px: 2,
            '& .MuiTab-root': { cursor: 'pointer' }
          }}
        >
          <Tab label="Team Details" />
          <Tab label="Players" />
        </Tabs>

        <DialogContent sx={{ pt: 3, cursor: 'default' }}>
          {dialogTab === 0 ? (
            // Team Details Tab
            <Box sx={{ cursor: 'default' }}>
              <TextField
                fullWidth
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input': { cursor: 'text' }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Wins"
                    value={formData.wins}
                    onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) })}
                    sx={{ '& .MuiInputBase-input': { cursor: 'text' } }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Losses"
                    value={formData.losses}
                    onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) })}
                    sx={{ '& .MuiInputBase-input': { cursor: 'text' } }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Players Tab
            <Box sx={{ cursor: 'default' }}>
              <TextField
                fullWidth
                label="Search Players"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearch}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input': { cursor: 'text' }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <List sx={{ 
                width: '100%', 
                bgcolor: 'background.paper', 
                maxHeight: 400, 
                overflow: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1
              }}>
                {filteredPlayers.map((player) => (
                  <ListItem
                    key={player._id}
                    dense
                    button
                    onClick={() => handlePlayerToggle(player._id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '& .MuiListItemText-root': {
                        cursor: 'pointer',
                        userSelect: 'none',
                        '& .MuiTypography-root': {
                          cursor: 'pointer',
                          userSelect: 'none'
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedPlayers.includes(player._id)}
                        tabIndex={-1}
                        disableRipple
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${player.firstName} ${player.lastName}`}
                      secondary={`${player.email} - ${player.position} - #${player.jerseyNumber}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', cursor: 'default' }}>
          <Button 
            onClick={handleClose}
            sx={{ cursor: 'pointer' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ cursor: 'pointer' }}
          >
            {selectedTeam ? 'Save Changes' : 'Create Team'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Match Dialog */}
      <Dialog 
        open={matchDialogOpen} 
        onClose={() => setMatchDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add Match</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              required
              type="date"
              label="Match Date"
              value={matchData.date}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('Setting date:', newValue);
                setMatchData(prev => ({ ...prev, date: newValue }));
              }}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              fullWidth
              label="Location"
              value={matchData.location}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Setting location:', value);
                setMatchData(prev => ({
                  ...prev,
                  location: value
                }));
              }}
              sx={{ mb: 2 }}
              error={!matchData.location}
              helperText={!matchData.location ? "Location is required" : ""}
            />
            <TextField
              required
              fullWidth
              label="Opponent"
              value={matchData.opponent}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Setting opponent:', value);
                setMatchData(prev => ({
                  ...prev,
                  opponent: value
                }));
              }}
              sx={{ mb: 2 }}
              error={!matchData.opponent}
              helperText={!matchData.opponent ? "Opponent is required" : ""}
            />
            <TextField
              fullWidth
              label="YouTube Video URL"
              value={matchData.videoUrl || ''}
              onChange={(e) => {
                setMatchData(prev => ({
                  ...prev,
                  videoUrl: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
              helperText="Enter the YouTube video URL for this match (optional)"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Our Score"
                  value={matchData.score.us}
                  onChange={(e) => {
                    console.log('Our score changed:', e.target.value);
                    setMatchData(prev => ({
                      ...prev,
                      score: { ...prev.score, us: e.target.value }
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Their Score"
                  value={matchData.score.them}
                  onChange={(e) => {
                    console.log('Their score changed:', e.target.value);
                    setMatchData(prev => ({
                      ...prev,
                      score: { ...prev.score, them: e.target.value }
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleAddMatch(expandedTeam)}
            variant="contained"
            disabled={!matchData.location || !matchData.opponent}
          >
            Add Match
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog 
        open={editMatchDialogOpen} 
        onClose={() => {
          setEditMatchDialogOpen(false);
          setSelectedMatch(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Match</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              required
              type="date"
              label="Match Date"
              value={selectedMatch ? selectedMatch.date.split('T')[0] : ''}
              onChange={(e) => {
                setSelectedMatch(prev => ({
                  ...prev,
                  date: e.target.value
                }));
              }}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              fullWidth
              label="Location"
              value={selectedMatch?.location || ''}
              onChange={(e) => {
                setSelectedMatch(prev => ({
                  ...prev,
                  location: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              required
              fullWidth
              label="Opponent"
              value={selectedMatch?.opponent || ''}
              onChange={(e) => {
                setSelectedMatch(prev => ({
                  ...prev,
                  opponent: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="YouTube Video URL"
              value={selectedMatch?.videoUrl || ''}
              onChange={(e) => {
                setSelectedMatch(prev => ({
                  ...prev,
                  videoUrl: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
              helperText="Enter the YouTube video URL for this match (optional)"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Our Score"
                  value={selectedMatch?.score.us || 0}
                  onChange={(e) => {
                    setSelectedMatch(prev => ({
                      ...prev,
                      score: {
                        ...prev.score,
                        us: parseInt(e.target.value) || 0
                      }
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Their Score"
                  value={selectedMatch?.score.them || 0}
                  onChange={(e) => {
                    setSelectedMatch(prev => ({
                      ...prev,
                      score: {
                        ...prev.score,
                        them: parseInt(e.target.value) || 0
                      }
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditMatchDialogOpen(false);
              setSelectedMatch(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdateMatch(selectedMatch.teamId, selectedMatch)}
            variant="contained"
            disabled={!selectedMatch?.location || !selectedMatch?.opponent}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamManagement; 