import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container,
  MenuItem,
  Grid,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasMinLength = password.length >= 8;
  return hasNumber && hasUpperCase && hasMinLength;
};

function SignupForm() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Form state
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

  // Error state
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

  const teams = [
    "Team Rockets",
    "Volleyball Masters",
    "Spike Elite",
    "Power Hitters",
    "Beach Kings"
  ];

  const positions = [
    "Outside Hitter",
    "Middle Blocker",
    "Setter",
    "Opposite",
    "Libero"
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Real-time validation
    if (name === 'email') {
      setErrors(prevState => ({
        ...prevState,
        email: value && !isValidEmail(value)
      }));
    } 
    else if (name === 'password') {
      setErrors(prevState => ({
        ...prevState,
        password: value && !isValidPassword(value),
        // Also check confirm password match if it exists
        confirmPassword: formData.confirmPassword && value !== formData.confirmPassword
      }));
    }
    else if (name === 'confirmPassword') {
      setErrors(prevState => ({
        ...prevState,
        confirmPassword: value && value !== formData.password
      }));
    }
    else {
      // Clear error for other fields when user starts typing
      setErrors(prevState => ({
        ...prevState,
        [name]: false
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Check for empty fields and email format
    const newErrors = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !isValidEmail(formData.email),
      password: !formData.password || !isValidPassword(formData.password),
      confirmPassword: !formData.confirmPassword || formData.password !== formData.confirmPassword,
      team: !formData.team,
      position: !formData.position,
      jerseyNumber: !formData.jerseyNumber
    };

    setErrors(newErrors);

    // If any error exists, don't proceed
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    console.log('Form submitted:', formData);
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '500px',
          mx: 'auto',
          outline: 'none',
          userSelect: 'none'
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: theme.palette.primary.main,
            letterSpacing: '-0.5px',
            textAlign: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '200px',
              height: '3px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              borderRadius: '2px',
              margin: '8px auto 0',
            }
          }}
        >
          Create Account
        </Typography>
        <Typography 
          variant="subtitle1"
          sx={{ 
            color: 'text.secondary',
            fontSize: '1rem',
            mb: 3,
            textAlign: 'center',
            maxWidth: '100%',
            lineHeight: 1.4,
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          Join us to start tracking your volleyball journey
        </Typography>

        <Box 
          component="form" 
          noValidate 
          sx={{ 
            width: '100%',
            '& .MuiTextField-root': { mb: 1.5 },
          }}
        >
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                helperText={errors.firstName ? "First name is required" : ""}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                helperText={errors.lastName ? "Last name is required" : ""}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                helperText={
                  errors.email 
                    ? (!formData.email 
                        ? "Email is required" 
                        : "Please enter a valid email address (example@domain.com)")
                    : ""
                }
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                helperText={
                  !formData.password 
                    ? "Password must contain at least 8 characters, one number, and one uppercase letter"
                    : errors.password 
                      ? `Password must contain: ${[
                          formData.password.length < 8 ? "at least 8 characters" : null,
                          !/\d/.test(formData.password) ? "a number" : null,
                          !/[A-Z]/.test(formData.password) ? "an uppercase letter" : null
                        ].filter(Boolean).join(", ")}`
                      : "" // No message if all requirements are met
                }
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                helperText={
                  errors.confirmPassword
                    ? "Passwords do not match"
                    : formData.confirmPassword 
                      ? "Passwords match!" 
                      : "Please confirm your password"
                }
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                error={errors.team}
                helperText={errors.team ? "Team selection is required" : ""}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
                helperText={errors.position ? "Position selection is required" : ""}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                {positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Jersey Number"
                name="jerseyNumber"
                type="number"
                value={formData.jerseyNumber}
                onChange={handleChange}
                error={errors.jerseyNumber}
                helperText={errors.jerseyNumber ? "Jersey number is required" : ""}
                variant="outlined"
                InputProps={{ 
                  inputProps: { min: 0, max: 99 }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              mt: 2,
              mb: 1.5,
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, #1565c0)`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, #1565c0)`,
              }
            }}
          >
            Create Account
          </Button>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mt: 1 }}
          >
            Already have an account? <Button 
              onClick={() => navigate('/login')}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                py: 0,
                '&:hover': {
                  background: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default SignupForm;