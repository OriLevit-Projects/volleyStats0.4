import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box
} from '@mui/material';
import { getAllTeams } from '../services/team.service';

function EditUserModal({ open, handleClose, user, handleSave }) {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState(user ? {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    team: user.team,
    position: user.position,
    jerseyNumber: user.jerseyNumber
  } : {});

  const positions = [
    'Outside Hitter',
    'Middle Blocker',
    'Setter',
    'Opposite',
    'Libero'
  ];

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const teamsData = await getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Team"
                name="team"
                value={formData.team}
                onChange={handleChange}
              >
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team.name}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
              >
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Jersey Number"
                name="jerseyNumber"
                type="number"
                value={formData.jerseyNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => handleSave(formData)} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserModal; 