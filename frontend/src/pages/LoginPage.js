import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth.service';

function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false
  });

  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Real-time validation for email
    if (name === 'email') {
      setErrors(prevState => ({
        ...prevState,
        email: value && !isValidEmail(value)
      }));
    } else {
      setErrors(prevState => ({
        ...prevState,
        [name]: false
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear any previous error messages
    setErrorMessage('');

    const newErrors = {
      email: !formData.email || !isValidEmail(formData.email),
      password: !formData.password
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login response:', response);
      authLogin(response.user);
      navigate('/');
    } catch (error) {
      console.error('Login error details:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 4,
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '500px',
        mx: 'auto',
        outline: 'none',
        userSelect: 'none'
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: 'primary.main',
            letterSpacing: '-0.5px',
            textAlign: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '200px',
              height: '3px',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              borderRadius: '2px',
              margin: '8px auto 0',
            }
          }}
        >
          Welcome Back
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
          Sign in to continue tracking your stats
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          noValidate 
          sx={{ width: '100%' }}
        >
          {errorMessage && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                width: '100%',
                borderRadius: 2
              }}
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>
          )}
          <TextField
            margin="normal"
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText={errors.password ? "Password is required" : ""}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
              }
            }}
          >
            Sign In
          </Button>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mt: 2 }}
          >
            Don't have an account? <Button 
              onClick={() => navigate('/signup')}
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
              Sign up
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;