import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button,
  Box,
  Paper,
  Grid
} from '@mui/material';
import SportVolleyballIcon from '@mui/icons-material/SportsVolleyball';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar 
          position="static" 
          elevation={1} 
          sx={{ 
            backgroundColor: 'primary.main',
            backgroundImage: 'linear-gradient(to right, #1976d2, #1565c0)'
          }}
        >
          <Toolbar>
            <Container maxWidth="lg">
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportVolleyballIcon sx={{ color: 'white' }} />
                  <Typography 
                    variant="h5" 
                    component="h1" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 600
                    }}
                  >
                    Volleyball Stats Tracker
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              </Box>
            </Container>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Track Your Volleyball Performance
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Record, analyze, and improve your game with our comprehensive statistics tracking system
            </Typography>
            <Button variant="contained" size="large" sx={{ mr: 2 }}>
              Get Started
            </Button>
            <Button variant="outlined" size="large">
              Learn More
            </Button>
          </Box>

          {/* Features Section */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              {
                title: "Real-time Stats Recording",
                description: "Record plays, scores, and performance metrics as the game happens."
              },
              {
                title: "Detailed Analytics",
                description: "Get insights into your team's performance with comprehensive statistics."
              },
              {
                title: "Team Management",
                description: "Manage your team roster and track individual player progress."
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;