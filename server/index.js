const express = require('express');
const cors = require('cors');
const zohoRoutes = require('./routes/zoho');

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/zoho', zohoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 