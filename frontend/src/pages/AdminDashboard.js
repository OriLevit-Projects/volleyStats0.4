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

const UserManagement = ({ users, searchQuery, setSearchQuery, handleEditUser, handleDeleteUser }) => (
  <Box sx={{ mt: 3 }}>
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
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Jersey #</TableCell>
            <TableCell>Actions</TableCell>
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
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.team}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>{user.jerseyNumber}</TableCell>
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
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
      fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage({ text: error.toString(), type: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TeamManagement = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Team Management Coming Soon</Typography>
    </Box>
  );

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
        {currentTab === 1 && <TeamManagement />}

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