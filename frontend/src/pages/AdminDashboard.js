import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllUsers, updateUser, deleteUser } from '../services/admin.service';
import EditUserModal from '../components/EditUserModal';
import TeamManagement from '../components/TeamManagement';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '../services/admin.service';
import '../styles/AdminDashboard.css';

const UserManagement = ({ users, searchQuery, setSearchQuery, handleEditUser, handleDeleteUser }) => (
  <Box sx={{ mt: 3 }} className="no-select">
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search users..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      sx={{ mb: 3 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
    
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="table-cell">Name</TableCell>
            <TableCell className="table-cell">Email</TableCell>
            <TableCell className="table-cell">Team</TableCell>
            <TableCell className="table-cell">Position</TableCell>
            <TableCell className="table-cell">Jersey #</TableCell>
            <TableCell className="table-cell">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users
            .filter(user => 
              user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((user) => (
              <TableRow key={user._id}>
                <TableCell className="table-cell">{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell className="table-cell">{user.email}</TableCell>
                <TableCell className="table-cell">{user.team}</TableCell>
                <TableCell className="table-cell">{user.position}</TableCell>
                <TableCell className="table-cell">{user.jerseyNumber}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await getAllTeams();
      console.log('Fetched teams:', data);
      setTeams(data);
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setMessage({ text: 'User deleted successfully', type: 'success' });
        fetchUsers(); // Refresh the list
      } catch (error) {
        setMessage({ text: error.toString(), type: 'error' });
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      await updateUser(selectedUser._id, userData);
      setMessage({ text: 'User updated successfully', type: 'success' });
      setIsEditModalOpen(false);
      await fetchUsers();
      await fetchTeams();
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await createTeam(teamData);
      setMessage({ text: 'Team created successfully', type: 'success' });
      fetchTeams();
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const handleUpdateTeam = async (teamId, teamData) => {
    try {
      await updateTeam(teamId, teamData);
      setMessage({ text: 'Team updated successfully', type: 'success' });
      fetchTeams();
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(teamId);
        setMessage({ text: 'Team deleted successfully', type: 'success' });
        fetchTeams();
      } catch (error) {
        setMessage({ text: error.toString(), type: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>
        
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="User Management" />
          <Tab label="Team Management" />
        </Tabs>

        {currentTab === 0 && (
          <UserManagement 
            users={users}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleEditUser={handleEditUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}
        
        {currentTab === 1 && (
          <TeamManagement
            teams={teams}
            onCreateTeam={handleCreateTeam}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
            onRefresh={fetchTeams}
          />
        )}

        {selectedUser && (
          <EditUserModal
            open={isEditModalOpen}
            handleClose={() => setIsEditModalOpen(false)}
            user={selectedUser}
            handleSave={handleSaveUser}
          />
        )}

        <Snackbar
          open={!!message.text}
          autoHideDuration={6000}
          onClose={() => setMessage({ text: '', type: '' })}
        >
          <Alert severity={message.type} onClose={() => setMessage({ text: '', type: '' })}>
            {message.text}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default AdminDashboard;