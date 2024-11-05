import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  console.log('Current user:', user);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          userSelect: 'none'
        }}>
          {/* Left side - Logo and Title */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <SportsVolleyballIcon />
            <Typography variant="h6" component="div">
              Volleyball Stats Tracker
            </Typography>
          </Box>

          {/* Right side - Navigation and Profile */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            {user ? (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/log-match')}
                >
                  Log Match Data
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/my-team')}
                >
                  My Team
                </Button>
                {user.isAdmin && (
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/admin')}
                    sx={{ 
                      bgcolor: 'primary.dark',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        opacity: 0.9
                      }
                    }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ 
                    ml: 1,
                    border: '2px solid white',
                    borderRadius: '50%',
                    padding: '4px'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: user.isAdmin ? 'secondary.main' : 'primary.dark'
                    }}
                  >
                    {user.firstName[0]}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <PersonIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 