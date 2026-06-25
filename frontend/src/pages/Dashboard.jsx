import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Chip,
  Paper,
  InputAdornment,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  FitnessCenter as WeightIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AddCircleOutlined as AddIcon,
  CheckCircleOutlined as SuccessIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick Entry Transaction Form State (Employee View)
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [soapUsedQty, setSoapUsedQty] = useState('');
  const [machineNumber, setMachineNumber] = useState('Machine 1');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);
  
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

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      // Limit to top 5 recent ones
      setRecentTransactions(response.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load transactions.', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await fetchStats();
    await fetchProducts();
    if (!isAdmin()) {
      await fetchRecentTransactions();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [isAdmin]);

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

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct && selectedProduct.quantity < parseFloat(soapUsedQty)) {
      setFormError(`Insufficient stock! ${selectedProduct.name} has only ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }

    setSubmittingForm(true);

    try {
      const payload = {
        date: new Date().toISOString().split('T')[0], // Today's date
        customerName: customerName.trim() || null,
        weightKg: parseFloat(weightKg),
        soapProductId: selectedProductId,
        soapUsedQty: parseFloat(soapUsedQty),
        machineNumber: machineNumber,
      };

      await api.post('/api/transactions', payload);
      setFormSuccess('Laundry transaction recorded successfully and soap stock updated!');
      
      // Reset Form fields
      setCustomerName('');
      setWeightKg('');
      setSoapUsedQty('');
      setSelectedProductId('');
      setMachineNumber('Machine 1');

      // Refresh stats and local items
      await fetchStats();
      await fetchProducts();
      await fetchRecentTransactions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving transaction.');
    } finally {
      setSubmittingForm(false);
    }
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

  // Identify low stocks for warnings
  const lowStockProducts = stats?.soapStocks?.filter(item => item.isLow) || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome & Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.dark" sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.fullName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is your overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ADMIN VIEW */}
      {isAdmin() ? (
        <Grid container spacing={3}>
          {/* KPI CARDS */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Today's Washes</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{stats?.totalTransactionsToday}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(11, 83, 148, 0.1)', color: 'primary.main', width: 44, height: 44 }}>
                  <LaundryIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'secondary.main', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Total Weight</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{stats?.totalKgWashedToday != null ? stats.totalKgWashedToday.toFixed(1) : '0.0'} <Typography component="span" variant="h6" color="text.secondary">kg</Typography></Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(0, 188, 212, 0.1)', color: 'secondary.main', width: 44, height: 44 }}>
                  <WeightIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'success.main', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Customers Served</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{stats?.totalCustomersToday}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.main', width: 44, height: 44 }}>
                  <PeopleIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: lowStockProducts.length > 0 ? 'warning.main' : 'success.main', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Low Stocks Warning</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5, color: lowStockProducts.length > 0 ? 'warning.main' : 'success.main' }}>
                    {lowStockProducts.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: lowStockProducts.length > 0 ? 'rgba(237, 108, 2, 0.1)' : 'rgba(46, 125, 50, 0.1)', color: lowStockProducts.length > 0 ? 'warning.main' : 'success.main', width: 44, height: 44 }}>
                  {lowStockProducts.length > 0 ? <WarningIcon sx={{ fontSize: 24 }} /> : <CheckIcon sx={{ fontSize: 24 }} />}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>

          {/* LOW STOCK BANNER ALERTS */}
          {lowStockProducts.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ borderRadius: 3, border: '1px solid #ffe0b2' }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Low Inventory Alert</AlertTitle>
                The following soap stocks are running low (below 5.0 units). Please purchase or restock soon:
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  {lowStockProducts.map(p => (
                    <Chip
                      key={p.id}
                      icon={<WarningIcon fontSize="small" />}
                      label={`${p.name}: ${p.currentStock.toFixed(1)} ${p.unit}`}
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 'semibold' }}
                    />
                  ))}
                </Stack>
              </Alert>
            </Grid>
          )}

          {/* CHARTS SECTION */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Soap Inventory Volume Levels
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stats?.soapStocks}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis label={{ value: 'Stock Amount', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit}`, 'Current Stock']} />
                      <Bar dataKey="currentStock" fill="#0b5394" radius={[4, 4, 0, 0]}>
                        {stats?.soapStocks?.map((entry, index) => (
                          <span key={`cell-${index}`} style={{ fill: entry.isLow ? '#ed6c02' : '#0b5394' }} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* CURRENT INVENTORY LEVELS LIST */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Soap Products Status
                </Typography>
                <List>
                  {stats?.soapStocks?.map((product, index) => (
                    <React.Fragment key={product.id}>
                      <ListItem
                        secondaryAction={
                          <Chip
                            label={product.isLow ? 'Low Stock' : 'In Stock'}
                            color={product.isLow ? 'warning' : 'success'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        }
                        sx={{ py: 1.5 }}
                      >
                        <ListItemText
                          primary={product.name}
                          primaryTypographyProps={{ fontWeight: 600 }}
                          secondary={`Available: ${product.currentStock.toFixed(2)} ${product.unit}`}
                        />
                      </ListItem>
                      {index < stats.soapStocks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* EMPLOYEE (USER) VIEW WORKSPACE */
        <Grid container spacing={4}>
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
                  <Grid container spacing={3}>
                    {/* Customer Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Customer's Name (Optional)"
                        variant="outlined"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name..."
                      />
                    </Grid>

                    {/* Machine Selection */}
                    <Grid item xs={12} sm={6}>
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
                        <ToggleButton value="Machine 1">M1 (8kg)</ToggleButton>
                        <ToggleButton value="Machine 2">M2 (8kg)</ToggleButton>
                        <ToggleButton value="Machine 3">M3 (12kg)</ToggleButton>
                        <ToggleButton value="Machine 4">M4 (12kg)</ToggleButton>
                      </ToggleButtonGroup>
                    </Grid>

                    {/* Weight (Kilograms) */}
                    <Grid item xs={12} sm={6}>
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
                      />
                    </Grid>

                    {/* Soap Dropdown Selection */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        select
                        label="Soap Product Used"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(Number(e.target.value))}
                        helperText={
                          selectedProductDetails
                            ? `Available: ${selectedProductDetails.quantity.toFixed(2)} ${selectedProductDetails.unit}`
                            : 'Select soap to check stock'
                        }
                      >
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Soap Quantity Used */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        type="number"
                        label="Soap Used"
                        variant="outlined"
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
                    </Grid>

                    {/* Calculated Remaining Stock */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: '56px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 2,
                          bgcolor: 'background.default',
                          borderColor: calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 ? 'error.light' : 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Remaining Stock:</Typography>
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
                    </Grid>

                    {/* Validation Warning */}
                    {calculatedRemainingSoap !== null && calculatedRemainingSoap < 0 && (
                      <Grid item xs={12}>
                        <Alert severity="error" size="small" sx={{ py: 0 }}>
                          Remaining soap cannot be negative! Please adjust Soap Used quantity or top-up stock.
                        </Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submittingForm || (calculatedRemainingSoap !== null && calculatedRemainingSoap < 0)}
                        fullWidth
                        startIcon={submittingForm ? <CircularProgress size={20} color="inherit" /> : <LaundryIcon />}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                      >
                        {submittingForm ? 'Saving Transaction...' : 'Record Transaction'}
                      </Button>
                    </Grid>
                  </Grid>
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
                                <Typography variant="caption" color="text.secondary">
                                  {tx.date} • {tx.weightKg} kg washed • {tx.soapUsedQty} {tx.soapProduct?.unit} soap used
                                </Typography>
                              }
                            />
                            <Chip size="small" label={`#${tx.id}`} color="primary" variant="outlined" />
                          </ListItem>
                          {idx < recentTransactions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No transactions recorded by you yet.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
