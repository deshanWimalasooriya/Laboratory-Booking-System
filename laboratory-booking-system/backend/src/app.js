const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const labRoutes = require('./routes/labRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);

module.exports = app;
