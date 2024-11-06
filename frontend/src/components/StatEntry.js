import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const NoSelectBox = styled(Box)({
  userSelect: 'none',
  cursor: 'default',
  '& *': {
    userSelect: 'none'
  }
});

const StatEntry = ({ match, team }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedResult, setSelectedResult] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const actions = {
    'Serve': ['Ace', 'Error', 'In Play'],
    'Spike': ['Kill', 'Error', 'In Play'],
    'Dig': ['Good', 'Error', 'In Play'],
    'Block': ['Point', 'Touch', 'Error'],
    'Set': ['Assist', 'Error', 'In Play']
  };

  useEffect(() => {
    console.log('Current team data:', team);
    console.log('Current selected player:', selectedPlayer);
  }, [team, selectedPlayer]);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setSelectedAction('');
    setSelectedResult('');
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setSelectedResult('');
  };

  const handleResultSelect = async (result) => {
    try {
      const token = localStorage.getItem('token');
      
      const statData = {
        userId: selectedPlayer._id,
        team: team.name,
        action: selectedAction,
        result: result,
        playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
        matchId: match._id
      };

      console.log('Submitting stat data:', statData);

      const response = await axios.post('/api/stats', statData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      setSnackbar({
        open: true,
        message: 'Stat recorded successfully',
        severity: 'success'
      });

      setSelectedAction('');
      setSelectedResult('');
      
    } catch (error) {
      console.error('Error submitting stat:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error recording stat',
        severity: 'error'
      });
    }
  };

  const buttonStyle = {
    margin: '4px',
    minWidth: '100px'
  };

  const selectedButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1976d2',
    color: 'white'
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      {/* Players Section */}
      <NoSelectBox sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Player
        </Typography>
        <NoSelectBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {team.players?.map((player) => (
            <Button
              key={player._id}
              variant={selectedPlayer?._id === player._id ? "contained" : "outlined"}
              sx={selectedPlayer?._id === player._id ? selectedButtonStyle : buttonStyle}
              onClick={() => handlePlayerSelect(player)}
            >
              {player.jerseyNumber} - {player.firstName}
            </Button>
          ))}
        </NoSelectBox>
      </NoSelectBox>

      <Divider sx={{ my: 2 }} />

      {/* Actions Section */}
      {selectedPlayer && (
        <NoSelectBox sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Select Action
          </Typography>
          <NoSelectBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.keys(actions).map((action) => (
              <Button
                key={action}
                variant={selectedAction === action ? "contained" : "outlined"}
                sx={selectedAction === action ? selectedButtonStyle : buttonStyle}
                onClick={() => handleActionSelect(action)}
              >
                {action}
              </Button>
            ))}
          </NoSelectBox>
        </NoSelectBox>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Results Section */}
      {selectedAction && (
        <NoSelectBox sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Select Result
          </Typography>
          <NoSelectBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {actions[selectedAction].map((result) => (
              <Button
                key={result}
                variant="outlined"
                sx={buttonStyle}
                onClick={() => handleResultSelect(result)}
              >
                {result}
              </Button>
            ))}
          </NoSelectBox>
        </NoSelectBox>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StatEntry;