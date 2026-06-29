import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  AddCircleOutlined as AddIcon,
  CheckCircleOutlined as SuccessIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  FitnessCenter as WeightIcon,
} from '@mui/icons-material';

const EmployeeDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick Entry Transaction Form State (Employee View)
  const [products, setProducts] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [soapUsedQty, setSoapUsedQty] = useState('');
  const [machineNumber, setMachineNumber] = useState('Machine 1');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState(''); // Last 4 digits reference
  const [selectedServices, setSelectedServices] = useState({}); // serviceId -> quantity
  const [customRates, setCustomRates] = useState({}); // serviceId -> customRate overrides
  const [serviceSearchTerm, setServiceSearchTerm] = useState(''); // Service list search term
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  // Receipt Modal State
  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [receiptTx, setReceiptTx] = useState(null);
  const [openServicesDialog, setOpenServicesDialog] = useState(false);
  
  // Employee's Recent Transactions (Employee View)
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard statistics.');
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/inventory');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products for dropdown.', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServicesList(response.data);
    } catch (err) {
      setFormError('Failed to fetch laundry services list: ' + (err.response?.data?.message || err.message));
      console.error('Failed to load services.', err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      setRecentTransactions(response.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load transactions.', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await fetchStats();
    await fetchProducts();
    await fetchServices();
    await fetchRecentTransactions();
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const calculateTotalPrice = () => {
    return Object.entries(selectedServices).reduce((sum, [id, qty]) => {
      const serviceId = Number(id);
      const service = servicesList.find(s => s.id === serviceId);
      const rate = customRates[serviceId] !== undefined ? customRates[serviceId] : (service ? service.rate : 0);
      return sum + (rate * qty);
    }, 0);
  };

  // Handle Quick Entry Submission (Employee View)
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedProductId) {
      setFormError('Please select a soap product.');
      return;
    }
    if (!weightKg || parseFloat(weightKg) <= 0) {
      setFormError('Weight must be greater than 0 kg.');
      return;
    }
    if (!soapUsedQty || parseFloat(soapUsedQty) < 0) {
      setFormError('Soap amount used cannot be negative.');
      return;
    }
    if (!machineNumber) {
      setFormError('Please select a washing machine.');
      return;
    }

    if (paymentMethod === 'Gcash') {
      const trimmedRef = referenceNumber.trim();
      if (!trimmedRef || trimmedRef.length !== 4 || isNaN(Number(trimmedRef))) {
        setFormError('Please enter exactly the last 4 digits of the GCash reference number.');
        return;
      }
    }

    const payloadServices = Object.entries(selectedServices)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const serviceId = Number(id);
        return {
          serviceId: serviceId,
          quantity: Number(qty),
          priceAtTransaction: customRates[serviceId] !== undefined ? Number(customRates[serviceId]) : null
        };
      });

    if (payloadServices.length === 0) {
      setFormError('Please select at least one laundry service.');
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct && selectedProduct.quantity < parseFloat(soapUsedQty)) {
      setFormError(`Insufficient stock! ${selectedProduct.name} has only ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }

    setSubmittingForm(true);
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        customerName: customerName.trim() || null,
        weightKg: parseFloat(weightKg),
        soapProductId: selectedProductId,
        soapUsedQty: parseFloat(soapUsedQty),
        machineNumber: machineNumber,
        paymentMethod: paymentMethod,
        referenceNumber: paymentMethod === 'Gcash' ? referenceNumber.trim() : null,
        services: payloadServices,
      };

      const response = await api.post('/api/transactions', payload);
      setFormSuccess('Transaction successfully recorded!');
      
      // Reset Quick Entry fields
      setCustomerName('');
      setWeightKg('');
      setSoapUsedQty('');
      setSelectedProductId('');
      setMachineNumber('Machine 1');
      setPaymentMethod('Cash');
      setReferenceNumber('');
      setSelectedServices({});
      setCustomRates({});

      // Set and trigger receipt modal
      setReceiptTx(response.data);
      setOpenReceiptModal(true);

      // Reload lists
      await loadAllData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record wash transaction.');
      console.error(err);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('printable-dashboard-receipt');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    window.location.reload();
  };

  // Remaining Soap calculation helper for real time form update
  const getRemainingSoap = () => {
    if (!selectedProductId || !soapUsedQty) return null;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return null;
    const remaining = prod.quantity - parseFloat(soapUsedQty);
    return isNaN(remaining) ? null : remaining;
  };

  const selectedProductDetails = products.find(p => p.id === selectedProductId);
  const calculatedRemainingSoap = getRemainingSoap();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>

      {/* Company Branding & Quick Action Hub */}
      <Card
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0b5394 0%, #073763 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(11, 83, 148, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(30px)',
          },
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: '800', letterSpacing: '-0.5px', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          AquaClean Laundry Services
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 3, fontWeight: 'medium' }}>
          Terminal Portal & Employee Workspace
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            onClick={() => {
              const element = document.getElementById('record-transaction-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 3,
              bgcolor: '#00bcd4',
              color: 'white',
              '&:hover': { bgcolor: '#00acc1' },
              boxShadow: '0 4px 14px rgba(0, 188, 212, 0.4)',
            }}
          >
            Record Transaction
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/transactions')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 3,
              borderColor: 'rgba(255,255,255,0.7)',
              color: 'white',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            Transactions
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/services')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 3,
              borderColor: 'rgba(255,255,255,0.7)',
              color: 'white',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            Services & Rates
          </Button>
        </Stack>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* EMPLOYEE (USER) VIEW WORKSPACE */}
      <Grid container spacing={4} id="record-transaction-section">
        {/* Quick Entry Form Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AddIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                  Record New Laundry Wash
                </Typography>
              </Box>

              {formSuccess && (
                <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                  {formSuccess}
                </Alert>
              )}

              {formError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {formError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleQuickSubmit} noValidate>
                <Stack spacing={3}>
                  {/* Customer Name & Weight */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Customer's Name (Optional)"
                      variant="outlined"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Weight (kg)"
                      variant="outlined"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="0.00"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                        inputProps: { min: "0.01", step: "0.01" }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Stack>

                  {/* Machine Selection Section */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Washing Machine Unit *
                    </Typography>
                    <Grid container spacing={1.5}>
                      {['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4'].map((mach) => {
                        const isSelected = machineNumber === mach;
                        return (
                          <Grid item xs={6} sm={3} key={mach}>
                            <Card
                              variant="outlined"
                              onClick={() => setMachineNumber(mach)}
                              sx={{
                                cursor: 'pointer',
                                p: 1.5,
                                textAlign: 'center',
                                borderRadius: 2.5,
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                borderWidth: isSelected ? '2px' : '1px',
                                bgcolor: isSelected ? 'rgba(11, 83, 148, 0.04)' : 'background.paper',
                                boxShadow: isSelected ? '0 4px 12px rgba(11, 83, 148, 0.1)' : 'none',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: 'primary.light',
                                  bgcolor: 'rgba(11, 83, 148, 0.02)',
                                }
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: isSelected ? 'primary.main' : 'text.primary' }}>
                                {mach}
                              </Typography>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Select Services & Quantities trigger */}
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                      Select Services & Quantities *
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setOpenServicesDialog(true)}
                      sx={{ py: 1.5, mb: 1, fontWeight: 'bold', borderRadius: 2 }}
                    >
                      Choose Services ({Object.keys(selectedServices).length} Selected)
                    </Button>
                    {Object.keys(selectedServices).length > 0 && (
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1, bgcolor: '#f8fafc' }}>
                        {Object.entries(selectedServices).map(([id, qty]) => {
                          const serviceId = Number(id);
                          const service = servicesList.find(s => s.id === serviceId);
                          const rate = customRates[serviceId] !== undefined ? customRates[serviceId] : (service ? service.rate : 0);
                          return (
                            <Chip
                              key={id}
                              label={`${service?.name || 'Service'} (x${qty}) - ₱${(Number(rate || 0) * qty).toFixed(2)}`}
                              onDelete={() => {
                                setSelectedServices(prev => {
                                  const updated = { ...prev };
                                  delete updated[id];
                                  return updated;
                                });
                              }}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          );
                        })}
                      </Paper>
                    )}
                  </Box>

                  {/* Soap Resource Allocation Box */}
                  <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed', borderColor: 'primary.light' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WeightIcon sx={{ fontSize: 18 }} />
                      Soap Resource Consumables
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        required
                        fullWidth
                        select
                        label="Soap Product Used"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        helperText={
                          selectedProductDetails
                            ? `Available: ${selectedProductDetails.quantity.toFixed(2)} ${selectedProductDetails.unit}`
                            : 'Select soap to verify stock'
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
                        label="Amount of Soap Used"
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Stack>
                    
                    {/* Live stock forecast badge inside soap card */}
                    {selectedProductDetails && (
                      <Box
                        sx={{
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 ? 'error.light' : 'success.light',
                          bgcolor: calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 ? 'rgba(211, 47, 47, 0.04)' : 'rgba(46, 125, 50, 0.04)',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'semibold', color: calculatedRemainingSoap < 0 ? 'error.dark' : 'success.dark' }}>
                          Remaining Stock Forecast:
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            color: calculatedRemainingSoap < 0 ? 'error.main' : 'success.main',
                          }}
                        >
                          {calculatedRemainingSoap !== null ? `${calculatedRemainingSoap.toFixed(2)} ${selectedProductDetails.unit}` : '—'}
                        </Typography>
                      </Box>
                    )}
                  </Card>

                  {/* Mode of Payment */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Mode of Payment *
                    </Typography>
                    <ToggleButtonGroup
                      value={paymentMethod}
                      exclusive
                      onChange={(e, val) => { if (val) setPaymentMethod(val); }}
                      fullWidth
                      color="primary"
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        '& .MuiToggleButton-root': {
                          borderRadius: '10px !important',
                          border: '1px solid !important',
                          borderColor: 'divider',
                          fontWeight: 'bold',
                          py: 1.5,
                          flex: 1,
                        }
                      }}
                    >
                      <ToggleButton value="Cash">Cash</ToggleButton>
                      <ToggleButton value="Gcash">
                        GCash
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* GCash Verification */}
                  {paymentMethod === 'Gcash' && (
                    <Card variant="outlined" sx={{ p: 2, border: '1px solid #90caf9', bgcolor: '#e3f2fd', borderRadius: 3 }}>
                      <Stack spacing={2} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon color="primary" />
                          Scan & Pay GCash QR
                        </Typography>
                        
                        <Box
                          component="img"
                          src="/qr/qrcode.jpg"
                          alt="GCash QR Code"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (!e.target.parentNode.querySelector('.qr-error-msg')) {
                              e.target.parentNode.innerHTML += `
                                <div class="qr-error-msg" style="border: 2px dashed #90caf9; padding: 15px; border-radius: 8px; background: #fff; color: #1565c0; font-size: 0.8rem; text-align: center;">
                                  <b>qrcode.jpg</b> not found.<br/>
                                  Place QR image in <b>public/qr/qrcode.jpg</b>
                                </div>
                              `;
                            }
                          }}
                          sx={{
                            width: 180,
                            height: 180,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid white',
                          }}
                        />
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                            GCash Account: 0976 406 0979
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Once paid, key in the GCash Reference Number below:
                          </Typography>
                        </Box>
                        
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Last 4 digits of GCash Ref"
                          placeholder="e.g. 1234"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          inputProps={{ maxLength: 4 }}
                          sx={{ bgcolor: 'white', borderRadius: 1 }}
                        />
                      </Stack>
                    </Card>
                  )}

                  {/* Receipt Billing Review */}
                  {Object.keys(selectedServices).length > 0 && (
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PrintIcon sx={{ fontSize: 16 }} />
                        Invoice Breakdown
                      </Typography>
                      <Stack spacing={1}>
                        {Object.entries(selectedServices).map(([id, qty]) => {
                          const serviceId = Number(id);
                          const service = servicesList.find(s => s.id === serviceId);
                          const rate = customRates[serviceId] !== undefined ? customRates[serviceId] : (service ? service.rate : 0);
                          return (
                            <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.primary">
                                {service?.name} <Box component="span" sx={{ color: 'text.secondary' }}>x{qty}</Box>
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                ₱{(Number(rate || 0) * qty).toFixed(2)}
                              </Typography>
                            </Box>
                          );
                        })}
                        <Divider sx={{ my: 1 }} />
                        
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #0b5394 0%, #073763 100%)',
                            color: 'white',
                          }}
                        >
                           <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Total Billing Price:</Typography>
                           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                             ₱{Number(calculateTotalPrice() || 0).toFixed(2)}
                           </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  )}

                  {/* Validation Warning */}
                  {calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 && (
                    <Alert severity="error" size="small" sx={{ py: 0 }}>
                      Remaining soap cannot be negative! Please adjust Soap Used quantity or top-up stock.
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={submittingForm || (calculatedRemainingSoap !== null && calculatedRemainingSoap < 0)}
                    variant="contained"
                    fullWidth
                    startIcon={submittingForm ? <CircularProgress size={20} color="inherit" /> : <LaundryIcon />}
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                  >
                    {submittingForm ? 'Saving Transaction...' : 'Record Transaction'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Entries & Stats Column */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Today's Count Banner for Employee */}
            <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, textTransform: 'uppercase' }}>
                  My Record Totals Today
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats?.totalTransactionsToday}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Washes Done</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats?.totalKgWashedToday != null ? stats.totalKgWashedToday.toFixed(1) : '0.0'}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Weight (kg)</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Transactions List */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  My Recent Entries
                </Typography>
                {recentTransactions.length > 0 ? (
                  <List>
                    {recentTransactions.map((tx, idx) => (
                      <React.Fragment key={tx.id}>
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemText
                            primary={tx.customerName || 'Anonymous Customer'}
                            primaryTypographyProps={{ fontWeight: 600 }}
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {tx.date} • {tx.machineNumber} • {tx.weightKg} kg washed • {tx.soapUsedQty} {tx.soapProduct?.unit} soap used
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  <Chip
                                    label={tx.paymentMethod === 'Gcash' ? `GCash (${tx.referenceNumber || '—'})` : 'Cash'}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  {tx.services?.map(item => (
                                    <Chip
                                      key={item.id}
                                      label={`${item.service?.name} (x${item.quantity})`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {idx < recentTransactions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No laundry entries recorded today.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Printable Receipt Dialog */}
      <Dialog open={openReceiptModal} onClose={() => setOpenReceiptModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Transaction Completed</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Printable Ticket Receipt Layout */}
          <Box id="printable-dashboard-receipt" sx={{ p: 3, fontFamily: 'monospace', color: 'black', bgcolor: 'white' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>LAUNDRY INVENTORY SYSTEM</Typography>
              <Typography variant="body2">Branch Terminal</Typography>
              <Typography variant="caption" color="text.secondary">Logged By: {user?.fullName}</Typography>
              <Divider sx={{ my: 1.5, borderColor: 'black' }} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">Date: {receiptTx?.date}</Typography>
              <Typography variant="body2">Customer: {receiptTx?.customerName || 'Walk-in'}</Typography>
              <Typography variant="body2">Machine: {receiptTx?.machineNumber}</Typography>
              <Typography variant="body2">Weight: {receiptTx?.weightKg} kg</Typography>
              <Typography variant="body2">Soap Used: {receiptTx?.soapUsedQty} {receiptTx?.soapProduct?.unit || 'unit'}</Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1.5, borderColor: 'black' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>SERVICES CHARGED:</Typography>
            <Stack spacing={0.5}>
              {receiptTx?.services?.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{item.service?.name} x{item.quantity}</Typography>
                  <Typography variant="body2">₱{(item.priceAtTransaction * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2, borderColor: 'black' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>TOTAL BILL:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                ₱{receiptTx?.totalAmount?.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Payment Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Mode: {receiptTx?.paymentMethod === 'Gcash' ? 'GCash' : 'Cash'}
              </Typography>
              {receiptTx?.paymentMethod === 'Gcash' && (
                <Typography variant="body2" color="text.secondary">
                  GCash Ref: XXXX-XXXX-{receiptTx?.referenceNumber}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">Bank: —</Typography>
              <Typography variant="body2" color="text.secondary">Account Name: —</Typography>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Thank you for washing with us!
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button startIcon={<PrintIcon />} variant="outlined" onClick={handlePrintReceipt}>
            Print Receipt
          </Button>
          <Button variant="contained" onClick={() => setOpenReceiptModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Services Selection Sub-dialog */}
      <Dialog open={openServicesDialog} onClose={() => setOpenServicesDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Select Laundry Services</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search services..."
            value={serviceSearchTerm}
            onChange={(e) => setServiceSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack spacing={1.5}>
            {servicesList
              .filter(s => s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
              .map(service => {
                const qty = selectedServices[service.id] || 1;
                const isChecked = selectedServices[service.id] !== undefined;
                const currentRate = customRates[service.id] !== undefined ? customRates[service.id] : service.rate;
                return (
                  <Box key={service.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices(prev => ({ ...prev, [service.id]: qty }));
                            } else {
                              setSelectedServices(prev => {
                                const updated = { ...prev };
                                delete updated[service.id];
                                return updated;
                              });
                            }
                          }}
                          size="small"
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {service.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Standard: ₱{service.rate != null ? Number(service.rate).toFixed(2) : '0.00'} / {service.unit}
                          </Typography>
                        </Box>
                      </Box>
                      {isChecked && (
                        <TextField
                          type="number"
                          size="small"
                          label="Qty"
                          value={qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val > 0) {
                              setSelectedServices(prev => ({ ...prev, [service.id]: val }));
                            }
                          }}
                          inputProps={{ min: 1 }}
                          sx={{ width: 80 }}
                        />
                      )}
                    </Box>

                    {isChecked && (
                      <Box sx={{ mt: 1.5, pl: 4.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {isAdmin() ? (
                          <TextField
                            size="small"
                            type="number"
                            label="Price (Edit)"
                            value={currentRate}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                setCustomRates(prev => ({ ...prev, [service.id]: val }));
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                              inputProps: { min: "0", step: "0.5" }
                            }}
                            sx={{ width: 140 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Rate: ₱{currentRate != null ? Number(currentRate).toFixed(2) : '0.00'}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          Sub: ₱{(Number(currentRate || 0) * qty).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServicesDialog(false)} variant="contained" fullWidth sx={{ fontWeight: 'bold' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
