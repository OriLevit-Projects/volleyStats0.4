import { Typography, Container, Button, Box, Grid, Paper } from '@mui/material';

function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8, userSelect: 'none' }}>
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
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', cursor: 'default' }}>
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
  );
}

export default HomePage;