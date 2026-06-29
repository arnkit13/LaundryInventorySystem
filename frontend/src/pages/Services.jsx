import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  LocalLaundryService as LaundryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const Services = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog Add/Edit states
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  
  // Form fields
  const [serviceName, setServiceName] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServices(response.data);
    } catch (err) {
      setError('Failed to fetch services. Check backend connection.');
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await fetchServices();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedServiceId(null);
    setServiceName('');
    setRate('');
    setUnit('LOAD');
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEditModal = (service) => {
    setEditMode(true);
    setSelectedServiceId(service.id);
    setServiceName(service.name);
    setRate(service.rate.toString());
    setUnit(service.unit);
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!serviceName.trim() || !rate || !unit.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const rateVal = parseFloat(rate);
    if (isNaN(rateVal) || rateVal < 0) {
      setFormError('Rate must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: serviceName.trim(),
        rate: rateVal,
        unit: unit.trim()
      };

      if (editMode) {
        await api.put(`/api/services/${selectedServiceId}`, payload);
      } else {
        await api.post('/api/services', payload);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save service rates.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/api/services/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service.');
      console.error(err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            Laundry Services & Pricing Rates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage services configurations, standard rates, and billing units.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          {isAdmin() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ fontWeight: 'bold' }}
            >
              Add New Service
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Services Table Card */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Service Name / Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Standard Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Billing Unit</TableCell>
                    {isAdmin() && <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.length > 0 ? (
                    services.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LaundryIcon color="primary" />
                            {item.name}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₱{item.rate != null && !isNaN(Number(item.rate)) ? Number(item.rate).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell>
                          {item.unit}
                        </TableCell>
                        {isAdmin() && (
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton onClick={() => handleOpenEditModal(item)} color="primary" size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteService(item.id, item.name)} color="error" size="small">
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin() ? 5 : 4} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No services defined yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Service Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editMode ? 'Edit Service Rate' : 'Add New Service & Rate'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveService}>
          <DialogContent dividers>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Service Name / Description"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Basic Service, Comforter"
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Rate (₱)"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0.00"
                inputProps={{ min: "0.00", step: "0.01" }}
              />
              <TextField
                required
                fullWidth
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. LOAD, pc, sachet, dry"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Service'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Services;
