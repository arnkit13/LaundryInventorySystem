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
  Alert,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Store as BranchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog Form States
  const [openAddModal, setOpenAddModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branches');
      setBranches(response.data);
    } catch (err) {
      setError('Failed to fetch branches. Check connection.');
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await fetchBranches();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setFormError('');
    setBranchName('');
    setLocation('');
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleAddBranch = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!branchName.trim() || !location.trim()) {
      setFormError('Please fill in both branch name and location.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/branches', {
        name: branchName.trim(),
        location: location.trim()
      });
      handleCloseAddModal();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create branch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch? All employee and transaction links to this branch will be nullified.')) {
      return;
    }
    try {
      await api.delete(`/api/branches/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete branch.');
      console.error(err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
          Branch Location Directory
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
            Create Branch
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Branches Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Branch Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Physical Address / Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Established Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.length > 0 ? (
                    branches.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <BranchIcon color="secondary" />
                            {item.name}
                          </Box>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          {item.createdAt 
                            ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Initial System Seed'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleDeleteBranch(item.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No laundry branch locations established yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BranchIcon color="primary" />
          Establish New Branch
        </DialogTitle>
        <Box component="form" onSubmit={handleAddBranch}>
          <DialogContent dividers>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Branch Name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. North Avenue Express"
              />
              <TextField
                required
                fullWidth
                label="Branch Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Brgy. Bagong Pag-asa, Quezon City"
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseAddModal} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={16} color="inherit" />}
            >
              Establish Branch
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Branches;
