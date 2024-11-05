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
  Divider
} from '@mui/material';

function DataEntryPage() {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const actions = {
    Serve: ['Ace', 'Out of System', 'Serve Error', 'In Play'],
    Spike: ['Kill', 'Error', 'Blocked', 'In Play'],
    Dig: ['Perfect Pass', 'Out of System Pass', 'Error'],
    Block: ['Stuff Block', 'Touch', 'Error'],
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
                      onClick={() => {
                        console.log(`Recording ${selectedAction} - ${result} for ${selectedPlayer.firstName}`);
                        setSelectedAction(null);
                        setSelectedPlayer(null);
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
      </Paper>
    </Container>
  );
}

export default DataEntryPage;