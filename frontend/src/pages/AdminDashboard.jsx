import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  FitnessCenter as WeightIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  TrendingUp as ProfitIcon,
  AccountBalanceWallet as RevenueIcon,
  Payment as ExpenseIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard statistics.');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {/* FINANCIAL HEALTH OVERVIEW */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: '#10b981', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Gross Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  ₱{Number(stats?.totalRevenue || 0).toFixed(2)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 44, height: 44 }}>
                <RevenueIcon sx={{ fontSize: 24 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: '#ef4444', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Total Expenses</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  ₱{Number(stats?.totalExpenses || 0).toFixed(2)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 44, height: 44 }}>
                <ExpenseIcon sx={{ fontSize: 24 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: (stats?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>Net Profit</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5, color: (stats?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                  ₱{Number(stats?.netProfit || 0).toFixed(2)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: (stats?.netProfit || 0) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: (stats?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444', width: 44, height: 44 }}>
                <ProfitIcon sx={{ fontSize: 24 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

        {/* MONTHLY REVENUE VS EXPENSES COMPARISON CHART */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Financial Cashflow Trend: Revenue vs Expenses
              </Typography>
              {stats?.monthlyFinancials && stats.monthlyFinancials.length > 0 ? (
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.monthlyFinancials}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Gross Revenue (₱)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" name="Operational Expenses (₱)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">No historical financial trend data available.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CHARTS SECTION */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Soap Resources Stock Levels
              </Typography>
              {stats?.soapStocks && stats.soapStocks.length > 0 ? (
                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.soapStocks}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="currentStock" fill="#0ea5e9" name="Stock Level (Units)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">No stock data available.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* SOAP STOCKS STOCK LIST FOR MANAGER */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Resource Inventory Directory
              </Typography>
              <List>
                {stats?.soapStocks?.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
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
    </Box>
  );
};

export default AdminDashboard;
