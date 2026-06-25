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
  MenuItem,
  Alert,
  IconButton,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  LocalLaundryService as LaundryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Transactions = () => {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal Dialog Form State
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [soapUsedQty, setSoapUsedQty] = useState('');
  const [machineNumber, setMachineNumber] = useState('Machine 1');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transaction logs.');
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/inventory');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await fetchTransactions();
    await fetchProducts();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
    setModalError('');
    setCustomerName('');
    setWeightKg('');
    setSoapUsedQty('');
    setSelectedProductId('');
    setMachineNumber('Machine 1');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!selectedProductId) {
      setModalError('Soap product selection is required.');
      return;
    }
    if (!weightKg || parseFloat(weightKg) <= 0) {
      setModalError('Weight must be greater than 0 kg.');
      return;
    }
    if (!soapUsedQty || parseFloat(soapUsedQty) < 0) {
      setModalError('Soap used quantity cannot be negative.');
      return;
    }
    if (!machineNumber) {
      setModalError('Machine number selection is required.');
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct && selectedProduct.quantity < parseFloat(soapUsedQty)) {
      setModalError(`Insufficient stock! ${selectedProduct.name} has only ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        customerName: customerName.trim() || null,
        weightKg: parseFloat(weightKg),
        soapProductId: selectedProductId,
        soapUsedQty: parseFloat(soapUsedQty),
        machineNumber: machineNumber,
      };

      await api.post('/api/transactions', payload);
      handleCloseModal();
      loadData(); // Reload table
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error occurred while saving transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRemainingSoap = () => {
    if (!selectedProductId || !soapUsedQty) return null;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return null;
    const remaining = prod.quantity - parseFloat(soapUsedQty);
    return isNaN(remaining) ? null : remaining;
  };

  const selectedProductDetails = products.find(p => p.id === selectedProductId);
  const calculatedRemainingSoap = getRemainingSoap();

  // Search filtering
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedMachineFilter !== 'All' && tx.machineNumber !== selectedMachineFilter) {
      return false;
    }
    const searchString = searchTerm.toLowerCase();
    const customer = (tx.customerName || 'anonymous').toLowerCase();
    const loggedBy = (tx.user?.fullName || '').toLowerCase();
    const soapName = (tx.soapProduct?.name || '').toLowerCase();
    return customer.includes(searchString) || loggedBy.includes(searchString) || soapName.includes(searchString);
  });

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top action header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
          Laundry Transaction Logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadData} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ fontWeight: 'bold' }}
          >
            Record Wash
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Main card panel with search & list */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Search bar row */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'flex-start', md: 'center' } }}>
            <TextField
              placeholder="Search by customer, employee, or soap name..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 450, width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexGrow: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {['All', 'Machine 1', 'Machine 2', 'Machine 3', 'Machine 4'].map((m) => (
                <Button
                  key={m}
                  variant={selectedMachineFilter === m ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setSelectedMachineFilter(m);
                    setPage(0);
                  }}
                  sx={{ borderRadius: 2, fontWeight: 'bold' }}
                >
                  {m === 'All' ? 'All Machines' : m}
                </Button>
              ))}
            </Stack>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', borderRadius: 0 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Machine</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Weight</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Soap Product Used</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Soap Used</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remaining Stock Snapshot</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Logged By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((tx) => (
                        <TableRow key={tx.id} hover>
                          <TableCell>#{tx.id}</TableCell>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {tx.customerName || <Typography component="span" variant="body2" color="text.disabled">Anonymous</Typography>}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{tx.machineNumber || '—'}</TableCell>
                          <TableCell>{tx.weightKg} kg</TableCell>
                          <TableCell>{tx.soapProduct?.name}</TableCell>
                          <TableCell>{tx.soapUsedQty} {tx.soapProduct?.unit}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {tx.soapRemainingQty != null ? tx.soapRemainingQty.toFixed(2) : '0.00'} {tx.soapProduct?.unit}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: 'primary.dark' }}>
                            {tx.user?.fullName}
                            {tx.branch?.name && (
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                {tx.branch.name}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No laundry transactions found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Record Transaction Modal Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LaundryIcon color="primary" />
          Record Laundry Wash
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveTransaction}>
          <DialogContent dividers>
            {modalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {modalError}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
              />

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Washing Machine *
                </Typography>
                <ToggleButtonGroup
                  value={machineNumber}
                  exclusive
                  onChange={(e, val) => { if (val) setMachineNumber(val); }}
                  fullWidth
                  color="primary"
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      borderRadius: '8px !important',
                      border: '1px solid !important',
                      borderColor: 'divider',
                      flex: '1 1 45%',
                      fontWeight: 'bold',
                      py: 1.5,
                    }
                  }}
                >
                  <ToggleButton value="Machine 1">Machine 1 (8kg)</ToggleButton>
                  <ToggleButton value="Machine 2">Machine 2 (8kg)</ToggleButton>
                  <ToggleButton value="Machine 3">Machine 3 (12kg)</ToggleButton>
                  <ToggleButton value="Machine 4">Machine 4 (12kg)</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                required
                fullWidth
                type="number"
                label="Weight (kg)"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.00"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  inputProps: { min: "0.01", step: "0.01" }
                }}
              />

              <TextField
                required
                fullWidth
                select
                label="Soap Product Used"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                helperText={
                  selectedProductDetails
                    ? `Available Stock: ${selectedProductDetails.quantity.toFixed(2)} ${selectedProductDetails.unit}`
                    : 'Select product to check stock level'
                }
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                required
                fullWidth
                type="number"
                label="Soap Amount Used"
                value={soapUsedQty}
                onChange={(e) => setSoapUsedQty(e.target.value)}
                placeholder="0.00"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedProductDetails ? selectedProductDetails.unit : 'unit'}
                    </InputAdornment>
                  ),
                  inputProps: { min: "0.00", step: "0.01" }
                }}
              />

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  borderColor: calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 ? 'error.light' : 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">Remaining Soap Stock After Wash:</Typography>
                {calculatedRemainingSoap !== null ? (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      color: calculatedRemainingSoap < 0 ? 'error.main' : 'success.main',
                    }}
                  >
                    {calculatedRemainingSoap.toFixed(2)} {selectedProductDetails?.unit}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">—</Typography>
                )}
              </Paper>

              {calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 && (
                <Alert severity="error" sx={{ py: 0 }}>
                  Remaining soap cannot be negative. Please check soap used quantity.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || (calculatedRemainingSoap !== null && calculatedRemainingSoap < 0)}
              startIcon={submitting && <CircularProgress size={16} color="inherit" />}
            >
              {submitting ? 'Saving...' : 'Record Wash'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Transactions;
