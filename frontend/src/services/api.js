import axios from 'axios';

// Toggle this flag to switch between mock client-side database and Spring Boot backend
const USE_MOCK = false;

const API_BASE_URL = 'http://localhost:8080';

// Mock database seed structures
const SEED_BRANCHES = [
  { id: 1, name: 'Main Branch', location: '123 Central Avenue, Quezon City' },
  { id: 2, name: 'Downtown Express', location: '456 Mabini St, Manila' }
];

const SEED_USERS = [
  { id: 1, username: 'admin', password: 'admin123', fullName: 'Shop Manager (Admin)', role: 'ROLE_ADMIN', active: true, branchId: 1, branch: { id: 1, name: 'Main Branch', location: '123 Central Avenue, Quezon City' } },
  { id: 2, username: 'employee', password: 'emp123', fullName: 'Juan Dela Cruz (Employee)', role: 'ROLE_USER', active: true, branchId: 2, branch: { id: 2, name: 'Downtown Express', location: '456 Mabini St, Manila' } }
];

const SEED_PRODUCTS = [];

const SEED_TRANSACTIONS = [];

const SEED_HISTORY = [];

// Helper to access localStorage securely
const getMockData = (key, defaultData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
};

const saveMockData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const handleMockRequest = async (method, url, data) => {
  const path = url.split('?')[0];

  const getSessionUser = () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const reject = (message, status = 400) => {
    const error = new Error(message);
    error.response = {
      status,
      data: { message }
    };
    return Promise.reject(error);
  };

  const resolve = (data) => {
    return Promise.resolve({ data });
  };

  // Simulating small network latency (400ms)
  await new Promise(r => setTimeout(r, 400));

  // Initialize DB tables in LocalStorage
  const branches = getMockData('mock_branches', SEED_BRANCHES);
  const users = getMockData('mock_users', SEED_USERS);
  const products = getMockData('mock_products', SEED_PRODUCTS);
  const transactions = getMockData('mock_transactions', SEED_TRANSACTIONS);
  const history = getMockData('mock_inventory_history', SEED_HISTORY);

  // 0. BRANCHES
  if (path === '/api/branches') {
    if (method === 'get') {
      return resolve(branches);
    }
    if (method === 'post') {
      const { name, location } = data || {};
      if (!name || !location) {
        return reject('Name and Location are required.');
      }
      const newBranch = {
        id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1,
        name,
        location,
        createdAt: new Date().toISOString()
      };
      branches.push(newBranch);
      saveMockData('mock_branches', branches);
      return resolve(newBranch);
    }
  }

  const branchDeleteMatch = path.match(/^\/api\/branches\/(\d+)$/);
  if (method === 'delete' && branchDeleteMatch) {
    const branchId = parseInt(branchDeleteMatch[1], 10);
    const branchIndex = branches.findIndex(b => b.id === branchId);
    if (branchIndex === -1) {
      return reject('Branch not found.', 404);
    }

    // Nullify branch reference for users and transactions
    const updatedUsers = users.map(u => u.branchId === branchId ? { ...u, branchId: null, branch: null } : u);
    saveMockData('mock_users', updatedUsers);

    const updatedTransactions = transactions.map(t => t.branchId === branchId ? { ...t, branchId: null, branch: null } : t);
    saveMockData('mock_transactions', updatedTransactions);

    branches.splice(branchIndex, 1);
    saveMockData('mock_branches', branches);
    return resolve({ message: 'Branch deleted successfully.' });
  }

  // 1. LOGIN
  if (method === 'post' && path === '/api/auth/login') {
    const { username, password } = data || {};
    const matched = users.find(u => u.username === username && u.password === password);
    if (!matched) {
      return reject('Invalid username or password.', 401);
    }
    if (!matched.active) {
      return reject('Account is disabled. Please contact the administrator.', 403);
    }
    const responseData = {
      id: matched.id,
      username: matched.username,
      fullName: matched.fullName,
      role: matched.role,
      branchId: matched.branchId,
      branchName: matched.branch?.name,
      token: 'mock-jwt-token-for-' + matched.username
    };
    return resolve(responseData);
  }

  // 2. DASHBOARD STATS
  if (method === 'get' && path === '/api/dashboard/stats') {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === todayStr);

    const totalTransactionsToday = todayTransactions.length;
    const totalKgWashedToday = todayTransactions.reduce((sum, t) => sum + (t.weightKg || 0), 0);
    
    const uniqueCustomers = new Set(
      todayTransactions
        .map(t => t.customerName?.trim())
        .filter(name => name)
    );
    const totalCustomersToday = uniqueCustomers.size || totalTransactionsToday;

    const soapStocks = products.map(p => ({
      id: p.id,
      name: p.name,
      currentStock: p.quantity,
      unit: p.unit,
      isLow: p.quantity < 5.0
    }));

    return resolve({
      totalTransactionsToday,
      totalKgWashedToday,
      totalCustomersToday,
      soapStocks
    });
  }

  // 3. INVENTORY (GET & POST)
  if (path === '/api/inventory') {
    if (method === 'get') {
      return resolve(products);
    }
    if (method === 'post') {
      const { name, quantity, unit } = data || {};
      if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return reject('Product name already exists.');
      }
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        quantity: Number(quantity) || 0,
        unit: unit || 'kg'
      };
      products.push(newProduct);
      saveMockData('mock_products', products);

      const currentUser = getSessionUser();
      const newLog = {
        id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        soapProduct: { id: newProduct.id, name: newProduct.name, unit: newProduct.unit },
        transactionType: 'ADD_STOCK',
        quantityChanged: newProduct.quantity,
        previousQuantity: 0,
        newQuantity: newProduct.quantity,
        performedBy: currentUser ? { id: currentUser.id, fullName: currentUser.fullName } : { id: 1, fullName: 'System' },
        notes: 'Initial stock setup'
      };
      history.unshift(newLog);
      saveMockData('mock_inventory_history', history);

      return resolve(newProduct);
    }
  }

  const productDeleteMatch = path.match(/^\/api\/inventory\/(\d+)$/);
  if (method === 'delete' && productDeleteMatch) {
    const prodId = parseInt(productDeleteMatch[1], 10);
    const prodIndex = products.findIndex(p => p.id === prodId);
    if (prodIndex === -1) {
      return reject('Product not found.', 404);
    }

    const hasTransactions = transactions.some(t => t.soapProductId === prodId);
    const productHistories = history.filter(h => h.soapProduct?.id === prodId);

    if (hasTransactions || productHistories.length > 1) {
      return reject('Cannot delete soap product because it has been used in laundry washes or has manual stock adjustments.');
    }

    const updatedHistory = history.filter(h => h.soapProduct?.id !== prodId);
    saveMockData('mock_inventory_history', updatedHistory);

    products.splice(prodIndex, 1);
    saveMockData('mock_products', products);

    return resolve({ message: 'Product deleted successfully.' });
  }

  // 4. INVENTORY STOCK ADJUSTMENT (PUT /api/inventory/:id/adjust)
  const adjustMatch = path.match(/^\/api\/inventory\/(\d+)\/adjust$/);
  if (method === 'put' && adjustMatch) {
    const prodId = parseInt(adjustMatch[1], 10);
    const { quantityChanged, notes } = data || {};
    const prodIndex = products.findIndex(p => p.id === prodId);
    if (prodIndex === -1) {
      return reject('Product not found.', 404);
    }

    const product = products[prodIndex];
    const prevQty = product.quantity;
    const change = Number(quantityChanged) || 0;
    const newQty = prevQty + change;

    if (newQty < 0) {
      return reject(`Insufficient stock! Product has only ${prevQty} ${product.unit}.`);
    }

    product.quantity = newQty;
    saveMockData('mock_products', products);

    const currentUser = getSessionUser();
    const newLog = {
      id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
      soapProduct: { id: product.id, name: product.name, unit: product.unit },
      transactionType: change > 0 ? 'ADD_STOCK' : 'USE_STOCK',
      quantityChanged: change,
      previousQuantity: prevQty,
      newQuantity: newQty,
      performedBy: currentUser ? { id: currentUser.id, fullName: currentUser.fullName } : { id: 1, fullName: 'System' },
      notes: notes || 'Manual stock adjustment'
    };
    history.unshift(newLog);
    saveMockData('mock_inventory_history', history);

    return resolve(product);
  }

  // 5. INVENTORY HISTORY (GET)
  if (method === 'get' && path === '/api/inventory/history') {
    return resolve(history);
  }

  // 6. TRANSACTIONS (GET & POST)
  if (path === '/api/transactions') {
    if (method === 'get') {
      const currentUser = getSessionUser();
      // Admin sees all transactions, employee only their own
      if (currentUser?.role === 'ROLE_ADMIN') {
        return resolve(transactions);
      } else {
        return resolve(transactions.filter(t => t.user?.id === currentUser?.id));
      }
    }
    if (method === 'post') {
      const { date, customerName, weightKg, soapProductId, soapUsedQty, machineNumber } = data || {};
      const prodId = parseInt(soapProductId, 10);
      const prodIndex = products.findIndex(p => p.id === prodId);
      if (prodIndex === -1) {
        return reject('Selected soap product not found.', 404);
      }

      const product = products[prodIndex];
      const prevQty = product.quantity;
      const used = Number(soapUsedQty) || 0;
      const remaining = prevQty - used;

      if (remaining < 0) {
        return reject(`Insufficient stock! ${product.name} has only ${prevQty} ${product.unit} available.`);
      }

      product.quantity = remaining;
      saveMockData('mock_products', products);

      const currentUser = getSessionUser();
      // Find full performer user in DB to copy their branch
      const dbPerformer = users.find(u => u.id === currentUser?.id);

      const newTx = {
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        date: date || new Date().toISOString().split('T')[0],
        customerName: customerName ? customerName.trim() : null,
        weightKg: Number(weightKg) || 0,
        soapProductId: product.id,
        soapProduct: { id: product.id, name: product.name, unit: product.unit },
        soapUsedQty: used,
        soapRemainingQty: remaining,
        machineNumber: machineNumber || 'Machine 1',
        branchId: dbPerformer?.branchId || null,
        branch: dbPerformer?.branch || null,
        user: currentUser ? { id: currentUser.id, fullName: currentUser.fullName } : { id: 2, fullName: 'System User' }
      };
      transactions.unshift(newTx);
      saveMockData('mock_transactions', transactions);

      const newLog = {
        id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        soapProduct: { id: product.id, name: product.name, unit: product.unit },
        transactionType: 'USE_STOCK',
        quantityChanged: -used,
        previousQuantity: prevQty,
        newQuantity: remaining,
        performedBy: currentUser ? { id: currentUser.id, fullName: currentUser.fullName } : { id: 2, fullName: 'System User' },
        notes: `Wash transaction for ${customerName || 'Anonymous'}`
      };
      history.unshift(newLog);
      saveMockData('mock_inventory_history', history);

      return resolve(newTx);
    }
  }

  // 7. USERS (GET & POST)
  if (path === '/api/users') {
    if (method === 'get') {
      return resolve(users);
    }
    if (method === 'post') {
      const { username, password, fullName, role, active, branchId } = data || {};
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return reject('Username already exists.');
      }
      
      const matchedBranch = branches.find(b => b.id === Number(branchId));

      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        fullName,
        role: role || 'ROLE_USER',
        active: active !== undefined ? active : true,
        branchId: matchedBranch ? matchedBranch.id : null,
        branch: matchedBranch || null
      };
      users.push(newUser);
      saveMockData('mock_users', users);
      return resolve(newUser);
    }
  }

  // 8. USER MODIFY (PUT /api/users/:id)
  const userMatch = path.match(/^\/api\/users\/(\d+)$/);
  if (method === 'put' && userMatch) {
    const userId = parseInt(userMatch[1], 10);
    const { username, fullName, role, active, password, branchId } = data || {};
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return reject('User not found.', 404);
    }

    if (users.some(u => u.id !== userId && u.username.toLowerCase() === username.toLowerCase())) {
      return reject('Username is already taken.');
    }

    const matchedBranch = branches.find(b => b.id === Number(branchId));

    const user = users[userIndex];
    user.username = username;
    user.fullName = fullName;
    user.role = role;
    user.active = active !== undefined ? active : user.active;
    user.branchId = matchedBranch ? matchedBranch.id : user.branchId;
    user.branch = matchedBranch ? matchedBranch : user.branch;
    if (password) {
      user.password = password;
    }

    saveMockData('mock_users', users);
    return resolve(user);
  }

  // 9. USER TOGGLE ACTIVE (PUT /api/users/:id/toggle)
  const toggleMatch = path.match(/^\/api\/users\/(\d+)\/toggle$/);
  if (method === 'put' && toggleMatch) {
    const userId = parseInt(toggleMatch[1], 10);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return reject('User not found.', 404);
    }

    const user = users[userIndex];
    user.active = !user.active;
    saveMockData('mock_users', users);
    return resolve(user);
  }

  // 10. REPORTS
  if (method === 'get' && path.startsWith('/api/reports/')) {
    const type = path.split('/').pop();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const filterBranchId = urlParams.get('branchId') ? parseInt(urlParams.get('branchId'), 10) : null;
    
    const groupings = {};

    // Filter transactions by branch if specified
    const filteredTxs = filterBranchId 
      ? transactions.filter(t => t.branchId === filterBranchId)
      : transactions;

    filteredTxs.forEach(t => {
      let period = '';
      if (type === 'daily') {
        period = t.date;
      } else if (type === 'weekly') {
        const d = new Date(t.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        period = `Week of ${monday.toISOString().split('T')[0]}`;
      } else {
        const d = new Date(t.date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        period = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }

      if (!groupings[period]) {
        groupings[period] = {
          period,
          transactionCount: 0,
          totalKgWashed: 0,
          totalSoapUsed: 0,
          machineUsage: {},
          branchUsage: {}
        };
      }

      groupings[period].transactionCount += 1;
      groupings[period].totalKgWashed += (t.weightKg || 0);
      groupings[period].totalSoapUsed += (t.soapUsedQty || 0);

      if (t.machineNumber) {
        groupings[period].machineUsage[t.machineNumber] = (groupings[period].machineUsage[t.machineNumber] || 0) + 1;
      }
      if (t.branch?.name) {
        groupings[period].branchUsage[t.branch.name] = (groupings[period].branchUsage[t.branch.name] || 0) + 1;
      }
    });

    const reportData = Object.values(groupings);
    reportData.sort((a, b) => b.period.localeCompare(a.period));

    return resolve(reportData);
  }

  return reject(`Endpoint mock handler not found for: ${method.toUpperCase()} ${path}`, 404);
};

// Create real/mock Axios API client
let api;

if (USE_MOCK) {
  api = {
    get: (url, config) => handleMockRequest('get', url, null),
    post: (url, data, config) => handleMockRequest('post', url, data),
    put: (url, data, config) => handleMockRequest('put', url, data),
    delete: (url, config) => handleMockRequest('delete', url, null),
    interceptors: {
      request: { use: () => {} },
      response: { use: () => {} }
    }
  };
} else {
  api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add the JWT token
  api.interceptors.request.use(
    (config) => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiry or errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error Response Intercepted:", error.response || error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
