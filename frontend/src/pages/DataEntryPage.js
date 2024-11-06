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
import { styled } from '@mui/material/styles';
import axios from 'axios';
import StatEntry from '../components/StatEntry';

const NoSelectContainer = styled(Container)({
  userSelect: 'none',
  cursor: 'default'
});

const StyledPaper = styled(Paper)({
  padding: '24px',
  marginTop: '24px',
  backgroundColor: '#ffffff',
  '& *': {
    userSelect: 'none'
  }
});

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

  const handleStatSubmit = async (stat) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/stats', stat, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Optionally refresh match data or show success message
    } catch (error) {
      console.error('Error submitting stat:', error);
      setError('Failed to submit stat');
    }
  };

  if (loading) {
    return (
      <NoSelectContainer maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography>Loading data...</Typography>
        </StyledPaper>
      </NoSelectContainer>
    );
  }

  if (error) {
    return (
      <NoSelectContainer maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography color="error">Error: {error}</Typography>
        </StyledPaper>
      </NoSelectContainer>
    );
  }

  if (!user) {
    return (
      <NoSelectContainer maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography>No user data available</Typography>
        </StyledPaper>
      </NoSelectContainer>
    );
  }

  if (!team) {
    return (
      <NoSelectContainer maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography>User found but no team data available. User team: {user.team || 'None'}</Typography>
        </StyledPaper>
      </NoSelectContainer>
    );
  }

  return (
    <NoSelectContainer maxWidth="md">
      <StyledPaper elevation={3}>
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
          <>
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
            </Box>

            <StatEntry 
              match={selectedMatch}
              team={team}
              players={team.players}
              onStatSubmit={handleStatSubmit}
            />
            
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
          </>
        )}
      </StyledPaper>
    </NoSelectContainer>
  );
}

export default DataEntryPage;