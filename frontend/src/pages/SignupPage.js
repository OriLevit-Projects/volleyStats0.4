import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth.service';
import { getAllTeams } from '../services/team.service';

function SignupPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    team: '',
    position: '',
    jerseyNumber: ''
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    team: false,
    position: false,
    jerseyNumber: false
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const teamsData = await getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      setErrorMessage('Error loading teams. Please try again later.');
    }
  };

  const positions = [
    'Outside Hitter',
    'Middle Blocker',
    'Setter',
    'Opposite',
    'Libero'
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Validation
    const newErrors = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !/\S+@\S+\.\S+/.test(formData.email),
      password: !formData.password || formData.password.length < 6,
      confirmPassword: formData.password !== formData.confirmPassword,
      team: !formData.team,
      position: !formData.position,
      jerseyNumber: !formData.jerseyNumber || formData.jerseyNumber < 0
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      await signup(formData);
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sign Up
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={errors.firstName}
            helperText={errors.firstName && 'First name is required'}
          />

          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={errors.lastName}
            helperText={errors.lastName && 'Last name is required'}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            helperText={errors.email && 'Valid email is required'}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            helperText={errors.password && 'Password must be at least 6 characters'}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            helperText={errors.confirmPassword && 'Passwords do not match'}
          />

          <TextField
            select
            fullWidth
            label="Team"
            margin="normal"
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            error={errors.team}
            helperText={errors.team && 'Team is required'}
          >
            <MenuItem value="None">None</MenuItem>
            {teams.map((team) => (
              <MenuItem key={team._id} value={team.name}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Position"
            margin="normal"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            error={errors.position}
            helperText={errors.position && 'Position is required'}
          >
            {positions.map((position) => (
              <MenuItem key={position} value={position}>
                {position}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Jersey Number"
            type="number"
            margin="normal"
            value={formData.jerseyNumber}
            onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
            error={errors.jerseyNumber}
            helperText={errors.jerseyNumber && 'Valid jersey number is required'}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignupPage;