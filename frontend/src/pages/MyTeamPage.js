import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MyTeamPage() {
  const [value, setValue] = useState(0);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teams/my-team', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTeamData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching team data');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!teamData) return <Typography>No team data found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Players" />
          <Tab label="Matches" />
          <Tab label="Statistics" />
        </Tabs>

        {/* Players Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            {teamData.players.map((player) => (
              <Grid item xs={12} sm={6} md={4} key={player._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{player.firstName[0]}</Avatar>
                      <Typography variant="h6">
                        {player.firstName} {player.lastName}
                      </Typography>
                    </Box>
                    <Typography>Position: {player.position}</Typography>
                    <Typography>Jersey: #{player.jerseyNumber}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Matches Tab */}
        <TabPanel value={value} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.matches.map((match) => (
                  <TableRow key={match._id}>
                    <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell>{match.location}</TableCell>
                    <TableCell>{match.score.us} - {match.score.them}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={value} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Team Statistics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary">Total Matches</Typography>
                    <Typography variant="h4">{teamData.matches.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary">Wins</Typography>
                    <Typography variant="h4">{teamData.wins}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary">Losses</Typography>
                    <Typography variant="h4">{teamData.losses}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary">Win Rate</Typography>
                    <Typography variant="h4">
                      {((teamData.wins / (teamData.wins + teamData.losses)) * 100 || 0).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default MyTeamPage; 