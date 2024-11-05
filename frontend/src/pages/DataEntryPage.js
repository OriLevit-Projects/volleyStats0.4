import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Divider
} from '@mui/material';

function DataEntryPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const actions = {
    Serve: ['Ace', 'Out of System', 'Serve Error', 'In Play'],
    Spike: ['Kill', 'Error', 'Blocked', 'In Play'],
    Dig: ['Perfect Pass', 'Out of System Pass', 'Error'],
    Block: ['Stuff Block', 'Touch', 'Error'],
    Set: ['Perfect Set', 'Off Set', 'Error']
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Record Match Data
        </Typography>

        {/* Players Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Player
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => setSelectedPlayer("Player 1")}
                sx={{ minWidth: '120px' }}
              >
                Player 1
              </Button>
            </Grid>
            {/* Add more player buttons as needed */}
          </Grid>
        </Box>

        {/* Actions Section */}
        {selectedPlayer && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Action
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(actions).map((action) => (
                  <Grid item key={action}>
                    <Button
                      variant={selectedAction === action ? "contained" : "outlined"}
                      onClick={() => setSelectedAction(action)}
                      sx={{ minWidth: '120px' }}
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
              <Typography variant="h6" gutterBottom>
                Select Result
              </Typography>
              <Grid container spacing={2}>
                {actions[selectedAction].map((result) => (
                  <Grid item key={result}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        console.log(`Recording ${selectedAction} - ${result} for ${selectedPlayer}`);
                        setSelectedAction(null);
                        setSelectedPlayer(null);
                      }}
                      sx={{ minWidth: '120px' }}
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