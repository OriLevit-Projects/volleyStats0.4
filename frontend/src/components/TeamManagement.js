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
    date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    location: '',
    opponent: '',
    score: { us: 0, them: 0 }
  });
  const [dialogTab, setDialogTab] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);

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

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      players: selectedPlayers
    };
    
    if (selectedTeam) {
      onUpdateTeam(selectedTeam._id, updatedData);
    } else {
      onCreateTeam(updatedData);
    }
    handleClose();
  };

  const handleAddMatch = (teamId) => {
    const updatedTeam = teams.find(t => t._id === teamId);
    if (updatedTeam) {
      updatedTeam.matches = [...updatedTeam.matches, matchData];
      onUpdateTeam(teamId, updatedTeam);
      setMatchDialogOpen(false);
      setMatchData({
        date: new Date().toISOString().split('T')[0],
        location: '',
        opponent: '',
        score: { us: 0, them: 0 }
      });
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {team.matches?.map((match, index) => (
                              <TableRow key={index}>
                                <TableCell>{formatDate(match.date)}</TableCell>
                                <TableCell>{match.location}</TableCell>
                                <TableCell>{match.opponent}</TableCell>
                                <TableCell>{`${match.score.us} - ${match.score.them}`}</TableCell>
                              </TableRow>
                            ))}
                            {(!team.matches || team.matches.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
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
      <Dialog open={matchDialogOpen} onClose={() => setMatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Match</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              type="date"
              label="Match Date"
              value={matchData.date}
              onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Location"
              value={matchData.location}
              onChange={(e) => setMatchData({ ...matchData, location: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Opponent"
              value={matchData.opponent}
              onChange={(e) => setMatchData({ ...matchData, opponent: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Our Score"
                  fullWidth
                  value={matchData.score.us}
                  onChange={(e) => setMatchData({
                    ...matchData,
                    score: { ...matchData.score, us: parseInt(e.target.value) }
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Their Score"
                  fullWidth
                  value={matchData.score.them}
                  onChange={(e) => setMatchData({
                    ...matchData,
                    score: { ...matchData.score, them: parseInt(e.target.value) }
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleAddMatch(expandedTeam)} variant="contained">
            Add Match
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamManagement; 