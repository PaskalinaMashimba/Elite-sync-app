const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes         = require('./routes/auth');
const serviceRoutes      = require('./routes/services');
const bookingRoutes      = require('./routes/bookings');
const businessRoutes     = require('./routes/businesses');
const analyticsRoutes    = require('./routes/analytics');
const availabilityRoutes = require('./routes/availability');
const adminRoutes        = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://elite-sync-app.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/services',     serviceRoutes);
app.use('/api/bookings',     bookingRoutes);
app.use('/api/businesses',   businessRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin',        adminRoutes);

// --- TEMPORARY ADMIN UPGRADE ROUTE ---
// 1. Deploy this code
// 2. Visit: https://elitesync-backend.onrender.com/api/make-me-super-admin-12345
// 3. Delete this block immediately after it works!
app.get('/api/make-me-super-admin-12345', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.update({
      where: { email: 'paskalinamashimba92@gmail.com' },
      data: { role: 'SUPER_ADMIN' },
    });
    res.json({ message: `Success! ${user.fullName} is now a ${user.role}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// -------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));