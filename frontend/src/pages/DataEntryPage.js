import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Alert,
  Divider,
  Snackbar
} from '@mui/material';

function DataEntryPage() {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const actions = {
    Serve: ['Ace', 'Out of System', 'Serve Error', 'In Play'],
    Spike: ['Kill', 'Block-out' ,'Error', 'Blocked', 'In Play'],
    Dig: ['Perfect Pass', 'Out of System Pass', 'Error'],
    Block: ['Kill Block', 'Soft Block', 'Error'],
    Set: ['Perfect Set', 'Off Set', 'Error']
  };

  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        if (user?.team) {
          const response = await axios.get(`/api/users/team/${encodeURIComponent(user.team)}`);
          setTeammates(response.data);
        }
      } catch (error) {
        console.error('Error fetching teammates:', error);
      }
    };

    fetchTeammates();
  }, [user?.team]);

  // Common styles
  const noSelectStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'default'
  };

  const buttonStyle = {
    minWidth: '120px',
    ...noSelectStyle,
    '&:hover': {
      cursor: 'pointer'
    }
  };

  const recordStat = async (player, action, result) => {
    try {
      const statData = {
        userId: player._id,
        team: user.team,
        action,
        result
      };
      
      await axios.post('/api/stats', statData);
      
      setSnackbar({
        open: true,
        message: `${action} - ${result} recorded for ${player.firstName}`,
        severity: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Error recording stat:', error);
      
      setSnackbar({
        open: true,
        message: 'Failed to record stat',
        severity: 'error'
      });
      
      return false;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, ...noSelectStyle }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={noSelectStyle}>
          Record Match Data
        </Typography>

        <Alert severity="info" sx={{ mb: 2, ...noSelectStyle }}>
          Current user: {user?.firstName} {user?.lastName}
          <br />
          Team: {user?.team || 'No team assigned'}
        </Alert>

        {/* Players Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={noSelectStyle}>
            Select Player
          </Typography>
          <Grid container spacing={2}>
            {teammates.map((player) => (
              <Grid item key={player._id}>
                <Button
                  variant={selectedPlayer?._id === player._id ? "contained" : "outlined"}
                  onClick={() => setSelectedPlayer(player)}
                  sx={buttonStyle}
                >
                  {`${player.firstName} ${player.lastName}`}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Actions Section */}
        {selectedPlayer && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={noSelectStyle}>
                Select Action
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(actions).map((action) => (
                  <Grid item key={action}>
                    <Button
                      variant={selectedAction === action ? "contained" : "outlined"}
                      onClick={() => setSelectedAction(action)}
                      sx={buttonStyle}
                    >
                      {action}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {/* Results Section */}
        {selectedAction && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={noSelectStyle}>
                Select Result
              </Typography>
              <Grid container spacing={2}>
                {actions[selectedAction].map((result) => (
                  <Grid item key={result}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        const success = await recordStat(selectedPlayer, selectedAction, result);
                        if (success) {
                          setSelectedAction(null);
                          setSelectedPlayer(null);
                        }
                      }}
                      sx={buttonStyle}
                    >
                      {result}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default DataEntryPage;