import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button,
  Box,
} from '@mui/material';
import SportVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

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

function NavBar() {
  const navigate = useNavigate();

  return (
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
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/')}
            >
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
                onClick={() => navigate('/login')}
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
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;