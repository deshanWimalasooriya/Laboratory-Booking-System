const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const labRoutes = require('./routes/lab');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lab', labRoutes); // <--- Use /api/lab everywhere

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
