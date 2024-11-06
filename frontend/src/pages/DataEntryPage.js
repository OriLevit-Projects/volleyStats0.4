import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';

function DataEntryPage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [showStatEntry, setShowStatEntry] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token ? 'exists' : 'not found');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    fetchUserAndTeam();
  }, []);

  const fetchUserAndTeam = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching user data...');
      const response = await axios.get('/api/users/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User data received:', response.data);
      setUser(response.data);

      if (response.data.team) {
        console.log('Fetching team data for team:', response.data.team);
        const teamResponse = await axios.get(`/api/teams/name/${response.data.team}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Team data received:', teamResponse.data);
        setTeam(teamResponse.data);
        setMatches(teamResponse.data.matches || []);
      } else {
        console.log('No team associated with user');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Error loading user data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (event) => {
    setSelectedMatch(event.target.value);
    setShowStatEntry(true);
  };

  const formatMatchDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography>Loading data...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography>No user data available</Typography>
        </Paper>
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography>User found but no team data available. User team: {user.team || 'None'}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Data Entry for {team.name}
        </Typography>

        {!showStatEntry ? (
          <Box sx={{ minWidth: 120, mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Match</InputLabel>
              <Select
                value={selectedMatch}
                label="Select Match"
                onChange={handleMatchSelect}
              >
                {matches.map((match, index) => (
                  <MenuItem key={index} value={match}>
                    {formatMatchDate(match.date)} vs {match.opponent} - {match.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Match Details:
            </Typography>
            <Typography>
              Date: {formatMatchDate(selectedMatch.date)}
              <br />
              Opponent: {selectedMatch.opponent}
              <br />
              Location: {selectedMatch.location}
              <br />
              Score: {selectedMatch.score.us} - {selectedMatch.score.them}
            </Typography>

            {/* Your existing stat entry form goes here */}
            
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => {
                setSelectedMatch('');
                setShowStatEntry(false);
              }}
            >
              Select Different Match
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default DataEntryPage;