import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Stack,
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Form states (Add)
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addFullName, setAddFullName] = useState('');
  const [addRole, setAddRole] = useState('ROLE_USER');
  const [addBranchId, setAddBranchId] = useState('');
  const [addError, setAddError] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Form states (Edit)
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState(''); // Optional password update
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBranchId, setEditBranchId] = useState('');
  const [editError, setEditError] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete User State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
    setDeleteError('');
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setSubmittingDelete(true);
    setDeleteError('');
    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      handleCloseDeleteModal();
      loadData();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete user.';
      setDeleteError(errMsg);
      // Reload users list to show any fallback changes (e.g. deactivation)
      fetchUsers();
    } finally {
      setSubmittingDelete(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load employee accounts.');
      console.error(err);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branches');
      setBranches(response.data);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await fetchUsers();
    await fetchBranches();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setAddError('');
    setAddUsername('');
    setAddPassword('');
    setAddFullName('');
    setAddRole('ROLE_USER');
    setAddBranchId('');
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!addUsername.trim() || !addPassword || !addFullName.trim()) {
      setAddError('Please fill in all required fields.');
      return;
    }

    setSubmittingAdd(true);
    try {
      await api.post('/api/users', {
        username: addUsername.trim(),
        password: addPassword,
        fullName: addFullName.trim(),
        role: addRole,
        active: true,
        branchId: addBranchId || null,
      });
      handleCloseAddModal();
      loadData();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user account. Username may be taken.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
    setEditError('');
    setEditUsername(user.username);
    setEditFullName(user.fullName);
    setEditRole(user.role);
    setEditBranchId(user.branchId || user.branch?.id || '');
    setEditPassword(''); // empty by default
  };

  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editUsername.trim() || !editFullName.trim()) {
      setEditError('Username and Full Name are required.');
      return;
    }

    setSubmittingEdit(true);
    try {
      const payload = {
        username: editUsername.trim(),
        fullName: editFullName.trim(),
        role: editRole,
        active: selectedUser.active,
        branchId: editBranchId || null,
      };

      if (editPassword) {
        payload.password = editPassword;
      }

      await api.put(`/api/users/${selectedUser.id}`, payload);
      handleCloseEditModal();
      loadData();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (userToToggle) => {
    try {
      await api.put(`/api/users/${userToToggle.id}/toggle`);
      // Update local state directly
      setUsers(
        users.map((u) => (u.id === userToToggle.id ? { ...u, active: !u.active } : u))
      );
    } catch (err) {
      setError('Failed to toggle employee status.');
      console.error(err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
          Employee Account Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ fontWeight: 'bold' }}
          >
            Create Employee
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Main card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', borderRadius: 0 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Work Branch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Active Toggle</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.fullName}</TableCell>
                        <TableCell>{item.username}</TableCell>
                        <TableCell>
                          {item.branch?.name ? (
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>{item.branch.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.branch.location}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.role === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
                            color={item.role === 'ROLE_ADMIN' ? 'secondary' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.active ? 'Active' : 'Disabled'}
                            color={item.active ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={item.active}
                            onChange={() => handleToggleActive(item)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditModal(item)}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleOpenDeleteModal(item)}
                              sx={{ borderRadius: 2 }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No accounts registered.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create Employee Account</DialogTitle>
        <Box component="form" onSubmit={handleAddUser}>
          <DialogContent dividers>
            {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={addFullName}
                onChange={(e) => setAddFullName(e.target.value)}
                placeholder="e.g. Maria Clara"
              />
              <TextField
                required
                fullWidth
                label="Username"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                placeholder="e.g. mariac"
              />
              <TextField
                required
                fullWidth
                type="password"
                label="Password"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                placeholder="Enter password..."
              />
              <TextField
                required
                fullWidth
                select
                label="System Role"
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
              >
                <MenuItem value="ROLE_USER">Laundry Employee (User)</MenuItem>
                <MenuItem value="ROLE_ADMIN">Shop Manager (Admin)</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Assign Branch (Optional)"
                value={addBranchId}
                onChange={(e) => setAddBranchId(e.target.value)}
              >
                <MenuItem value="">Unassigned / No Branch</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseAddModal} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingAdd}
              startIcon={submittingAdd && <CircularProgress size={16} color="inherit" />}
            >
              Register Account
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Employee Account</DialogTitle>
        <Box component="form" onSubmit={handleEditUser}>
          <DialogContent dividers>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
              <TextField
                fullWidth
                type="password"
                label="Password (Leave blank to keep current)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password if changing..."
              />
              <TextField
                required
                fullWidth
                select
                label="System Role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <MenuItem value="ROLE_USER">Laundry Employee (User)</MenuItem>
                <MenuItem value="ROLE_ADMIN">Shop Manager (Admin)</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Assign Branch (Optional)"
                value={editBranchId}
                onChange={(e) => setEditBranchId(e.target.value)}
              >
                <MenuItem value="">Unassigned / No Branch</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseEditModal} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              startIcon={submittingEdit && <CircularProgress size={16} color="inherit" />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Delete Employee Account
        </DialogTitle>
        <DialogContent dividers>
          {deleteError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body1">
            Are you sure you want to delete the employee account for <strong>{userToDelete?.fullName}</strong> (username: {userToDelete?.username})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If this worker has recorded laundry transactions or stock modifications, their account will be deactivated instead of deleted to protect system history.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDeleteModal} color="inherit" disabled={submittingDelete}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={submittingDelete}
            startIcon={submittingDelete && <CircularProgress size={16} color="inherit" />}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
