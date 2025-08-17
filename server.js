const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { rateLimit } = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://finance.event-connect.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FinancesPro Suisse API',
    version: '1.0.0',
    status: 'active'
  });
});

// Define API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/factures', require('./routes/facture.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});