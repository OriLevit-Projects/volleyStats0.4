import { Typography, Container, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8, userSelect: 'none' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold',
          }}
        >
          {user 
            ? `Welcome back, ${user.firstName}!`
            : "Track Your Volleyball Performance"
          }
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          {user
            ? "Ready to log your next match?"
            : "Record, analyze, and improve your game with our comprehensive statistics tracking system"
          }
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/log-match')}
            >
              Log Match Data
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/my-team')}
            >
              View My Team
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Learn More
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {[
          {
            title: user ? "Quick Match Entry" : "Real-time Stats Recording",
            description: user 
              ? "Log your match statistics quickly and efficiently."
              : "Record plays, scores, and performance metrics as the game happens."
          },
          {
            title: "Detailed Analytics",
            description: user
              ? "View your personal and team performance trends."
              : "Get insights into your team's performance with comprehensive statistics."
          },
          {
            title: user ? "Team Overview" : "Team Management",
            description: user
              ? `Track ${user.team}'s progress and player stats.`
              : "Manage your team roster and track individual player progress."
          }
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'default'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold',
                }}
              >
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
  );
}

export default HomePage;